<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InvoiceTypeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('invoice_types')->upsert([
            ['code'=>'A','description'=>'Factura A'],
            ['code'=>'B','description'=>'Factura B'],
            ['code'=>'C','description'=>'Factura C'],
            ['code'=>'NC A','description'=>'Nota de Crédito A'],
            ['code'=>'NC B','description'=>'Nota de Crédito B'],
        ], ['code']);
    }
}
