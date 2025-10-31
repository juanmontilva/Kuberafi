<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    // Constantes de roles
    public const ROLE_SUPER_ADMIN = 'super_admin';
    public const ROLE_EXCHANGE_HOUSE = 'exchange_house';
    public const ROLE_OPERATOR = 'operator';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'exchange_house_id',
        'is_active',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    public function exchangeHouse()
    {
        return $this->belongsTo(ExchangeHouse::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function isSuperAdmin()
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isExchangeHouse()
    {
        return $this->role === self::ROLE_EXCHANGE_HOUSE;
    }

    public function isOperator()
    {
        return $this->role === self::ROLE_OPERATOR;
    }

    public function hasRole(...$roles)
    {
        return in_array($this->role, $roles);
    }
}
