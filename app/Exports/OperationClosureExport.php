<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class OperationClosureExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle, WithColumnWidths, WithEvents
{
    protected $query;
    protected $dateFrom;
    protected $dateTo;
    protected $rowNumber = 1;
    protected $totalRows = 0;

    public function __construct($query, $dateFrom, $dateTo)
    {
        $this->query = $query;
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
    }

    public function collection()
    {
        // Obtener todas las órdenes y agruparlas manualmente por par
        $orders = $this->query->get();
        
        // Agrupar por currency_pair_id para asegurar que estén juntas
        $grouped = $orders->groupBy('currency_pair_id')->sortKeys();
        
        // Aplanar la colección manteniendo el orden por grupo
        $collection = collect();
        foreach ($grouped as $pairOrders) {
            // Ordenar cada grupo por fecha descendente
            $sortedPairOrders = $pairOrders->sortByDesc('created_at');
            foreach ($sortedPairOrders as $order) {
                $collection->push($order);
            }
        }
        
        $this->totalRows = $collection->count();
        return $collection;
    }

    public function headings(): array
    {
        return [
            'N° Orden',
            'Fecha',
            'Hora',
            'Cliente',
            'Par',
            'Monto Base',
            'Monto Quote',
            'Tasa',
            'Comisión %',
            'Comisión $',
            'Comisión Plataforma',
            'Ganancia Neta',
            'Estado',
            'Operador',
            'Notas',
            'Modelo',
            'Tasa Compra',
            'Tasa Venta',
            'Spread Pts',
            'Ganancia Spread (Quote)',
            'Ganancia Spread (USD)',
            'Margen Real %',
        ];
    }

    public function map($order): array
    {
        $this->rowNumber++;
        // Cálculos adicionales por modelo
        $model = $order->commission_model ?? 'percentage';
        $buyRate = (float) ($order->buy_rate ?? 0);
        $sellRate = (float) ($order->sell_rate ?? 0);
        $spreadPts = ($buyRate && $sellRate) ? ($sellRate - $buyRate) : 0;
        $spreadQuote = (float) ($order->spread_profit ?? 0);
        $spreadUsd = $buyRate > 0 ? ($spreadQuote / $buyRate) : 0;
        $actualMargin = (float) ($order->actual_margin_percent ?? 0);

        $modelLabel = [
            'percentage' => 'Porcentaje',
            'spread' => 'Spread',
            'mixed' => 'Mixto',
        ][$model] ?? $model;

        return [
            $order->order_number,
            $order->created_at->format('d/m/Y'), // Fecha separada
            $order->created_at->format('H:i:s'), // Hora separada para mejor visualización
            $order->customer ? $order->customer->name : 'Sin cliente',
            $order->currencyPair->symbol,
            (float) $order->base_amount, // Número sin formato para que Excel lo maneje
            (float) $order->quote_amount,
            (float) ($order->applied_rate ?? $order->market_rate),
            (float) $order->house_commission_percent,
            (float) $order->house_commission_amount,
            (float) $order->platform_commission,
            (float) $order->exchange_commission,
            $this->getStatusLabel($order->status),
            $order->user->name,
            $order->notes ?? '',
            $modelLabel,
            $buyRate,
            $sellRate,
            $spreadPts,
            $spreadQuote,
            $spreadUsd,
            $actualMargin,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Estilo del encabezado
            1 => [
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '1E40AF'] // Azul más oscuro y profesional
                ],
                'font' => [
                    'color' => ['rgb' => 'FFFFFF'],
                    'bold' => true,
                    'size' => 11,
                    'name' => 'Calibri'
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000'],
                    ],
                ],
            ],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 18,  // N° Orden
            'B' => 12,  // Fecha
            'C' => 10,  // Hora
            'D' => 25,  // Cliente
            'E' => 12,  // Par
            'F' => 15,  // Monto Base
            'G' => 15,  // Monto Quote
            'H' => 12,  // Tasa
            'I' => 12,  // Comisión %
            'J' => 15,  // Comisión $
            'K' => 18,  // Comisión Plataforma
            'L' => 15,  // Ganancia Neta
            'M' => 12,  // Estado
            'N' => 20,  // Operador
            'O' => 30,  // Notas
            'P' => 12,  // Modelo
            'Q' => 12,  // Tasa Compra
            'R' => 12,  // Tasa Venta
            'S' => 12,  // Spread Pts
            'T' => 20,  // Ganancia Spread (Quote)
            'U' => 20,  // Ganancia Spread (USD)
            'V' => 14,  // Margen Real %
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastRow = $this->totalRows + 1;
                
                // Aplicar formato básico primero
                $sheet->getStyle('A1:V' . $lastRow)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => 'CCCCCC'],
                        ],
                    ],
                ]);

                // Formato de números para columnas monetarias
                $sheet->getStyle('F2:G' . $lastRow)->getNumberFormat()
                    ->setFormatCode('#,##0.00');
                
                $sheet->getStyle('H2:H' . $lastRow)->getNumberFormat()
                    ->setFormatCode('#,##0.0000');
                
                $sheet->getStyle('I2:I' . $lastRow)->getNumberFormat()
                    ->setFormatCode('0.00"%"');
                
                $sheet->getStyle('J2:L' . $lastRow)->getNumberFormat()
                    ->setFormatCode('$#,##0.00');

                // Formatos para nuevas columnas
                $sheet->getStyle('Q2:R' . $lastRow)->getNumberFormat()
                    ->setFormatCode('#,##0.0000');
                $sheet->getStyle('S2:S' . $lastRow)->getNumberFormat()
                    ->setFormatCode('#,##0.00');
                $sheet->getStyle('T2:T' . $lastRow)->getNumberFormat()
                    ->setFormatCode('#,##0.00');
                $sheet->getStyle('U2:U' . $lastRow)->getNumberFormat()
                    ->setFormatCode('$#,##0.00');
                $sheet->getStyle('V2:V' . $lastRow)->getNumberFormat()
                    ->setFormatCode('0.00"%"');

                // Centrar columnas específicas
                $sheet->getStyle('A2:A' . $lastRow)->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('B2:C' . $lastRow)->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('E2:E' . $lastRow)->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('M2:M' . $lastRow)->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // Alinear a la derecha los números (extender hasta V)
                $sheet->getStyle('F2:V' . $lastRow)->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                
                // Agregar comentarios explicativos en encabezados
                $sheet->getComment('P1')->getText()->createTextRun('Porcentaje: Solo comisión %\nSpread: Diferencia buy/sell\nMixto: Spread + Comisión %');
                $sheet->getComment('Q1')->getText()->createTextRun('Tasa a la que la casa compra dólares (solo Spread y Mixto)');
                $sheet->getComment('R1')->getText()->createTextRun('Tasa a la que el cliente paga (solo Spread y Mixto)');
                $sheet->getComment('S1')->getText()->createTextRun('Diferencia entre Tasa Venta y Tasa Compra (solo Spread y Mixto)');
                $sheet->getComment('L1')->getText()->createTextRun('Ganancia después de descontar comisión de plataforma (0% con promoción)');

                // Colorear filas según modelo de comisión
                for ($row = 2; $row <= $lastRow; $row++) {
                    $model = $sheet->getCell('P' . $row)->getValue();
                    $baseColor = 'FFFFFF';
                    
                    switch ($model) {
                        case 'Porcentaje':
                            $baseColor = 'DBEAFE'; // Azul claro
                            break;
                        case 'Spread':
                            $baseColor = 'D1FAE5'; // Verde claro
                            break;
                        case 'Mixto':
                            $baseColor = 'E9D5FF'; // Púrpura claro
                            break;
                    }
                    
                    // Aplicar color de fondo según modelo
                    $sheet->getStyle('A' . $row . ':V' . $row)->applyFromArray([
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => $baseColor]
                        ],
                    ]);
                }

                // Colorear estados (mantener encima del color de modelo para que destaque)
                for ($row = 2; $row <= $lastRow; $row++) {
                    $status = $sheet->getCell('M' . $row)->getValue();
                    $color = 'FFFFFF';
                    $fontColor = '000000';
                    
                    switch ($status) {
                        case 'Completada':
                            $color = 'D1FAE5'; // Verde claro
                            $fontColor = '065F46';
                            break;
                        case 'Pendiente':
                            $color = 'FEF3C7'; // Amarillo claro
                            $fontColor = '92400E';
                            break;
                        case 'Cancelada':
                            $color = 'FEE2E2'; // Rojo claro
                            $fontColor = '991B1B';
                            break;
                    }
                    
                    $sheet->getStyle('M' . $row)->applyFromArray([
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => $color]
                        ],
                        'font' => [
                            'color' => ['rgb' => $fontColor],
                            'bold' => true,
                        ],
                    ]);
                }
                
                // Agrupar por pares y agregar subtotales
                $insertedRows = $this->addCurrencyPairSubtotals($sheet, $lastRow);
                
                // Recalcular última fila después de insertar subtotales
                $lastRowWithSubtotals = $lastRow + $insertedRows;

                // Agregar tabla resumen al final
                $this->addSummaryTable($sheet, $lastRowWithSubtotals);

                // Congelar primera fila
                $sheet->freezePane('A2');

                // Ajustar altura de filas
                $sheet->getRowDimension(1)->setRowHeight(25);
            },
        ];
    }

    public function title(): string
    {
        return '📈 Operaciones ' . date('d/m/Y', strtotime($this->dateFrom));
    }

    private function getStatusLabel($status)
    {
        $labels = [
            'pending' => 'Pendiente',
            'processing' => 'Procesando',
            'completed' => 'Completada',
            'cancelled' => 'Cancelada',
            'failed' => 'Fallida',
        ];

        return $labels[$status] ?? $status;
    }
    
    private function addCurrencyPairSubtotals($sheet, $lastDataRow)
    {
        $currentPair = null;
        $pairStartRow = 2;
        $insertedRows = 0;

        
        // Recorrer las filas para identificar cambios de par
        for ($row = 2; $row <= $lastDataRow; $row++) {
            $actualRow = $row + $insertedRows;
            $pair = $sheet->getCell('E' . $actualRow)->getValue();
            
            // Si es el primer grupo o cambia el par
            if ($currentPair === null || $currentPair !== $pair) {
                // Si no es el primer grupo, insertar subtotal del grupo anterior
                if ($currentPair !== null) {
                    $subtotalRow = $actualRow;
                    
                    // Insertar fila para el subtotal
                    $sheet->insertNewRowBefore($subtotalRow, 1);
                    $insertedRows++;
                    
                    // Calcular el rango del subtotal
                    $endRow = $subtotalRow - 1;
                    
                    // Agregar subtotal del grupo anterior
                    $sheet->mergeCells('A' . $subtotalRow . ':D' . $subtotalRow);
                    $sheet->setCellValue('A' . $subtotalRow, '▸ SUBTOTAL ' . $currentPair);
                    $sheet->setCellValue('F' . $subtotalRow, '=SUM(F' . $pairStartRow . ':F' . $endRow . ')');
                    $sheet->setCellValue('G' . $subtotalRow, '=SUM(G' . $pairStartRow . ':G' . $endRow . ')');
                    $sheet->setCellValue('J' . $subtotalRow, '=SUM(J' . $pairStartRow . ':J' . $endRow . ')');
                    $sheet->setCellValue('K' . $subtotalRow, '=SUM(K' . $pairStartRow . ':K' . $endRow . ')');
                    $sheet->setCellValue('L' . $subtotalRow, '=SUM(L' . $pairStartRow . ':L' . $endRow . ')');
                    // Sumar también las columnas de spread
                    $sheet->setCellValue('T' . $subtotalRow, '=SUM(T' . $pairStartRow . ':T' . $endRow . ')');
                    $sheet->setCellValue('U' . $subtotalRow, '=SUM(U' . $pairStartRow . ':U' . $endRow . ')');
                    
                    // Estilo del subtotal (extender hasta V)
                    $sheet->getStyle('A' . $subtotalRow . ':V' . $subtotalRow)->applyFromArray([
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => '3B82F6'] // Azul medio
                        ],
                        'font' => [
                            'color' => ['rgb' => 'FFFFFF'],
                            'bold' => true,
                            'size' => 10,
                        ],
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_MEDIUM,
                                'color' => ['rgb' => '1E40AF'],
                            ],
                        ],
                    ]);
                    
                    // Formato de números para subtotales
                    $sheet->getStyle('F' . $subtotalRow . ':G' . $subtotalRow)->getNumberFormat()
                        ->setFormatCode('#,##0.00');
                    $sheet->getStyle('J' . $subtotalRow . ':L' . $subtotalRow)->getNumberFormat()
                        ->setFormatCode('$#,##0.00');
                    $sheet->getStyle('T' . $subtotalRow)->getNumberFormat()
                        ->setFormatCode('#,##0.00');
                    $sheet->getStyle('U' . $subtotalRow)->getNumberFormat()
                        ->setFormatCode('$#,##0.00');
                    
                    // Insertar fila en blanco de separación
                    $sheet->insertNewRowBefore($subtotalRow + 1, 1);
                    $insertedRows++;
                    
                    // Actualizar actualRow después de insertar filas
                    $actualRow = $row + $insertedRows;
                }
                
                // Insertar encabezado del nuevo grupo
                $headerRow = $actualRow;
                $sheet->insertNewRowBefore($headerRow, 1);
                $insertedRows++;
                
                // Agregar encabezado del grupo
                $sheet->mergeCells('A' . $headerRow . ':V' . $headerRow);
                $sheet->setCellValue('A' . $headerRow, '═══ ' . $pair . ' ═══');
                $sheet->getStyle('A' . $headerRow . ':V' . $headerRow)->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'E0E7FF'] // Azul muy claro
                    ],
                    'font' => [
                        'color' => ['rgb' => '1E40AF'],
                        'bold' => true,
                        'size' => 11,
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => '3B82F6'],
                        ],
                    ],
                ]);
                
                // Actualizar inicio del nuevo grupo
                $pairStartRow = $headerRow + 1;
                $currentPair = $pair;
            }
        }
        
        // Agregar subtotal para el último grupo
        if ($currentPair !== null) {
            $subtotalRow = $lastDataRow + $insertedRows + 1;
            $endRow = $lastDataRow + $insertedRows;
            
            $sheet->mergeCells('A' . $subtotalRow . ':D' . $subtotalRow);
            $sheet->setCellValue('A' . $subtotalRow, '▸ SUBTOTAL ' . $currentPair);
            $sheet->setCellValue('F' . $subtotalRow, '=SUM(F' . $pairStartRow . ':F' . $endRow . ')');
            $sheet->setCellValue('G' . $subtotalRow, '=SUM(G' . $pairStartRow . ':G' . $endRow . ')');
            $sheet->setCellValue('J' . $subtotalRow, '=SUM(J' . $pairStartRow . ':J' . $endRow . ')');
            $sheet->setCellValue('K' . $subtotalRow, '=SUM(K' . $pairStartRow . ':K' . $endRow . ')');
            $sheet->setCellValue('L' . $subtotalRow, '=SUM(L' . $pairStartRow . ':L' . $endRow . ')');
            // Sumar columnas de spread
            $sheet->setCellValue('T' . $subtotalRow, '=SUM(T' . $pairStartRow . ':T' . $endRow . ')');
            $sheet->setCellValue('U' . $subtotalRow, '=SUM(U' . $pairStartRow . ':U' . $endRow . ')');
            
            // Estilo del subtotal (hasta V)
            $sheet->getStyle('A' . $subtotalRow . ':V' . $subtotalRow)->applyFromArray([
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '3B82F6']
                ],
                'font' => [
                    'color' => ['rgb' => 'FFFFFF'],
                    'bold' => true,
                    'size' => 10,
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_MEDIUM,
                        'color' => ['rgb' => '1E40AF'],
                    ],
                ],
            ]);
            
            // Formato de números para último subtotal
            $sheet->getStyle('F' . $subtotalRow . ':G' . $subtotalRow)->getNumberFormat()
                ->setFormatCode('#,##0.00');
            $sheet->getStyle('J' . $subtotalRow . ':L' . $subtotalRow)->getNumberFormat()
                ->setFormatCode('$#,##0.00');
            $sheet->getStyle('T' . $subtotalRow)->getNumberFormat()
                ->setFormatCode('#,##0.00');
            $sheet->getStyle('U' . $subtotalRow)->getNumberFormat()
                ->setFormatCode('$#,##0.00');
            
            $insertedRows++;
        }
        
        return $insertedRows;
    }
    
    private function addSummaryTable($sheet, $lastRowWithSubtotals)
    {
        $startRow = $lastRowWithSubtotals + 3;
        
        // Título del resumen
        $sheet->mergeCells('A' . $startRow . ':G' . $startRow);
        $sheet->setCellValue('A' . $startRow, '📊 RESUMEN EJECUTIVO');
        $sheet->getStyle('A' . $startRow . ':G' . $startRow)->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '1E40AF']
            ],
            'font' => [
                'color' => ['rgb' => 'FFFFFF'],
                'bold' => true,
                'size' => 13,
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_MEDIUM,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ]);
        
        // Encabezados de la tabla resumen
        $headerRow = $startRow + 1;
        $sheet->setCellValue('A' . $headerRow, 'Par');
        $sheet->setCellValue('B' . $headerRow, 'Operaciones');
        $sheet->setCellValue('C' . $headerRow, 'Volumen Base');
        $sheet->setCellValue('D' . $headerRow, 'Volumen Quote');
        $sheet->setCellValue('E' . $headerRow, 'Comisión $');
        $sheet->setCellValue('F' . $headerRow, 'Com. Plataforma');
        $sheet->setCellValue('G' . $headerRow, 'Ganancia Neta');
        
        $sheet->getStyle('A' . $headerRow . ':G' . $headerRow)->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '3B82F6']
            ],
            'font' => [
                'color' => ['rgb' => 'FFFFFF'],
                'bold' => true,
                'size' => 10,
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '1E40AF'],
                ],
            ],
        ]);
        
        // Recopilar datos de los subtotales
        $summaryData = [];
        for ($row = 2; $row <= $lastRowWithSubtotals; $row++) {
            $cellValue = $sheet->getCell('A' . $row)->getValue();
            if (strpos($cellValue, '▸ SUBTOTAL') === 0) {
                $pair = str_replace('▸ SUBTOTAL ', '', $cellValue);
                
                // Contar operaciones del par (buscar hacia atrás hasta el encabezado)
                $count = 0;
                for ($i = $row - 1; $i >= 2; $i--) {
                    $checkValue = $sheet->getCell('A' . $i)->getValue();
                    if (strpos($checkValue, '═══') === 0) {
                        break;
                    }
                    if (strpos($checkValue, '▸ SUBTOTAL') !== 0 && !empty($checkValue)) {
                        $count++;
                    }
                }
                
                // Leer valores de subtotal, priorizando spread USD si existe
                $commissionSum = $sheet->getCell('J' . $row)->getCalculatedValue();
                $platformSum = $sheet->getCell('K' . $row)->getCalculatedValue();
                $profitSum = $sheet->getCell('L' . $row)->getCalculatedValue();
                $spreadUsdSum = $sheet->getCell('U' . $row)->getCalculatedValue();
                
                // Si profit es 0 pero hay spread USD, usar spread USD
                if ($profitSum == 0 && $spreadUsdSum > 0) {
                    $profitSum = $spreadUsdSum;
                }
                
                $summaryData[] = [
                    'pair' => $pair,
                    'count' => $count,
                    'base' => $sheet->getCell('F' . $row)->getCalculatedValue(),
                    'quote' => $sheet->getCell('G' . $row)->getCalculatedValue(),
                    'commission' => $commissionSum,
                    'platform' => $platformSum,
                    'profit' => $profitSum,
                ];
            }
        }
        
        // Agregar filas de datos
        $dataRow = $headerRow + 1;
        foreach ($summaryData as $data) {
            $sheet->setCellValue('A' . $dataRow, $data['pair']);
            $sheet->setCellValue('B' . $dataRow, $data['count']);
            $sheet->setCellValue('C' . $dataRow, $data['base']);
            $sheet->setCellValue('D' . $dataRow, $data['quote']);
            $sheet->setCellValue('E' . $dataRow, $data['commission']);
            $sheet->setCellValue('F' . $dataRow, $data['platform']);
            $sheet->setCellValue('G' . $dataRow, $data['profit']);
            
            // Estilo de las filas de datos
            $sheet->getStyle('A' . $dataRow . ':G' . $dataRow)->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'CCCCCC'],
                    ],
                ],
            ]);
            
            // Centrar par y operaciones
            $sheet->getStyle('A' . $dataRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('B' . $dataRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            
            // Alinear números a la derecha
            $sheet->getStyle('C' . $dataRow . ':G' . $dataRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            
            // Formato de números
            $sheet->getStyle('C' . $dataRow . ':D' . $dataRow)->getNumberFormat()->setFormatCode('#,##0.00');
            $sheet->getStyle('E' . $dataRow . ':G' . $dataRow)->getNumberFormat()->setFormatCode('$#,##0.00');
            
            $dataRow++;
        }
    }
}
