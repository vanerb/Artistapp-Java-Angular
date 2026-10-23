<?php

namespace App\Console\Commands;

use Database\Seeders\CatalogSeeder;
use Illuminate\Console\Command;

class SetupCatalogs extends Command
{
    protected $signature = 'artistapp:setup-catalogs';

    protected $description = 'Crea las tablas pendientes y carga los tipos de usuario y categorías de ArtistApp.';

    public function handle(): int
    {
        if ($this->call('migrate', ['--force' => true]) !== self::SUCCESS) {
            return self::FAILURE;
        }

        if ($this->call('db:seed', ['--class' => CatalogSeeder::class, '--force' => true]) !== self::SUCCESS) {
            return self::FAILURE;
        }

        $this->components->info('Tipos de usuario y categorías preparados.');

        return self::SUCCESS;
    }
}
