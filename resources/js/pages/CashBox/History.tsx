import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { useState } from 'react';

interface Movement {
  id: number;
  type: string;
  currency: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: string;
  payment_method: {
    name: string;
    type: string;
  };
  order?: {
    order_number: string;
    id: number;
  };
  user: {
    name: string;
  };
}

interface PaginatedMovements {
  data: Movement[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Filters {
  type?: string;
  currency?: string;
  date_from?: string;
  date_to?: string;
  payment_method?: string;
}

interface Props {
  movements: PaginatedMovements;
  filters: Filters;
  currencies: string[];
  paymentMethods: Array<{ id: number; name: string }>;
}

function CashBoxHistory({ movements, filters, currencies, paymentMethods }: Props) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    router.get('/cash-box/history', localFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const clearFilters = () => {
    setLocalFilters({});
    router.get('/cash-box/history', {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'order_in':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
      case 'order_out':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'order_in':
        return 'text-green-600';
      case 'withdrawal':
      case 'order_out':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getMovementBadgeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'withdrawal':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'order_in':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'order_out':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'adjustment':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getMovementLabel = (type: string) => {
    const labels: Record<string, string> = {
      deposit: 'Depósito',
      withdrawal: 'Retiro',
      order_in: 'Entrada (Orden)',
      order_out: 'Salida (Orden)',
      adjustment: 'Ajuste',
    };
    return labels[type] || type;
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : currency === 'VES' ? 'Bs.' : currency;
    return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <>
      <Head title="Historial de Movimientos - Fondo de Caja" />
      
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.visit('/cash-box')}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                📜 Historial de Movimientos
              </h1>
            </div>
            <p className="text-sm md:text-base text-muted-foreground ml-10">
              Todos los movimientos de tu fondo de caja
            </p>
          </div>
          
          <Button 
            variant="outline" 
            className="h-11 md:h-10"
            onClick={() => {
              const params = new URLSearchParams();
              if (localFilters.type) params.append('type', localFilters.type);
              if (localFilters.currency) params.append('currency', localFilters.currency);
              if (localFilters.date_from) params.append('date_from', localFilters.date_from);
              if (localFilters.date_to) params.append('date_to', localFilters.date_to);
              if (localFilters.payment_method) params.append('payment_method', localFilters.payment_method);
              
              window.location.href = `/cash-box/export?${params.toString()}`;
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <CardDescription className="text-sm">
              Filtra los movimientos por tipo, moneda, fecha o método de pago
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm">Tipo</Label>
                <Select 
                  value={localFilters.type || 'all'} 
                  onValueChange={(value) => handleFilterChange('type', value === 'all' ? '' : value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="deposit">Depósito</SelectItem>
                    <SelectItem value="withdrawal">Retiro</SelectItem>
                    <SelectItem value="order_in">Entrada (Orden)</SelectItem>
                    <SelectItem value="order_out">Salida (Orden)</SelectItem>
                    <SelectItem value="adjustment">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm">Moneda</Label>
                <Select 
                  value={localFilters.currency || 'all'} 
                  onValueChange={(value) => handleFilterChange('currency', value === 'all' ? '' : value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_from" className="text-sm">Desde</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={localFilters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_to" className="text-sm">Hasta</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={localFilters.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={applyFilters} className="h-10">
                Aplicar Filtros
              </Button>
              <Button onClick={clearFilters} variant="outline" className="h-10">
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Movimientos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Movimientos ({movements.total})
            </CardTitle>
            <CardDescription className="text-sm">
              Página {movements.current_page} de {movements.last_page}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {movements.data.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No se encontraron movimientos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {movements.data.map((movement) => (
                  <div 
                    key={movement.id} 
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getMovementIcon(movement.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${getMovementBadgeColor(movement.type)} text-xs`}>
                            {getMovementLabel(movement.type)}
                          </Badge>
                          {movement.order && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() => router.visit(`/orders/${movement.order!.id}`)}
                            >
                              Orden #{movement.order.order_number}
                            </Button>
                          )}
                        </div>
                        <div className="text-sm font-medium">
                          {movement.payment_method.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {movement.description || 'Sin descripción'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(movement.created_at).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Por: {movement.user.name}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1 md:min-w-[180px]">
                      <div className={`text-lg font-bold ${getMovementColor(movement.type)}`}>
                        {movement.amount >= 0 ? '+' : ''}{formatCurrency(movement.amount, movement.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Balance anterior: {formatCurrency(movement.balance_before, movement.currency)}
                      </div>
                      <div className="text-xs font-medium">
                        Balance final: {formatCurrency(movement.balance_after, movement.currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginación */}
            {movements.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {movements.current_page > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => router.get('/cash-box/history', { ...localFilters, page: movements.current_page - 1 })}
                  >
                    Anterior
                  </Button>
                )}
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Página {movements.current_page} de {movements.last_page}
                </span>
                {movements.current_page < movements.last_page && (
                  <Button
                    variant="outline"
                    onClick={() => router.get('/cash-box/history', { ...localFilters, page: movements.current_page + 1 })}
                  >
                    Siguiente
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

CashBoxHistory.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default CashBoxHistory;
