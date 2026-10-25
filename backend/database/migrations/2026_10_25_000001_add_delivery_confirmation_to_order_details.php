<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('detalles_pedido', 'estado_envio')) {
            Schema::table('detalles_pedido', function (Blueprint $table): void {
                $table->string('estado_envio')->default('preparando');
            });
        }
        if (!Schema::hasColumn('detalles_pedido', 'recibido_confirmado_at')) {
            Schema::table('detalles_pedido', function (Blueprint $table): void {
                $table->timestamp('recibido_confirmado_at')->nullable();
            });
        }

        // Conserva el estado de los pedidos que ya existían antes de esta migración.
        foreach (DB::table('pedidos')->select('id', 'estado')->get() as $order) {
            $state = in_array($order->estado, ['preparando', 'enviado', 'entregado'], true)
                ? $order->estado
                : 'preparando';
            $update = ['estado_envio' => $state];
            if ($state === 'entregado') {
                $update['recibido_confirmado_at'] = now();
            }
            DB::table('detalles_pedido')->where('id_pedido', $order->id)->update($update);
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('detalles_pedido', 'recibido_confirmado_at')) {
            Schema::table('detalles_pedido', fn (Blueprint $table) => $table->dropColumn('recibido_confirmado_at'));
        }
        if (Schema::hasColumn('detalles_pedido', 'estado_envio')) {
            Schema::table('detalles_pedido', fn (Blueprint $table) => $table->dropColumn('estado_envio'));
        }
    }
};
