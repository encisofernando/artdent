// app/Services/UsuarioService.php
namespace App\Services;

use App\Models\Usuario;
use App\Models\Empresa;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsuarioService
{
    // Generar nuevo idBase
    public function generarIdBase()
    {
        $maxIdBase = Usuario::max('idBase');
        return ($maxIdBase ?? 0) + 1;
    }

    // Obtener usuario por ID
    public function getById($idUsuario)
    {
        return Usuario::find($idUsuario);
    }

    // Obtener usuario por Email
    public function getByEmail($email)
    {
        return Usuario::where('Email', $email)->first();
    }

    // Obtener empleado por Email (asumiendo que existe un modelo Empleado)
    public function getEmpleadoByEmail($email)
    {
        return DB::table('Empleados')
            ->select('idEmpleado', 'idBase', 'Email1 as Email', 'Password', 'idRol')
            ->where('Email1', $email)
            ->first();
    }

    // Crear nuevo usuario y empresa asociada
    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            $idBase = $this->generarIdBase();

            $empresa = Empresa::create([
                'RazonSocial' => "Razón Social de Prueba",
                'RptDir1' => "Dirección de Prueba 123",
                'RptDir2' => "Otra Dirección de Prueba",
                'RptTel' => "123456789",
                'CondIva' => 1,
                'CUIT' => "20-12345678-9",
                'NomComercial' => "Nombre Comercial",
                'IB' => "12345",
                'IniActividad' => now(),
                'NombreRubro' => "Rubro de Prueba",
                'Activo' => false,
                'Logo' => null,
                'AFIP_PEM' => null,
                'AFIP_CRT' => null,
                'AFIP_HabFE' => false,
                'AFIP_PuntoVenta' => null,
                'AFIP_VenceCRT' => null,
                'idBase' => $idBase,
            ]);

            $usuario = Usuario::create([
                'idBase' => $idBase,
                'idEmpresa' => $empresa->idEmpresa,
                'Email' => $data['Email'],
                'Password' => $data['Password'], // Hash automático gracias al mutator
                'idRol' => $data['idRol'],
                'Nombre' => $data['Nombre'],
                'Imagen' => $data['Imagen'] ?? null,
            ]);

            return [
                'idUsuario' => $usuario->idUsuario,
                'Email' => $usuario->Email,
                'idRol' => $usuario->idRol,
                'idBase' => $usuario->idBase,
                'idEmpresa' => $empresa->idEmpresa,
            ];
        });
    }

    // Validar login
    public function validateLogin($email, $password)
    {
        $user = $this->getByEmail($email);

        if (!$user) {
            $user = $this->getEmpleadoByEmail($email);
            if (!$user) {
                throw new \Exception('Usuario no encontrado');
            }
        }

        if (!$user->Password || !$password) {
            throw new \Exception('La contraseña no está disponible.');
        }

        if (!Hash::check($password, $user->Password)) {
            throw new \Exception('Contraseña incorrecta');
        }

        return [
            'idUsuario' => $user->idUsuario ?? null,
            'idEmpleado' => $user->idEmpleado ?? null,
            'idBase' => $user->idBase,
            'idRol' => $user->idRol,
        ];
    }
}
