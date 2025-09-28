<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ExchangeHouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    public function create()
    {
        $user = request()->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403, 'Solo el Super Administrador puede crear usuarios');
        }

        $exchangeHouses = ExchangeHouse::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/CreateUser', [
            'exchangeHouses' => $exchangeHouses,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403, 'Solo el Super Administrador puede crear usuarios');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:super_admin,exchange_house,operator',
            'exchange_house_id' => 'nullable|exists:exchange_houses,id',
        ]);

        // Validar que si el rol es exchange_house u operator, debe tener exchange_house_id
        if (in_array($validated['role'], ['exchange_house', 'operator']) && !$validated['exchange_house_id']) {
            return back()->withErrors([
                'exchange_house_id' => 'Debe seleccionar una casa de cambio para este rol.'
            ]);
        }

        // Validar que si el rol es super_admin, no debe tener exchange_house_id
        if ($validated['role'] === 'super_admin' && $validated['exchange_house_id']) {
            $validated['exchange_house_id'] = null;
        }

        $newUser = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'exchange_house_id' => $validated['exchange_house_id'],
            'email_verified_at' => now(), // Auto-verificar emails creados por admin
        ]);

        return redirect()->route('admin.users')
            ->with('success', 'Usuario creado exitosamente');
    }

    public function edit(User $user)
    {
        $currentUser = request()->user();
        
        if (!$currentUser->isSuperAdmin()) {
            abort(403, 'Solo el Super Administrador puede editar usuarios');
        }

        $exchangeHouses = ExchangeHouse::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/EditUser', [
            'user' => $user->load('exchangeHouse:id,name'),
            'exchangeHouses' => $exchangeHouses,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $currentUser = $request->user();
        
        if (!$currentUser->isSuperAdmin()) {
            abort(403, 'Solo el Super Administrador puede actualizar usuarios');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:super_admin,exchange_house,operator',
            'exchange_house_id' => 'nullable|exists:exchange_houses,id',
            'is_active' => 'boolean',
        ]);

        // Validar que si el rol es exchange_house u operator, debe tener exchange_house_id
        if (in_array($validated['role'], ['exchange_house', 'operator']) && !$validated['exchange_house_id']) {
            return back()->withErrors([
                'exchange_house_id' => 'Debe seleccionar una casa de cambio para este rol.'
            ]);
        }

        // Validar que si el rol es super_admin, no debe tener exchange_house_id
        if ($validated['role'] === 'super_admin' && $validated['exchange_house_id']) {
            $validated['exchange_house_id'] = null;
        }

        // Preparar datos para actualizar
        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'exchange_house_id' => $validated['exchange_house_id'],
            'is_active' => $validated['is_active'] ?? true,
        ];

        // Solo actualizar password si se proporcionó uno nuevo
        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()->route('admin.users')
            ->with('success', 'Usuario actualizado exitosamente');
    }

    public function destroy(User $user)
    {
        $currentUser = request()->user();
        
        if (!$currentUser->isSuperAdmin()) {
            abort(403, 'Solo el Super Administrador puede eliminar usuarios');
        }

        // Prevenir que el super admin se elimine a sí mismo
        if ($user->id === $currentUser->id) {
            return back()->withErrors([
                'error' => 'No puedes eliminar tu propia cuenta.'
            ]);
        }

        $user->delete();

        return redirect()->route('admin.users')
            ->with('success', 'Usuario eliminado exitosamente');
    }
}