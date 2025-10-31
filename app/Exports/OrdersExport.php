<?php

namespace App\Exports;

use App\Models\Order;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class OrdersExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function query()
    {
        return $this->query->with(['currencyPair', 'customer', 'user', 'exchangeHouse']);
    }

    public function headings(): array
    {
        return [
            'Número de Orden',
            'Fecha',
            'Hora',
            'Casa de Cambio',
            'Operador',
            'Cliente',
            'Par de Divisas',
            'Monto Base',
            'Moneda Base',
            'Monto Cotizado',
            'Moneda Cotizada',
            'Tasa de Cambio',
            'Comisión Casa (%)',
            'Comisión Casa ($)',
            'Comisión Plataforma ($)',
            'Estado',
            'Notas',
        ];
    }

    public function map($order): array
    {
        return [
            $order->order_number,
            $order->created_at->format('Y-m-d'),
            $order->created_at->format('H:i:s'),
            $order->exchangeHouse->name ?? 'N/A',
            $order->user->name ?? 'N/A',
            $order->customer->name ?? 'Sin cliente',
            $order->currencyPair->base_currency . '/' . $order->currencyPair->quote_currency,
            $order->base_amount,
            $order->currencyPair->base_currency,
            $order->quote_amount,
            $order->currencyPair->quote_currency,
            $order->exchange_rate,
            $order->house_commission_percent,
            $order->exchange_commission,
            $order->platform_commission,
            $this->getStatusText($order->status),
            $order->notes ?? '',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    private function getStatusText($status): string
    {
        return match($status) {
            'completed' => 'Completada',
            'pending' => 'Pendiente',
            'cancelled' => 'Cancelada',
            default => $status,
        };
    }
}
