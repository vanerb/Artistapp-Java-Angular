<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(CatalogSeeder::class);
        foreach ([1=>'Físico',2=>'Digital'] as $id=>$nombre) DB::table('tipo_producto')->updateOrInsert(['id'=>$id],['nombre'=>$nombre]);

        $adminEmail = env('ADMIN_EMAIL');
        $adminPassword = env('ADMIN_PASSWORD');
        if ($adminEmail && $adminPassword) {
            $adminUsername = env('ADMIN_USERNAME', 'admin');
            DB::table('usuarios')->updateOrInsert(
                ['correo' => strtolower(trim($adminEmail))],
                [
                    'nombre' => env('ADMIN_NAME', 'Administración'),
                    'apellidos' => 'ArtistApp',
                    'usuario' => $adminUsername,
                    'contrasena' => Hash::make($adminPassword),
                    'id_tipo' => 1,
                    'imagen' => 'media/no-user.png',
                    'biografia' => 'Cuenta de administración',
                ]
            );
        }
    }
}

