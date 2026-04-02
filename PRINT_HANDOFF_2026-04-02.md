# Print Handoff 2026-04-02

## Base commit

- Current repo base commit: `408e8dac9dce1edc9040475af9d5ff70834b40b2`
- `git log -1 --oneline --decorate`:
  `408e8da (HEAD -> main, origin/main, origin/HEAD) Set ArtDent icon as favicon across CRM views`
- The print changes from this session are still uncommitted and sit on top of that commit.

## Local files changed for this task

- `artdent-crm/resources/js/lib/print.js`
- `artdent-crm/resources/js/Pages/Sale/Show.jsx`
- `artdent-crm/resources/js/Pages/Sale/Create.jsx`
- `electron-print-server/main.js`

## Other local dirty files seen in the worktree

These were present in the worktree and were not the main target of the ticket-size fix:

- `electron-print-server/dist/builder-effective-config.yaml`
- `electron-print-server/dist/win-unpacked/resources/app.asar`
- `electron-print-server/package-lock.json`

## What was changed locally

1. `artdent-crm/resources/js/Pages/Sale/Show.jsx`
   - Replaced inline thermal values with shared helpers:
   - `zoneWidth: getThermalZoneWidth(mode)`
   - `zoom: getThermalPrintZoom(mode)`

2. `artdent-crm/resources/js/Pages/Sale/Create.jsx`
   - Same change as `Sale/Show.jsx`.

3. `artdent-crm/resources/js/lib/print.js`
   - Restored the original working behavior for `57mm`.
   - Left `80mm` at `1x` temporarily to isolate the oversized print issue.
   - Current logic:
   - `getThermalPrintZoom(mode) => normalizePrintMode(mode) === '57mm' ? 388 / 180 : 1`

4. `electron-print-server/main.js`
   - Added HTML normalization helpers.
   - Important: the direct-print normalization is now skipped for `57mm` and only applied to non-57 modes.
   - Important: Linux ESC/POS capture also preserves `57mm` and only normalizes non-57 modes.
   - `node --check electron-print-server/main.js` passed.

## Why this was done

- `57mm` was the known-good behavior and adapted correctly to paper width.
- A previous shared-helper patch had also neutralized `57mm`, which was a mistake.
- The current state restores `57mm` to its original scale and isolates the investigation on `80mm`.

## Production changes already applied on the VPS

- VPS SSH:
  `ssh -p5243 root@149.50.143.129`
- App path:
  `/home/fer/web/pos.artdent.com.ar/public_html`

Files patched on the VPS:

- Source:
  - `/home/fer/web/pos.artdent.com.ar/public_html/resources/js/lib/print.js`

- Active built assets:
  - `/home/fer/web/pos.artdent.com.ar/public_html/public/build/assets/print-GVSfxdv2.js`
  - `/home/fer/web/pos.artdent.com.ar/public_html/public/build/assets/Show-3RdD_Gvr.js`
  - `/home/fer/web/pos.artdent.com.ar/public_html/public/build/assets/Create-CIbt14VK.js`

Backups created on the VPS during this work:

- `/home/fer/web/pos.artdent.com.ar/public_html/resources/js/lib/print.js.bak-20260402_110044`
- `/home/fer/web/pos.artdent.com.ar/public_html/public/build/assets/print-GVSfxdv2.js.bak-20260402_110044`
- `/home/fer/web/pos.artdent.com.ar/public_html/public/build/assets/Show-3RdD_Gvr.js.bak-20260402_110202`
- `/home/fer/web/pos.artdent.com.ar/public_html/public/build/assets/Create-CIbt14VK.js.bak-20260402_110202`

## Production verification already done

Origin files on the VPS now contain:

- helper asset:
  - `S=t=>f(t)==="57mm"?388/180:1`
- Sale Show asset:
  - `zoom:B?388/180:1`
- Sale Create asset:
  - `zoom:a?388/180:1`

Important production finding:

- The normal public URLs are still being served from Cloudflare cache with `cf-cache-status: HIT`.
- When requested with a cache-busting query string, the origin responds with the updated content and `cf-cache-status: MISS`.

That means:

- Origin is patched correctly.
- Users may still receive the old JS until Cloudflare cache is purged or the asset URL changes.

## Current working conclusion

1. `57mm` should remain as the original known-good format.
2. `80mm` is the mode that still needs isolation and validation.
3. If production still prints huge right now, the first likely blocker is stale Cloudflare cache.
4. If the problem remains after cache purge or versioned assets, the next likely blocker is the Windows `electron-print-server` build actually installed on the printing PC.

## Recommended next steps

1. Purge Cloudflare cache for the affected assets or deploy new versioned asset filenames.
2. Re-test `57mm` and `80mm` after cache purge.
3. If `80mm` still prints too large, inspect the installed `electron-print-server` on the workstation:
   - confirm it is running the updated `main.js` logic
   - rebuild/reinstall if needed
   - compare the Windows direct-print path against the original `57mm` behavior
4. Do not change `57mm` behavior again unless a real regression is proven.

## Prompt to continue from another PC

Use this prompt with Codex on the other machine:

```text
Continue debugging ArtDent thermal ticket printing using the handoff file at:

C:\\Users\\Usuario\\Documents\\SOFTWARE\\artdent\\PRINT_HANDOFF_2026-04-02.md

Repo root:
C:\\Users\\Usuario\\Documents\\SOFTWARE\\artdent

Important context:
- Base commit for the current local work is:
  408e8dac9dce1edc9040475af9d5ff70834b40b2
- HEAD/origin.main currently point to:
  408e8da Set ArtDent icon as favicon across CRM views
- The print changes are not committed yet.
- The known-good format is 57mm.
- The broken format is 80mm, which prints too large and does not adapt to paper width.
- Production origin on the VPS has already been patched, but Cloudflare may still be serving stale cached assets on the normal URLs.

Your job:
1. Read the handoff file first and validate that the local diff still matches the expected changes in:
   - artdent-crm/resources/js/lib/print.js
   - artdent-crm/resources/js/Pages/Sale/Show.jsx
   - artdent-crm/resources/js/Pages/Sale/Create.jsx
   - electron-print-server/main.js
2. Do not regress 57mm. Keep its original scaling behavior.
3. Verify whether production is still serving stale JS through Cloudflare cache.
4. If needed, purge cache or switch to versioned assets so the browser loads the patched JS.
5. Re-test 80mm behavior after cache is no longer stale.
6. If 80mm still prints too large, move focus to the installed Windows electron-print-server build:
   - verify the running app actually contains the updated main.js logic
   - rebuild/reinstall if necessary
   - inspect the Windows direct-print path and compare it with the original 57mm behavior
7. Keep all changes minimal and focused on the thermal print width issue.

At the end, report:
- what you verified
- what files you changed
- whether Cloudflare cache was the blocker
- whether the installed Windows print server was outdated
- and the next exact step if 80mm is still not fixed
```
