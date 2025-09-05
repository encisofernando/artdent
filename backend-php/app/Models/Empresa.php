// app/Models/Empresa.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    use HasFactory;

    protected $table = 'Empresas';
    protected $primaryKey = 'idEmpresa';
    public $timestamps = false;

    protected $fillable = [
        'RazonSocial',
        'RptDir1',
        'RptDir2',
        'RptTel',
        'CondIva',
        'CUIT',
        'NomComercial',
        'IB',
        'IniActividad',
        'NombreRubro',
        'Activo',
        'Logo',
        'AFIP_PEM',
        'AFIP_CRT',
        'AFIP_HabFE',
        'AFIP_PuntoVenta',
        'AFIP_VenceCRT',
        'idBase',
    ];

    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'idEmpresa', 'idEmpresa');
    }
}
