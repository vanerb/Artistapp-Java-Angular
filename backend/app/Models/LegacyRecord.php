<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

abstract class LegacyRecord extends Model
{
    public $timestamps = false;
    protected $guarded = ['id'];
}
