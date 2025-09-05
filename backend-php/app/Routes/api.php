use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsuarioController;

Route::prefix('usuarios')->group(function () {
    Route::get('/{id}', [UsuarioController::class, 'show']);   // GET /usuarios/{id}
    Route::post('/', [UsuarioController::class, 'store']);     // POST /usuarios
    Route::post('/login', [UsuarioController::class, 'login']); // POST /usuarios/login
});
