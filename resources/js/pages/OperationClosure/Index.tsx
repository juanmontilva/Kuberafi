import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Download,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useState } from 'react';

interface Order {
  id: number;
  order_number: string;
  base_amount: string;
  quote_amount: string;
  status: string;
  created_at: string;
  house_commission_amount: string;
  platform_commission: string;
  exchange_commission: string;
  currency_pair: {
    symbol: string;
  };
  customer?: {
    name: string;
  };
  user: {
    name: string;
  };
}

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  pending_orders_count: number;
  pending_amount: string;
}

interface Stats {
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  cancelled_orders: number;
  total_volume: number;
  completed_volume: number;
  pending_volume: number;
  total_house_commission: number;
  total_platform_commission: number;
  total_exchange_commission: number;
}

interface Props {
  orders: {
    data: Order[];
    current_page: number;
    last_page: number;
    total: number;
  };
  stats: Stats;
  customersWithDebt: Customer[];
  filters: {
    date_from: string;
    date_to: string;
    search?: string;
    status: string;
  };
}

function OperationClosure({ orders, stats, customersWithDebt, filters }: Props) {
  const [dateFrom, setDateFrom] = useState(filters.date_from);
  const [dateTo, setDateTo] = useState(filters.date_to);
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status);

  const handleFilter = () => {
    router.get('/operation-closure', {
      date_from: dateFrom,
      date_to: dateTo,
      search: search,
      status: status,
    }, {
      preserveState: true,
    });
  };

  const handleExport = () => {
    window.location.href = `/operation-closure/export?date_from=${dateFrom}&date_to=${dateTo}&search=${search}&status=${status}`;
  };

  const handleExportDebts = () => {
    window.location.href = `/operation-closure/export-debts?date_from=${dateFrom}&date_to=${dateTo}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-900/20 text-green-400 border-green-500';
      case 'pending': return 'bg-yellow-900/20 text-yellow-400 border-yellow-500';
      case 'processing': return 'bg-blue-900/20 text-blue-400 border-blue-500';
      case 'cancelled': return 'bg-gray-900/20 text-gray-400 border-gray-500';
      case 'failed': return 'bg-red-900/20 text-red-400 border-red-500';
      default: return 'bg-gray-900/20 text-gray-300 border-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'cancelled': return 'Cancelada';
      case 'failed': return 'Fallida';
      default: return status;
    }
  };

  return (
    <>
      <Head title="Cierre de Operaciones" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cierre de Operaciones</h1>
            <p className="text-muted-foreground">
              Informe financiero completo de tus operaciones
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar Excel
            </Button>
            {customersWithDebt.length > 0 && (
              <Button onClick={handleExportDebts} variant="outline" className="gap-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10">
                <FileSpreadsheet className="h-4 w-4" />
                Exportar Deudas
              </Button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-5">
              <div>
                <Label htmlFor="date_from">Fecha Desde</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="date_to">Fecha Hasta</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1">
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
              
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Orden o cliente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <Button onClick={handleFilter} className="w-full">
                  Filtrar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_orders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <CheckCircle className="inline h-3 w-3 text-green-500 mr-1" />
                {stats.completed_orders} completadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volumen Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.total_volume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Completado: ${stats.completed_volume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                ${stats.total_exchange_commission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Comisión bruta: ${stats.total_house_commission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {stats.pending_orders}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ${stats.pending_volume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerta de Deudas */}
        {customersWithDebt.length > 0 && (
          <Card className="border-yellow-500 bg-yellow-900/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  <div>
                    <CardTitle className="text-yellow-500">
                      {customersWithDebt.length} Cliente(s) con Deudas Pendientes
                    </CardTitle>
                    <CardDescription>
                      Operaciones sin completar en el período seleccionado
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={handleExportDebts} variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {customersWithDebt.slice(0, 5).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.phone || customer.email || 'Sin contacto'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-500">
                        ${parseFloat(customer.pending_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer.pending_orders_count} orden(es)
                      </p>
                    </div>
                  </div>
                ))}
                {customersWithDebt.length > 5 && (
                  <p className="text-sm text-center text-muted-foreground pt-2">
                    Y {customersWithDebt.length - 5} cliente(s) más...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Órdenes */}
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Operaciones</CardTitle>
            <CardDescription>
              {orders.total} orden(es) en el período seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.data.length === 0 ? (
              <div className="text-center py-12">
                <XCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No hay órdenes</h3>
                <p className="text-muted-foreground mt-2">
                  No se encontraron órdenes en el período seleccionado
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.data.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.visit(`/orders/${order.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{order.order_number}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.currency_pair.symbol} • {order.customer?.name || 'Sin cliente'} • {order.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <p className="font-bold text-lg">
                        ${parseFloat(order.base_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      {order.status === 'completed' && (
                        <p className="text-xs text-green-500">
                          Ganancia: ${parseFloat(order.exchange_commission).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginación */}
            {orders.last_page > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Página {orders.current_page} de {orders.last_page}
                </p>
                <div className="flex gap-2">
                  {orders.current_page > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.visit(`/operation-closure?page=${orders.current_page - 1}&date_from=${dateFrom}&date_to=${dateTo}&search=${search}&status=${status}`)}
                    >
                      Anterior
                    </Button>
                  )}
                  {orders.current_page < orders.last_page && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.visit(`/operation-closure?page=${orders.current_page + 1}&date_from=${dateFrom}&date_to=${dateTo}&search=${search}&status=${status}`)}
                    >
                      Siguiente
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

OperationClosure.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default OperationClosure;
