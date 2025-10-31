import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  DollarSign, 
  Clock,
  Plus,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Target,
  Users,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Activity,
  Award
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Stats {
  today: {
    orders: number;
    completed: number;
    pending: number;
    volume: number;
    commission: number;
  };
  week: {
    orders: number;
    volume: number;
    commission: number;
  };
  month: {
    orders: number;
    volume: number;
    commission: number;
  };
  uniqueCustomers: number;
  conversionRate: number;
}

interface ChartDataPoint {
  date: string;
  orders: number;
  volume: number;
  commission: number;
}

interface TopPair {
  symbol: string;
  total_orders: number;
  total_volume: number;
  total_commission: number;
}

interface StatusData {
  status: string;
  count: number;
  volume: number;
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
  customer?: {
    name: string;
  };
}

interface Props {
  stats: Stats;
  chartData: ChartDataPoint[];
  topPairs: TopPair[];
  statusDistribution: StatusData[];
  recentOrders: Order[];
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'];

function OperatorDashboard({ stats, chartData, topPairs, statusDistribution, recentOrders }: Props) {
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: 'Completadas',
      pending: 'Pendientes',
      processing: 'Procesando',
      cancelled: 'Canceladas',
      failed: 'Fallidas',
    };
    return labels[status] || status;
  };

  // Preparar datos para el gráfico de pie
  const pieData = statusDistribution.map((item, index) => ({
    name: getStatusLabel(item.status),
    value: item.count,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <>
      <Head title="Dashboard - Operador" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mi Dashboard</h1>
            <p className="text-muted-foreground">
              Resumen de tu actividad y rendimiento
            </p>
          </div>
          <Button 
            size="lg" 
            className="gap-2"
            onClick={() => router.visit('/orders/create')}
          >
            <Plus className="h-5 w-5" />
            Nueva Orden
          </Button>
        </div>

        {/* Stats Cards - Hoy */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad de Hoy
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Órdenes</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.today.orders}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <CheckCircle className="inline h-3 w-3 text-green-500 mr-1" />
                  {stats.today.completed} completadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Volumen</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.today.volume.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Operado hoy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comisiones</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  ${stats.today.commission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ganadas hoy
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
                  {stats.today.pending}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Por completar
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Cards - Mes */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Resumen del Mes
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.month.orders}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Este mes
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
                  ${stats.month.volume.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Operado este mes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comisiones Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  ${stats.month.commission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ganadas este mes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.conversionRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Eficiencia
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Evolución Semanal */}
          <Card>
            <CardHeader>
              <CardTitle>Evolución Últimos 7 Días</CardTitle>
              <CardDescription>
                Volumen y órdenes procesadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="#3b82f6" name="Órdenes" strokeWidth={2} />
                  <Line type="monotone" dataKey="volume" stroke="#10b981" name="Volumen" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribución por Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Órdenes</CardTitle>
              <CardDescription>
                Por estado este mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Pares y Órdenes Recientes */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Top Pares */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Pares de Divisas
              </CardTitle>
              <CardDescription>
                Tus pares más operados este mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topPairs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay datos disponibles
                </p>
              ) : (
                <div className="space-y-3">
                  {topPairs.map((pair, index) => (
                    <div key={pair.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{pair.symbol}</p>
                          <p className="text-xs text-muted-foreground">
                            {pair.total_orders} operaciones
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ${parseFloat(pair.total_volume.toString()).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-green-500">
                          +${parseFloat(pair.total_commission.toString()).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Órdenes Recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Órdenes Recientes</CardTitle>
              <CardDescription>
                Tus últimas transacciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-4">No tienes órdenes recientes</p>
                  <Button onClick={() => router.visit('/orders/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primera Orden
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.visit(`/orders/${order.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{order.order_number}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.currency_pair.symbol} • {order.customer?.name || 'Sin cliente'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          ${parseFloat(order.base_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accede rápidamente a las funciones más usadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => router.visit('/orders/create')}
              >
                <Plus className="h-6 w-6" />
                <span>Nueva Orden</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => router.visit('/orders')}
              >
                <ShoppingCart className="h-6 w-6" />
                <span>Mis Órdenes</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => router.visit('/customers')}
              >
                <Users className="h-6 w-6" />
                <span>Mis Clientes</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => router.visit('/my-performance')}
              >
                <Activity className="h-6 w-6" />
                <span>Mi Rendimiento</span>
              </Button>
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
