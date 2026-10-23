<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('app_notifications')) Schema::create('app_notifications', function (Blueprint $table): void {
            $table->id(); $table->unsignedBigInteger('user_id')->index(); $table->string('type', 40);
            $table->string('title', 180); $table->text('message'); $table->string('link', 255)->nullable();
            $table->timestamp('read_at')->nullable(); $table->timestamps();
        });
        if (!Schema::hasTable('publication_comments')) Schema::create('publication_comments', function (Blueprint $table): void {
            $table->id(); $table->unsignedBigInteger('publication_id')->index(); $table->unsignedBigInteger('user_id')->index();
            $table->string('body', 1000); $table->timestamps();
        });
        if (!Schema::hasTable('event_chat_messages')) Schema::create('event_chat_messages', function (Blueprint $table): void {
            $table->id(); $table->unsignedBigInteger('event_id')->index(); $table->unsignedBigInteger('user_id')->index();
            $table->string('body', 1000); $table->timestamps();
        });
        if (!Schema::hasTable('direct_messages')) Schema::create('direct_messages', function (Blueprint $table): void {
            $table->id(); $table->unsignedBigInteger('sender_id')->index(); $table->unsignedBigInteger('recipient_id')->index();
            $table->string('body', 1000); $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('direct_messages');
        Schema::dropIfExists('event_chat_messages');
        Schema::dropIfExists('publication_comments');
        Schema::dropIfExists('app_notifications');
    }
};
