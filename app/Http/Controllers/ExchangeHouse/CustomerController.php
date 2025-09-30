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
        
        $stats = [
            'total' => Customer::where('exchange_house_id', $exchangeHouseId)->count(),
            'vip' => Customer::where('exchange_house_id', $exchangeHouseId)->where('tier', 'vip')->count(),
            'regular' => Customer::where('exchange_house_id', $exchangeHouseId)->where('tier', 'regular')->count(),
            'new' => Customer::where('exchange_house_id', $exchangeHouseId)->where('tier', 'new')->count(),
            'inactive' => Customer::where('exchange_house_id', $exchangeHouseId)->where('tier', 'inactive')->count(),
            'total_volume' => Customer::where('exchange_house_id', $exchangeHouseId)->sum('total_volume'),
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
