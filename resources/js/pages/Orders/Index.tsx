import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrdersFilters } from '@/components/orders-filters';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { useAuth } from '@/hooks/use-auth';
import { 
  Plus,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock
} from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  base_amount: string;
  quote_amount: string;
  status: string;
  created_at: string;
  expected_margin_percent: string;
  actual_margin_percent?: string;
  exchange_house: {
    name: string;
  };
  currency_pair: {
    symbol: string;
  };
  user: {
    name: string;
  };
  customer?: {
    id: number;
    name: string;
  };
}

interface PaginatedOrders {
  data: Order[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

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

interface Stats {
  total: number;
  completed: number;
  pending: number;
  total_volume: number;
}

interface Props {
  orders: PaginatedOrders;
  currencyPairs: CurrencyPair[];
  filters: Filters;
  stats: Stats;
}

function OrdersIndex({ orders, currencyPairs, filters, stats }: Props) {
  const { user, isSuperAdmin, isExchangeHouse, isOperator } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      // Estilo negro elegante: superficie negra con acentos en texto/borde
      case 'completed': return 'bg-black text-green-400 border border-green-700';
      case 'pending': return 'bg-black text-yellow-400 border border-yellow-700';
      case 'processing': return 'bg-black text-blue-400 border border-blue-700';
      case 'cancelled': return 'bg-black text-red-400 border border-red-700';
      case 'failed': return 'bg-black text-red-400 border border-red-700';
      default: return 'bg-black text-gray-300 border border-gray-700';
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
      <Head title="Órdenes" />
      
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isOperator ? 'Mis Órdenes' : 'Órdenes'}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {isSuperAdmin 
                ? 'Gestiona todas las órdenes de la plataforma'
                : isExchangeHouse 
                ? 'Gestiona las órdenes de tu casa de cambio'
                : 'Gestiona tus órdenes'
              }
            </p>
          </div>
          {(isExchangeHouse || isOperator) && (
            <Button 
              asChild 
              size="lg"
              className="w-full md:w-auto h-12 md:h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/orders/create">
                <Plus className="mr-2 h-5 w-5" />
                <span className="font-semibold">Nueva Orden</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Filtros */}
        <OrdersFilters filters={filters} currencyPairs={currencyPairs} />

        {/* Stats Cards */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="min-h-[100px] md:min-h-[120px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Órdenes</CardTitle>
              <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="min-h-[100px] md:min-h-[120px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Completadas</CardTitle>
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
            </CardContent>
          </Card>

          <Card className="min-h-[100px] md:min-h-[120px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-3 w-3 md:h-4 md:w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
            </CardContent>
          </Card>

          <Card className="min-h-[100px] md:min-h-[120px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Volumen Total</CardTitle>
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">
                ${stats.total_volume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Lista de Órdenes</CardTitle>
            <CardDescription className="text-sm">
              Todas las órdenes registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              {orders.data.length > 0 ? (
                orders.data.map((order) => (
                  <div key={order.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 md:p-4 rounded-lg bg-black border border-gray-800 hover:bg-gray-900 active:scale-[0.98] transition-transform">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs md:text-sm font-medium">{order.order_number}</p>
                        <Badge className={`${getStatusColor(order.status)} text-xs`}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {order.currency_pair.symbol} • {order.exchange_house.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Por: {order.user.name} • {new Date(order.created_at).toLocaleDateString('es-ES')}
                      </p>
                      {order.customer && (
                        <p className="text-xs text-blue-400">
                          👤 Cliente: {order.customer.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4">
                      <div className="text-left md:text-right space-y-1">
                        <p className="text-sm font-medium">${order.base_amount}</p>
                        <p className="text-xs text-muted-foreground">→ ${order.quote_amount}</p>
                        <p className="text-xs text-muted-foreground">
                          Margen: {order.expected_margin_percent}%
                          {order.actual_margin_percent && ` → ${order.actual_margin_percent}%`}
                        </p>
                      </div>

                      <Button variant="outline" size="sm" asChild className="h-9 w-9 md:h-8 md:w-8 p-0 shrink-0">
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm md:text-base text-muted-foreground">No hay órdenes registradas</p>
                  {(isExchangeHouse || isOperator) && (
                    <Button className="mt-4 h-11 md:h-10" asChild>
                      <Link href="/orders/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Primera Orden
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {orders.last_page > 1 && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4 md:mt-6">
                <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
                  Mostrando {((orders.current_page - 1) * orders.per_page) + 1} a {Math.min(orders.current_page * orders.per_page, orders.total)} de {orders.total} órdenes
                </p>
                <div className="flex items-center justify-center gap-2">
                  {orders.current_page > 1 && (
                    <Button variant="outline" size="sm" asChild className="h-9 md:h-8 px-4 text-sm">
                      <Link href={`/orders?page=${orders.current_page - 1}`}>
                        Anterior
                      </Link>
                    </Button>
                  )}
                  {orders.current_page < orders.last_page && (
                    <Button variant="outline" size="sm" asChild className="h-9 md:h-8 px-4 text-sm">
                      <Link href={`/orders?page=${orders.current_page + 1}`}>
                        Siguiente
                      </Link>
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

OrdersIndex.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default OrdersIndex;