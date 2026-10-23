<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            1 => 'Administrador',
            3 => 'Organizador Eventos',
            5 => 'Artista',
            7 => 'Visitante',
        ] as $id => $nombre) {
            DB::table('tipo_usuario')->updateOrInsert(['id' => $id], ['nombre' => $nombre]);
        }

        foreach (['Anime', 'Manga', 'Cosplay', 'Cartoon', 'Realismo', 'Yuri', 'Yaoi', 'Diseños 3D', 'Comic'] as $nombre) {
            DB::table('categoria')->updateOrInsert(['nombre' => $nombre], ['nombre' => $nombre]);
        }
    }
}
