namespace App\Http\Controllers;

use App\Services\UsuarioService;
use Illuminate\Http\Request;

class UsuarioController extends Controller
{
    protected $usuarioService;

    public function __construct(UsuarioService $usuarioService)
    {
        $this->usuarioService = $usuarioService;
    }

    // Obtener usuario por ID
    public function show($id)
    {
        $usuario = $this->usuarioService->getById($id);

        if (!$usuario) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        return response()->json($usuario);
    }

    // Crear un nuevo usuario
    public function store(Request $request)
    {
        $request->validate([
            'Email' => 'required|email|unique:Usuarios,Email',
            'Password' => 'required|min:6',
            'idRol' => 'required|integer',
            'Nombre' => 'required|string|max:100',
            'Imagen' => 'nullable|string',
        ]);

        try {
            $usuario = $this->usuarioService->create($request->all());
            return response()->json($usuario, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al crear usuario', 'detalle' => $e->getMessage()], 500);
        }
    }

    // Validar login
    public function login(Request $request)
    {
        $request->validate([
            'Email' => 'required|email',
            'Password' => 'required',
        ]);

        try {
            $data = $this->usuarioService->validateLogin(
                $request->input('Email'),
                $request->input('Password')
            );

            return response()->json([
                'message' => 'Login exitoso',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 401);
        }
    }
}
