import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { useAuth } from '@/hooks/use-auth';
import { 
  Plus,
  Eye,
  Calendar,
  DollarSign
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
}

interface PaginatedOrders {
  data: Order[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Props {
  orders: PaginatedOrders;
}

function OrdersIndex({ orders }: Props) {
  const { user, isSuperAdmin, isExchangeHouse, isOperator } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isOperator ? 'Mis Órdenes' : 'Órdenes'}
            </h1>
            <p className="text-muted-foreground">
              {isSuperAdmin 
                ? 'Gestiona todas las órdenes de la plataforma'
                : isExchangeHouse 
                ? 'Gestiona las órdenes de tu casa de cambio'
                : 'Gestiona tus órdenes'
              }
            </p>
          </div>
          {(isExchangeHouse || isOperator) && (
            <Button asChild>
              <Link href="/orders/create">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Orden
              </Link>
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {orders.data.filter(o => o.status === 'completed').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {orders.data.filter(o => o.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volumen Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${orders.data.reduce((sum, order) => sum + parseFloat(order.base_amount), 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Órdenes</CardTitle>
            <CardDescription>
              Todas las órdenes registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.data.length > 0 ? (
                orders.data.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{order.order_number}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {order.currency_pair.symbol} • {order.exchange_house.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Por: {order.user.name} • {new Date(order.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">${order.base_amount}</p>
                      <p className="text-xs text-muted-foreground">→ ${order.quote_amount}</p>
                      <p className="text-xs text-muted-foreground">
                        Margen: {order.expected_margin_percent}%
                        {order.actual_margin_percent && ` → ${order.actual_margin_percent}%`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay órdenes registradas</p>
                  {(isExchangeHouse || isOperator) && (
                    <Button className="mt-4" asChild>
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
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((orders.current_page - 1) * orders.per_page) + 1} a {Math.min(orders.current_page * orders.per_page, orders.total)} de {orders.total} órdenes
                </p>
                <div className="flex items-center gap-2">
                  {orders.current_page > 1 && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/orders?page=${orders.current_page - 1}`}>
                        Anterior
                      </Link>
                    </Button>
                  )}
                  {orders.current_page < orders.last_page && (
                    <Button variant="outline" size="sm" asChild>
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