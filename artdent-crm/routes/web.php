<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// --- Auto-generated Controllers Imports ---
use App\Http\Controllers\BranchController;
use App\Http\Controllers\CashDrawerController;
use App\Http\Controllers\CashMovementController;
use App\Http\Controllers\CashSessionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ClientesController;
use App\Http\Controllers\CollaboratorAttendanceController;
use App\Http\Controllers\CollaboratorController;
use App\Http\Controllers\CollaboratorDiscountController;
use App\Http\Controllers\CollaboratorExtraController;
use App\Http\Controllers\CollaboratorReceiptController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ComprasController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\CouponUsageController;
use App\Http\Controllers\CrmClientController;
use App\Http\Controllers\CustomerAddressController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DentistController;
use App\Http\Controllers\DentistTariffPriceController;
use App\Http\Controllers\EcommerceOrderController;
use App\Http\Controllers\EcommerceOrderItemController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ExpenseCategoryController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\IncomeRecordController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\InvoiceItemController;
use App\Http\Controllers\InvoiceTypeController;
use App\Http\Controllers\JobAttachmentController;
use App\Http\Controllers\JobCollaboratorController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\JobItemController;
use App\Http\Controllers\JobStatusHistoryController;
use App\Http\Controllers\JobTeethController;
use App\Http\Controllers\JobTypeController;
use App\Http\Controllers\LabAccountController;
use App\Http\Controllers\LabAccountMoveController;
use App\Http\Controllers\LaboratorioController;
use App\Http\Controllers\NewsletterSubscriberController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\ProductAttributeController;
use App\Http\Controllers\ProductAttributeValueController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductImageController;
use App\Http\Controllers\ProductVariantController;
use App\Http\Controllers\ProductosController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\PurchaseItemController;
use App\Http\Controllers\ReportesController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SaleItemController;
use App\Http\Controllers\SalePaymentController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\ShippingMethodController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\TariffController;
use App\Http\Controllers\TaxController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VariantAttributeValueController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\VentasController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\WishlistController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    // --- Auto-generated Resource Routes ---
    Route::resource('branchs', BranchController::class);
    Route::resource('cash-drawers', CashDrawerController::class);
    Route::resource('cash-movements', CashMovementController::class);
    Route::resource('cash-sessions', CashSessionController::class);
    Route::resource('categorys', CategoryController::class);
    Route::resource('clientes', ClientesController::class);
    Route::resource('collaborator-attendances', CollaboratorAttendanceController::class);
    Route::resource('collaborators', CollaboratorController::class);
    Route::resource('collaborator-discounts', CollaboratorDiscountController::class);
    Route::resource('collaborator-extras', CollaboratorExtraController::class);
    Route::resource('collaborator-receipts', CollaboratorReceiptController::class);
    Route::resource('companys', CompanyController::class);
    Route::resource('compras', ComprasController::class);
    Route::resource('coupons', CouponController::class);
    Route::resource('coupon-usages', CouponUsageController::class);
    Route::resource('crm-clients', CrmClientController::class);
    Route::resource('customer-address', CustomerAddressController::class);
    Route::resource('customers', CustomerController::class);
    Route::resource('dashboards', DashboardController::class);
    Route::resource('dentists', DentistController::class);
    Route::resource('dentist-tariff-prices', DentistTariffPriceController::class);
    Route::resource('ecommerce-orders', EcommerceOrderController::class);
    Route::resource('ecommerce-order-items', EcommerceOrderItemController::class);
    Route::resource('employees', EmployeeController::class);
    Route::resource('expense-categorys', ExpenseCategoryController::class);
    Route::resource('expenses', ExpenseController::class);
    Route::resource('income-records', IncomeRecordController::class);
    Route::resource('invoices', InvoiceController::class);
    Route::resource('invoice-items', InvoiceItemController::class);
    Route::resource('invoice-types', InvoiceTypeController::class);
    Route::resource('job-attachments', JobAttachmentController::class);
    Route::resource('job-collaborators', JobCollaboratorController::class);
    Route::resource('jobs', JobController::class);
    Route::resource('job-items', JobItemController::class);
    Route::resource('job-status-historys', JobStatusHistoryController::class);
    Route::resource('job-teeths', JobTeethController::class);
    Route::resource('job-types', JobTypeController::class);
    Route::resource('lab-accounts', LabAccountController::class);
    Route::resource('lab-account-moves', LabAccountMoveController::class);
    Route::resource('laboratorios', LaboratorioController::class);
    Route::resource('newsletter-subscribers', NewsletterSubscriberController::class);
    Route::resource('notifications', NotificationController::class);
    Route::resource('patients', PatientController::class);
    Route::resource('payment-methods', PaymentMethodController::class);
    Route::resource('product-attributes', ProductAttributeController::class);
    Route::resource('product-attribute-values', ProductAttributeValueController::class);
    Route::resource('products', ProductController::class);
    Route::resource('product-images', ProductImageController::class);
    Route::resource('product-variants', ProductVariantController::class);
    Route::resource('productos', ProductosController::class);
    Route::resource('purchases', PurchaseController::class);
    Route::resource('purchase-items', PurchaseItemController::class);
    Route::resource('reportes', ReportesController::class);
    Route::resource('reviews', ReviewController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('sales', SaleController::class);
    Route::resource('sale-items', SaleItemController::class);
    Route::resource('sale-payments', SalePaymentController::class);
    Route::resource('shipments', ShipmentController::class);
    Route::resource('shipping-methods', ShippingMethodController::class);
    Route::resource('stocks', StockController::class);
    Route::resource('stock-movements', StockMovementController::class);
    Route::resource('tariffs', TariffController::class);
    Route::resource('taxs', TaxController::class);
    Route::resource('users', UserController::class);
    Route::resource('variant-attribute-values', VariantAttributeValueController::class);
    Route::resource('vendors', VendorController::class);
    Route::resource('ventas', VentasController::class);
    Route::resource('warehouses', WarehouseController::class);
    Route::resource('wishlists', WishlistController::class);

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
