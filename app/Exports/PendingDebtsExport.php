<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class PendingDebtsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $customers;
    protected $dateFrom;
    protected $dateTo;
    protected $rowNumber = 1;

    public function __construct($customers, $dateFrom, $dateTo)
    {
        $this->customers = $customers;
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
    }

    public function collection()
    {
        // Aplanar la colección para mostrar cada orden pendiente
        $rows = collect();
        
        foreach ($this->customers as $customer) {
            foreach ($customer->orders as $order) {
                $rows->push([
                    'customer' => $customer,
                    'order' => $order,
                ]);
            }
        }
        
        return $rows;
    }

    public function headings(): array
    {
        return [
            'Cliente',
            'Teléfono',
            'Email',
            'Número de Orden',
            'Fecha de Orden',
            'Par de Divisas',
            'Monto Pendiente',
            'Moneda',
            'Días Pendiente',
            'Notas',
        ];
    }

    public function map($row): array
    {
        $this->rowNumber++;
        $customer = $row['customer'];
        $order = $row['order'];
        
        $daysPending = now()->diffInDays($order->created_at);
        
        return [
            $customer->name,
            $customer->phone ?? 'N/A',
            $customer->email ?? 'N/A',
            $order->order_number,
            $order->created_at->format('Y-m-d H:i:s'),
            $order->currencyPair->symbol,
            number_format($order->base_amount, 2),
            $order->currencyPair->base_currency,
            $daysPending . ' días',
            $order->notes ?? '',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'EAB308']
                ],
                'font' => ['color' => ['rgb' => '000000'], 'bold' => true, 'size' => 12],
            ],
        ];
    }

    public function title(): string
    {
        return 'Deudas Pendientes';
    }
}
