<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        $tables = [
            'tipo_usuario' => fn (Blueprint $t) => [$t->id(), $t->string('nombre')],
            'tipo_producto' => fn (Blueprint $t) => [$t->id(), $t->string('nombre')],
            'categoria' => fn (Blueprint $t) => [$t->id(), $t->string('nombre')],
            'usuarios' => fn (Blueprint $t) => [$t->id(), $t->string('nombre'), $t->string('apellidos'), $t->string('usuario')->unique(), $t->string('correo')->unique(), $t->string('contrasena'), $t->unsignedBigInteger('id_tipo')->index(), $t->string('imagen')->default('media/no-user.png'), $t->string('biografia')->default('')],
            'publicaciones' => fn (Blueprint $t) => [$t->id(), $t->string('titulo'), $t->string('descripcion'), $t->string('tipo')->default('public'), $t->unsignedBigInteger('id_categoria')->index(), $t->unsignedBigInteger('id_usuario')->index(), $t->unsignedInteger('megusta')->default(0), $t->string('imagen')->default('')],
            'eventos' => fn (Blueprint $t) => [$t->id(), $t->string('nombre'), $t->string('ubicacion'), $t->string('link')->default(''), $t->date('fecha_inicio'), $t->date('fecha_fin'), $t->unsignedBigInteger('id_usuario')->index(), $t->string('imagen')->default('')],
            'listado_evento' => fn (Blueprint $t) => [$t->id(), $t->unsignedBigInteger('id_evento')->index(), $t->unsignedBigInteger('id_usuario')->index(), $t->string('estado')->default('pendiente')],
            'productos' => fn (Blueprint $t) => [$t->id(), $t->string('nombre'), $t->string('descripcion'), $t->decimal('precio', 10, 2), $t->integer('cantidad')->default(0), $t->string('imagen')->default(''), $t->unsignedBigInteger('id_tipo')->index(), $t->unsignedBigInteger('id_usuario')->index(), $t->string('archivos')->default('')],
            'cesta' => fn (Blueprint $t) => [$t->id(), $t->unsignedBigInteger('id_usuario')->unique()],
            'cesta_producto' => fn (Blueprint $t) => [$t->id(), $t->unsignedBigInteger('id_cesta')->index(), $t->unsignedBigInteger('id_producto')->index()],
            'pedidos' => fn (Blueprint $t) => [$t->id(), $t->unsignedBigInteger('id_usuario')->index(), $t->string('nombre'), $t->string('estado')->default('preparando'), $t->string('direccion'), $t->string('telefono', 32), $t->decimal('pago', 10, 2)],
            'detalles_pedido' => fn (Blueprint $t) => [$t->id(), $t->unsignedBigInteger('id_pedido')->index(), $t->unsignedBigInteger('id_producto')->index()],
            'avisos' => fn (Blueprint $t) => [$t->id(), $t->string('titulo'), $t->string('aviso'), $t->date('fecha_publicacion'), $t->unsignedBigInteger('id_usuario')->index(), $t->time('hora')],
            'favoritos' => fn (Blueprint $t) => [$t->id(), $t->unsignedBigInteger('id_usuario')->index(), $t->unsignedBigInteger('id_usuariopin')->index()],
            'megusta' => fn (Blueprint $t) => [$t->id(), $t->unsignedBigInteger('id_usuario')->index(), $t->unsignedBigInteger('id_publicacion')->index(), $t->unsignedTinyInteger('megusta')->default(0)],
            'informes' => fn (Blueprint $t) => [$t->id(), $t->unsignedBigInteger('id_usuario')->index(), $t->string('informe'), $t->unsignedBigInteger('id_usuarioreferenciado')->index(), $t->string('estado')->default('pendiente')],
        ];

        foreach ($tables as $name => $definition) {
            if (!Schema::hasTable($name)) Schema::create($name, $definition);
        }

        if (!Schema::hasTable('personal_access_tokens')) {
            Schema::create('personal_access_tokens', function (Blueprint $table): void {
                $table->id(); $table->morphs('tokenable'); $table->string('name'); $table->string('token', 64)->unique();
                $table->text('abilities')->nullable(); $table->timestamp('last_used_at')->nullable(); $table->timestamp('expires_at')->nullable(); $table->timestamps();
            });
        }
        if (!Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', function (Blueprint $table): void {
                $table->string('email')->primary(); $table->string('token'); $table->timestamp('created_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        // Las tablas de dominio pueden haber sido importadas del proyecto antiguo.
        // El rollback solo retira el soporte añadido por esta migración; nunca borra datos heredados.
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('personal_access_tokens');
    }
};
