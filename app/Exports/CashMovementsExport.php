<?php

namespace App\Exports;

use App\Models\CashMovement;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Facades\Request;

class CashMovementsExport implements FromQuery, WithHeadings, WithMapping, WithStyles, WithColumnWidths
{
    protected $operatorId;
    protected $filters;

    public function __construct($operatorId, $filters = [])
    {
        $this->operatorId = $operatorId;
        $this->filters = $filters;
    }

    public function query()
    {
        $query = CashMovement::query()
            ->where('operator_id', $this->operatorId)
            ->with(['paymentMethod', 'order', 'user']);

        // Aplicar filtros
        if (!empty($this->filters['payment_method'])) {
            $query->where('payment_method_id', $this->filters['payment_method']);
        }

        if (!empty($this->filters['currency'])) {
            $query->where('currency', $this->filters['currency']);
        }

        if (!empty($this->filters['type'])) {
            $query->where('type', $this->filters['type']);
        }

        if (!empty($this->filters['date_from'])) {
            $query->whereDate('created_at', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('created_at', '<=', $this->filters['date_to']);
        }

        return $query->orderBy('created_at', 'desc');
    }

    public function headings(): array
    {
        return [
            'ID',
            'Fecha',
            'Tipo',
            'Método de Pago',
            'Moneda',
            'Monto',
            'Balance Anterior',
            'Balance Final',
            'Orden',
            'Descripción',
            'Registrado Por',
        ];
    }

    public function map($movement): array
    {
        $typeLabels = [
            'deposit' => 'Depósito',
            'withdrawal' => 'Retiro',
            'order_in' => 'Entrada (Orden)',
            'order_out' => 'Salida (Orden)',
            'adjustment' => 'Ajuste',
        ];

        return [
            $movement->id,
            $movement->created_at->format('d/m/Y H:i:s'),
            $typeLabels[$movement->type] ?? $movement->type,
            $movement->paymentMethod->name ?? 'N/A',
            $movement->currency,
            $movement->amount,
            $movement->balance_before,
            $movement->balance_after,
            $movement->order ? $movement->order->order_number : 'N/A',
            $movement->description ?? 'Sin descripción',
            $movement->user->name ?? 'N/A',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4F46E5']
                ],
            ],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 8,   // ID
            'B' => 20,  // Fecha
            'C' => 18,  // Tipo
            'D' => 25,  // Método de Pago
            'E' => 10,  // Moneda
            'F' => 15,  // Monto
            'G' => 15,  // Balance Anterior
            'H' => 15,  // Balance Final
            'I' => 20,  // Orden
            'J' => 40,  // Descripción
            'K' => 20,  // Registrado Por
        ];
    }
}
