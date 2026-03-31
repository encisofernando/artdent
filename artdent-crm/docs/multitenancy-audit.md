# Multi-Tenancy Audit

Date: 2026-03-23

## Target architecture

- Central database: `artdent_admin`
- Tenant registry key: `dev`
- Tenant database name: `artdent_dev`
- Database resolution rule: `artdent_` + tenant id

## Verified code paths

- Central tenancy metadata is read through `App\Models\Tenant`.
- Central plans are read through `App\Models\Plan`.
- Central subscriptions are read and written through `App\Models\TenantSubscription`.
- Central login routing is resolved through `App\Models\UserTenantMap`.
- Tenant-aware login initializes tenancy before authenticating.
- Central user-to-tenant mapping is synchronized by `tenant:sync-user-map`.

## Central tables confirmed as active

- `tenants`
- `domains`
- `plans`
- `tenant_subscriptions`
- `user_tenant_map`
- `sessions`
- `cache`
- `cache_locks`
- `jobs`
- `failed_jobs`
- `job_batches`
- `users`
- `password_reset_tokens`
- `migrations`

Notes:

- `users` and `password_reset_tokens` should be kept in central if `artdent-admin` authenticates against `artdent_admin`.
- Framework infrastructure tables such as `sessions`, `cache`, `cache_locks`, `jobs`, `failed_jobs`, and `job_batches` are valid in central.

## Tenant tables confirmed as active

- Business tables such as `sales`, `customers`, `products`, `invoices`, `jobs`, `companies`, `roles`, `permissions`, etc.
- `password_reset_tokens` is present in the tenant and should be treated as tenant user auth data.
- `customer_password_reset_tokens` is tenant-specific and valid.

Notes:

- The `jobs` table in `artdent_dev` is a business table, not the Laravel queue table. Its schema is different from `artdent_admin.jobs`.

## Legacy or suspicious tables

### Safe cleanup candidates

- `artdent_admin.subscriptions`
  - No code references found.
  - Row count: `0`
  - Replaced by `tenant_subscriptions`.

- `artdent_dev.tenant_subscriptions`
  - Centralized design now uses `artdent_admin.tenant_subscriptions`.
  - Row count: `0`

### Cleanup candidates with caution

- `artdent_dev.sessions`
  - Row count observed: `2`
  - Current runtime config points sessions to central, but this table contains historic data.

- `artdent_dev.cache`
  - Row count observed: `2`
  - Current runtime cache store points to central, but this table contains historic data.

- `artdent_dev.cache_locks`
  - Row count observed: `0`
  - Likely historic infrastructure residue.

- `artdent_dev.failed_jobs`
  - Row count observed: `0`
  - Likely historic infrastructure residue.

## Migration audit

- Central SaaS migrations live in `artdent-admin/database/migrations`.
- CRM framework infrastructure migrations that still belong to the CRM runtime live in `artdent-crm/database/migrations`.
- Tenant business migrations live in `artdent-crm/database/migrations/tenant`.
- `php artisan migrate` for central metadata should be run from `artdent-admin`.
- `php artisan tenant:sync-user-map --fresh` successfully rebuilt the central login map from tenant data.

## Cleanup recommendation

1. Rename any legacy `artdent_admin.subscriptions` table to `artdent_admin.tenant_subscriptions`.
2. Drop `artdent_dev.tenant_subscriptions`.
3. Leave `artdent_dev.sessions`, `artdent_dev.cache`, `artdent_dev.cache_locks`, and `artdent_dev.failed_jobs` for a second cleanup pass after a safe observation window.

## Operating rules

- `artdent_admin` is the central database. Do not run tenant business migrations there.
- `artdent_dev` is the database for tenant id `dev`. Do not treat its database name as the tenant id.
- The tenant id is stored in `tenants.id` and used to build the database name using `TENANCY_DB_PREFIX` and `TENANCY_DB_SUFFIX`.
- Session and cache infrastructure for the CRM currently live in central, not in tenant databases.
- Protected CRM web routes must keep `tenant.session` before `auth`.
- Guest auth routes must keep `tenant.session` before `guest`.

## Safe commands

- Central migrations: from `artdent-admin` → `php artisan migrate`
- Tenant migrations for all tenants: `php artisan tenants:migrate`
- Tenant migrations for one tenant: `php artisan tenants:migrate --tenants=dev`
- Rebuild central login map: `php artisan tenant:sync-user-map --fresh`
- Provision a tenant: `php artisan tenant:provision dev --name="ArtDent Dev" --email="admin@artdent.com.ar"`

## Pre-deploy checklist

1. Confirm `.env` has `DB_CONNECTION=central`.
2. Confirm `.env` has `SESSION_CONNECTION=central` and `DB_CACHE_CONNECTION=central`.
3. Confirm `TENANCY_DB_PREFIX=artdent_`.
4. Run `php artisan optimize:clear`.
5. Run `php artisan migrate` from `artdent-admin`.
6. Run `php artisan tenants:migrate`.
7. Verify login with a tenant user.
