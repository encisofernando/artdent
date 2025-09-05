// app/Models/Usuario.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class Usuario extends Model
{
    use HasFactory;

    protected $table = 'Usuarios';
    protected $primaryKey = 'idUsuario';
    public $timestamps = false;

    protected $fillable = [
        'idBase',
        'idEmpresa',
        'Email',
        'Password',
        'idRol',
        'Nombre',
        'Imagen',
    ];

    // Relación con Empresa
    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'idEmpresa', 'idEmpresa');
    }

    // Encriptar automáticamente la contraseña al guardar
    public function setPasswordAttribute($value)
    {
        $this->attributes['Password'] = Hash::make($value);
    }
}
