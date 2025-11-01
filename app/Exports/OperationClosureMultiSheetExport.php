<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class OperationClosureMultiSheetExport implements WithMultipleSheets
{
    protected $query;
    protected $dateFrom;
    protected $dateTo;

    public function __construct($query, $dateFrom, $dateTo)
    {
        $this->query = $query;
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
    }

    public function sheets(): array
    {
        return [
            new OperationClosureGuideSheet(),
            new OperationClosureExport($this->query, $this->dateFrom, $this->dateTo),
        ];
    }
}
