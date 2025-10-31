import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Download, X } from 'lucide-react';

interface CurrencyPair {
  id: number;
  base_currency: string;
  quote_currency: string;
}

interface Filters {
  status: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  currency_pair: string;
}

interface Props {
  filters: Filters;
  currencyPairs: CurrencyPair[];
}

export function OrdersFilters({ filters, currencyPairs }: Props) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (localFilters.status && localFilters.status !== 'all') {
      params.append('status', localFilters.status);
    }
    if (localFilters.date_from) {
      params.append('date_from', localFilters.date_from);
    }
    if (localFilters.date_to) {
      params.append('date_to', localFilters.date_to);
    }
    if (localFilters.search) {
      params.append('search', localFilters.search);
    }
    if (localFilters.currency_pair && localFilters.currency_pair !== 'all') {
      params.append('currency_pair', localFilters.currency_pair);
    }

    router.get(`/orders?${params.toString()}`, {}, { preserveState: true });
  };

  const clearFilters = () => {
    setLocalFilters({
      status: 'all',
      date_from: '',
      date_to: '',
      search: '',
      currency_pair: 'all',
    });
    router.get('/orders');
  };

  const exportToExcel = () => {
    const params = new URLSearchParams();
    
    if (localFilters.status && localFilters.status !== 'all') {
      params.append('status', localFilters.status);
    }
    if (localFilters.date_from) {
      params.append('date_from', localFilters.date_from);
    }
    if (localFilters.date_to) {
      params.append('date_to', localFilters.date_to);
    }
    if (localFilters.search) {
      params.append('search', localFilters.search);
    }
    if (localFilters.currency_pair && localFilters.currency_pair !== 'all') {
      params.append('currency_pair', localFilters.currency_pair);
    }

    window.location.href = `/orders-export?${params.toString()}`;
  };

  return (
    <Card>
      <CardContent className="pt-4 md:pt-6">
        <div className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            {/* Búsqueda */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 md:top-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Orden o cliente..."
                  value={localFilters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  className="pl-8 h-11 md:h-10 text-sm md:text-base"
                />
              </div>
            </div>

            {/* Fecha Desde */}
            <div className="space-y-2">
              <Label htmlFor="date_from" className="text-sm">Desde</Label>
              <Input
                id="date_from"
                type="date"
                value={localFilters.date_from || ''}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="h-11 md:h-10 text-sm md:text-base"
              />
            </div>

            {/* Fecha Hasta */}
            <div className="space-y-2">
              <Label htmlFor="date_to" className="text-sm">Hasta</Label>
              <Input
                id="date_to"
                type="date"
                value={localFilters.date_to || ''}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="h-11 md:h-10 text-sm md:text-base"
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm">Estado</Label>
              <Select
                value={localFilters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="h-11 md:h-10 text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Par de Divisas */}
            <div className="space-y-2">
              <Label htmlFor="currency_pair" className="text-sm">Par de Divisas</Label>
              <Select
                value={localFilters.currency_pair}
                onValueChange={(value) => handleFilterChange('currency_pair', value)}
              >
                <SelectTrigger className="h-11 md:h-10 text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {currencyPairs.map((pair) => (
                    <SelectItem key={pair.id} value={pair.id.toString()}>
                      {pair.base_currency}/{pair.quote_currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col md:flex-row gap-2">
            <Button onClick={applyFilters} className="h-11 md:h-10 text-sm md:text-base">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
            <Button variant="outline" onClick={clearFilters} className="h-11 md:h-10 text-sm md:text-base">
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
            <Button variant="secondary" onClick={exportToExcel} className="h-11 md:h-10 text-sm md:text-base">
              <Download className="h-4 w-4 mr-2" />
              Exportar a Excel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
