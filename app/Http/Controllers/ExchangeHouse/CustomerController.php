<?php

namespace App\Http\Controllers\ExchangeHouse;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;
        
        $customers = Customer::where('exchange_house_id', $exchangeHouseId)
            ->orderBy('total_volume', 'desc')
            ->paginate(20);
        
        // OPTIMIZADO: Una sola query para contar por tier
        $tierStats = Customer::where('exchange_house_id', $exchangeHouseId)
            ->selectRaw('
                COUNT(*) as total,
                COUNT(CASE WHEN tier = \'vip\' THEN 1 END) as vip,
                COUNT(CASE WHEN tier = \'regular\' THEN 1 END) as regular,
                COUNT(CASE WHEN tier = \'new\' THEN 1 END) as new,
                COUNT(CASE WHEN tier = \'inactive\' THEN 1 END) as inactive,
                COALESCE(SUM(total_volume), 0) as total_volume
            ')
            ->first();
        
        $stats = [
            'total' => $tierStats->total,
            'vip' => $tierStats->vip,
            'regular' => $tierStats->regular,
            'new' => $tierStats->new,
            'inactive' => $tierStats->inactive,
            'total_volume' => $tierStats->total_volume,
        ];
        
        return Inertia::render('ExchangeHouse/Customers', [
            'customers' => $customers,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
