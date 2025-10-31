import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  DollarSign, 
  Building2, 
  TrendingUp, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap,
  CreditCard,
  TrendingDown,
  Percent
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface Stats {
  totalExchangeHouses: number;
  totalUsers: number;
  totalOrdersToday: number;
  totalVolumeToday: string;
  totalVolumeMonth: string;
  platformCommissionsToday: string;
  platformCommissionsMonth: string;
  ordersGrowth: number;
  volumeGrowth: number;
  commissionsGrowth: number;
  monthlyVolumeGrowth: number;
  platformCommissionRate: number;
}

interface ChartData {
  last7Days: Array<{
    date: string;
    day: string;
    orders: number;
    volume: number;
    commissions: number;
  }>;
  monthlyData: Array<{
    month: number;
    name: string;
    orders: number;
    volume: number;
    commissions: number;
  }>;
  currencyPairs: Array<{
    symbol: string;
    count: number;
    volume: number;
  }>;
  orderStatus: Array<{
    status: string;
    count: number;
  }>;
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
  user: {
    name: string;
  };
}

interface ExchangeHouse {
  id: number;
  name: string;
  orders_sum_base_amount: string;
  orders_count: number;
}

interface Props {
  stats: Stats;
  chartData: ChartData;
  recentOrders: Order[];
  topExchangeHouses: ExchangeHouse[];
}

function SuperAdminImproved({ stats, chartData, recentOrders, topExchangeHouses }: Props) {
  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        <span className="text-sm font-medium">{Math.abs(growth).toFixed(1)}%</span>
      </div>
    );
  };

  // Colores para gráficos
  const STATUS_COLORS = {
    completed: '#10b981',
    pending: '#f59e0b',
    processing: '#3b82f6',
    cancelled: '#ef4444',
    failed: '#6b7280'
  };

  const PAIR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  // Preparar datos para gráfico de pares
  const pairChartData = chartData.currencyPairs.slice(0, 6).map((pair, index) => ({
    name: pair.symbol,
    value: parseFloat(pair.volume.toString()),
    count: pair.count,
    color: PAIR_COLORS[index % PAIR_COLORS.length]
  }));

  // Preparar datos para gráfico de estados
  const statusChartData = chartData.orderStatus.map(status => ({
    name: status.status === 'completed' ? 'Completadas' :
          status.status === 'pending' ? 'Pendientes' :
          status.status === 'processing' ? 'Procesando' :
          status.status === 'cancelled' ? 'Canceladas' : 'Fallidas',
    value: status.count,
    color: STATUS_COLORS[status.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.failed
  }));

  return (
    <>
      <Head title="Panel Ejecutivo - Kuberafi" />
      
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel Ejecutivo</h1>
          <p className="text-muted-foreground mt-1">
            Vista general del negocio • Comisión: {stats.platformCommissionRate}%
          </p>
        </div>

        {/* KPIs Principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Comisiones del Mes */}
          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-900/50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                </div>
                {formatGrowth(stats.commissionsGrowth)}
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                ${stats.platformCommissionsMonth}
              </div>
              <p className="text-sm text-purple-300">Comisiones del Mes</p>
              <p className="text-xs text-muted-foreground mt-1">
                Hoy: ${stats.platformCommissionsToday}
              </p>
            </CardContent>
          </Card>

          {/* Volumen del Mes */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-900/50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                {formatGrowth(stats.monthlyVolumeGrowth)}
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                ${stats.totalVolumeMonth}
              </div>
              <p className="text-sm text-blue-300">Volumen del Mes</p>
              <p className="text-xs text-muted-foreground mt-1">
                Hoy: ${stats.totalVolumeToday}
              </p>
            </CardContent>
          </Card>

          {/* Casas de Cambio */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Building2 className="h-5 w-5 text-green-400" />
                </div>
                <Badge className="bg-green-900/50 text-green-400 border-green-700">
                  Activas
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats.totalExchangeHouses}
              </div>
              <p className="text-sm text-muted-foreground">Casas de Cambio</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalUsers} usuarios totales
              </p>
            </CardContent>
          </Card>

          {/* Órdenes Hoy */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Activity className="h-5 w-5 text-yellow-400" />
                </div>
                {formatGrowth(stats.ordersGrowth)}
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats.totalOrdersToday}
              </div>
              <p className="text-sm text-muted-foreground">Órdenes Hoy</p>
              <p className="text-xs text-muted-foreground mt-1">
                Transacciones procesadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Principales */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Volumen y Comisiones (7 días) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                Volumen y Comisiones
              </CardTitle>
              <CardDescription>Últimos 7 días</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.last7Days}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCommissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }} 
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    name="Volumen"
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorVolume)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="commissions" 
                    name="Comisiones"
                    stroke="#a855f7" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCommissions)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribución por Pares */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-400" />
                Pares Más Usados
              </CardTitle>
              <CardDescription>Volumen por par de divisas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={pairChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pairChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Secundarios */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Tendencia Mensual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Tendencia del Año
              </CardTitle>
              <CardDescription>Órdenes por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }} 
                  />
                  <Bar dataKey="orders" name="Órdenes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Estados de Órdenes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-400" />
                Estado de Órdenes
              </CardTitle>
              <CardDescription>Distribución este mes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Casas de Cambio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-400" />
              Top Casas de Cambio
            </CardTitle>
            <CardDescription>Ranking por volumen del mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topExchangeHouses.map((house, index) => {
                const volume = parseFloat(house.orders_sum_base_amount || '0');
                const maxVolume = parseFloat(topExchangeHouses[0]?.orders_sum_base_amount || '1');
                const percentage = (volume / maxVolume) * 100;
                
                return (
                  <div key={house.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-900/50 text-yellow-400' :
                          index === 1 ? 'bg-gray-700 text-gray-300' :
                          index === 2 ? 'bg-orange-900/50 text-orange-400' :
                          'bg-gray-800 text-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{house.name}</p>
                          <p className="text-sm text-muted-foreground">{house.orders_count} órdenes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">${volume.toFixed(2)}</p>
                        <p className="text-sm text-green-400">+{stats.platformCommissionRate}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Órdenes Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-400" />
              Transacciones Recientes
            </CardTitle>
            <CardDescription>Últimas operaciones en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.slice(0, 6).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-800 hover:bg-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">{order.exchange_house.name} • {order.currency_pair.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">${parseFloat(order.base_amount).toFixed(2)}</p>
                    <Badge className={
                      order.status === 'completed' ? 'bg-green-900/50 text-green-400 border-green-700' :
                      order.status === 'pending' ? 'bg-yellow-900/50 text-yellow-400 border-yellow-700' :
                      order.status === 'processing' ? 'bg-blue-900/50 text-blue-400 border-blue-700' :
                      'bg-red-900/50 text-red-400 border-red-700'
                    }>
                      {order.status === 'completed' ? 'Completada' :
                       order.status === 'pending' ? 'Pendiente' :
                       order.status === 'processing' ? 'Procesando' : 'Cancelada'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

SuperAdminImproved.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default SuperAdminImproved;
