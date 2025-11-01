<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class OperationClosureGuideSheet implements WithTitle, WithEvents
{
    public function title(): string
    {
        return '📖 Guía de Comisiones';
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                
                // Título principal
                $sheet->setCellValue('A1', '📖 GUÍA: MODELOS DE COMISIÓN');
                $sheet->mergeCells('A1:E1');
                $sheet->getStyle('A1')->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '1E40AF']
                    ],
                    'font' => [
                        'bold' => true,
                        'size' => 16,
                        'color' => ['rgb' => 'FFFFFF']
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);
                $sheet->getRowDimension(1)->setRowHeight(35);

                // Intro
                $sheet->setCellValue('A3', 'Kuberafi maneja 3 modelos de comisión para las operaciones de cambio:');
                $sheet->mergeCells('A3:E3');
                $sheet->getStyle('A3')->getFont()->setSize(11);
                
                // MODELO 1: Porcentaje
                $sheet->setCellValue('A5', '1️⃣ PORCENTAJE FIJO');
                $sheet->mergeCells('A5:E5');
                $sheet->getStyle('A5')->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A8A']],
                    'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
                ]);
                
                $sheet->setCellValue('A6', '📋 Descripción:');
                $sheet->setCellValue('B6', 'Se cobra una comisión porcentual sobre el monto enviado por el cliente.');
                $sheet->mergeCells('B6:E6');
                
                $sheet->setCellValue('A7', '🧮 Ejemplo:');
                $sheet->setCellValue('B7', 'Cliente envía 100 USD, comisión 5%');
                $sheet->mergeCells('B7:E7');
                
                $sheet->setCellValue('B8', '• Comisión: 5% × 100 USD = 5 USD');
                $sheet->mergeCells('B8:E8');
                $sheet->setCellValue('B9', '• Cliente recibe neto: 95 USD');
                $sheet->mergeCells('B9:E9');
                $sheet->setCellValue('B10', '• Se convierte a tasa de mercado (ej: 298)');
                $sheet->mergeCells('B10:E10');
                $sheet->setCellValue('B11', '• Cliente recibe: 95 × 298 = 28,310 VES');
                $sheet->mergeCells('B11:E11');
                
                // MODELO 2: Spread
                $sheet->setCellValue('A13', '2️⃣ SPREAD');
                $sheet->mergeCells('A13:E13');
                $sheet->getStyle('A13')->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '15803D']],
                    'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
                ]);
                
                $sheet->setCellValue('A14', '📋 Descripción:');
                $sheet->setCellValue('B14', 'Ganancia por diferencia entre tasa de compra y tasa de venta. No hay comisión %.');
                $sheet->mergeCells('B14:E14');
                
                $sheet->setCellValue('A15', '🧮 Ejemplo:');
                $sheet->setCellValue('B15', 'Cliente envía 100 USD, compra: 290, venta: 298');
                $sheet->mergeCells('B15:E15');
                
                $sheet->setCellValue('B16', '• Cliente paga: 100 × 298 = 29,800 VES');
                $sheet->mergeCells('B16:E16');
                $sheet->setCellValue('B17', '• Casa compra dólares a: 100 × 290 = 29,000 VES');
                $sheet->mergeCells('B17:E17');
                $sheet->setCellValue('B18', '• Spread (ganancia): 29,800 - 29,000 = 800 VES (≈$2.76)');
                $sheet->mergeCells('B18:E18');
                
                // MODELO 3: Mixto
                $sheet->setCellValue('A20', '3️⃣ MIXTO (Spread + Comisión %)');
                $sheet->mergeCells('A20:E20');
                $sheet->getStyle('A20')->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '7C3AED']],
                    'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
                ]);
                
                $sheet->setCellValue('A21', '📋 Descripción:');
                $sheet->setCellValue('B21', 'Combina spread + comisión %. Se cambia todo el monto con spread, y se descuenta comisión % adicional.');
                $sheet->mergeCells('B21:E21');
                
                $sheet->setCellValue('A22', '🧮 Ejemplo:');
                $sheet->setCellValue('B22', 'Cliente envía 100 USD, compra: 290, venta: 298, comisión 5%');
                $sheet->mergeCells('B22:E22');
                
                $sheet->setCellValue('B23', '• Se cambia TODO: 100 × 298 = 29,800 VES');
                $sheet->mergeCells('B23:E23');
                $sheet->setCellValue('B24', '• Se descuenta comisión: 5 USD × 298 = 1,490 VES');
                $sheet->mergeCells('B24:E24');
                $sheet->setCellValue('B25', '• Cliente recibe: 29,800 - 1,490 = 28,310 VES');
                $sheet->mergeCells('B25:E25');
                $sheet->setCellValue('B26', '• Ganancia spread: 100 × (298-290) = 800 VES');
                $sheet->mergeCells('B26:E26');
                $sheet->setCellValue('B27', '• Ganancia comisión: 1,490 VES');
                $sheet->mergeCells('B27:E27');
                $sheet->setCellValue('B28', '• Total ganancia: 800 + 1,490 = 2,250 VES');
                $sheet->mergeCells('B28:E28');
                
                // Nota importante
                $sheet->setCellValue('A30', '⚠️ IMPORTANTE');
                $sheet->mergeCells('A30:E30');
                $sheet->getStyle('A30')->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FCD34D']],
                    'font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => '000000']],
                ]);
                
                $sheet->setCellValue('A31', '• En el Excel, cada orden muestra su modelo en la columna "Modelo"');
                $sheet->mergeCells('A31:E31');
                $sheet->setCellValue('A32', '• Las columnas de spread (Tasa Compra, Tasa Venta, Spread, etc.) solo aplican para modelos "Spread" y "Mixto"');
                $sheet->mergeCells('A32:E32');
                $sheet->setCellValue('A33', '• La columna "Comisión %" solo aplica para modelos "Porcentaje" y "Mixto"');
                $sheet->mergeCells('A33:E33');
                $sheet->setCellValue('A34', '• La "Ganancia Neta" es lo que la casa de cambio gana después de descontar la comisión de plataforma (0% si hay promoción)');
                $sheet->mergeCells('A34:E34');
                
                // Anchos de columna
                $sheet->getColumnDimension('A')->setWidth(20);
                $sheet->getColumnDimension('B')->setWidth(90);
                $sheet->getColumnDimension('C')->setWidth(15);
                $sheet->getColumnDimension('D')->setWidth(15);
                $sheet->getColumnDimension('E')->setWidth(15);
                
                // Bordes y alineación
                $sheet->getStyle('A1:E34')->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => 'D1D5DB'],
                        ],
                    ],
                ]);
                
                $sheet->getStyle('A3:E34')->getAlignment()->setWrapText(true);
                $sheet->getStyle('A3:E34')->getAlignment()->setVertical(Alignment::VERTICAL_TOP);
                
                // Altura de filas
                for ($row = 6; $row <= 28; $row++) {
                    $sheet->getRowDimension($row)->setRowHeight(20);
                }
            },
        ];
    }
}
