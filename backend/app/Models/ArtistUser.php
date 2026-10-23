<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;

class ArtistUser extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'usuarios';
    public $timestamps = false;
    protected $guarded = ['id'];
    protected $hidden = ['contrasena'];
    protected $casts = ['id' => 'integer', 'id_tipo' => 'integer'];

    public function getAuthPasswordName(): string { return 'contrasena'; }
    public function getAuthPassword(): string { return $this->contrasena; }
}
