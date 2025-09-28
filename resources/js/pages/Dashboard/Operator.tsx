import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  DollarSign, 
  Clock,
  Plus,
  TrendingUp
} from 'lucide-react';

interface Stats {
  myOrdersToday: number;
  myVolumeToday: string;
}

interface Order {
  id: number;
  order_number: string;
  base_amount: string;
  quote_amount: string;
  status: string;
  created_at: string;
  exchange_house: {
    name: string;
  };
  currency_pair: {
    symbol: string;
  };
}

interface Props {
  stats: Stats;
  recentOrders: Order[];
}

function OperatorDashboard({ stats, recentOrders }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Head title="Dashboard - Operador" />
      
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mi Dashboard</h1>
            <p className="text-muted-foreground">
              Panel de control del operador
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Órdenes Hoy</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myOrdersToday}</div>
              <p className="text-xs text-muted-foreground">
                Transacciones procesadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mi Volumen Hoy</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.myVolumeToday}</div>
              <p className="text-xs text-muted-foreground">
                En transacciones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rendimiento</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Excelente</div>
              <p className="text-xs text-muted-foreground">
                Basado en tus métricas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Órdenes Recientes</CardTitle>
            <CardDescription>
              Tus últimas transacciones procesadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.exchange_house.name} • {order.currency_pair.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">${order.base_amount}</p>
                      <p className="text-xs text-muted-foreground">→ ${order.quote_amount}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tienes órdenes recientes</p>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primera Orden
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

OperatorDashboard.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default OperatorDashboard;