import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  BarChart3,
  CreditCard,
  Zap
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ExchangeHouse {
  id: number;
  name: string;
  business_name: string;
  daily_limit: string;
  commission_rate: string;
}

interface Stats {
  ordersToday: number;
  volumeToday: string;
  commissionsMonth: string;
  dailyLimitUsed: string;
  volumeYesterday?: string;
  ordersYesterday?: number;
  commissionsLastMonth?: string;
  owedToKuberafi: string;
  owedThisMonth: string;
  platformFeeMonth: string;
}

interface Order {
  id: number;
  order_number: string;
  base_amount: string;
  quote_amount: string;
  status: string;
  created_at: string;
  currency_pair: {
    symbol: string;
  };
  user: {
    name: string;
  };
}

interface CurrencyPair {
  id: number;
  symbol: string;
  current_rate: string;
  base_currency: string;
  quote_currency: string;
}

interface VolumeData {
  date: string;
  volume: number;
  orders: number;
}

interface PairUsageData {
  name: string;
  value: number;
  color: string;
}

interface CommissionData {
  pair: string;
  comisiones: number;
  operaciones: number;
}

interface HourlyData {
  hora: string;
  operaciones: number;
}

interface Props {
  exchangeHouse: ExchangeHouse;
  stats: Stats;
  recentOrders: Order[];
  currencyPairs: CurrencyPair[];
  volumeData?: VolumeData[];
  pairUsageData?: PairUsageData[];
  commissionsData?: CommissionData[];
  hourlyData?: HourlyData[];
}

function ExchangeHouseSimple({ 
  exchangeHouse, 
  stats, 
  recentOrders, 
  currencyPairs,
  volumeData = [],
  pairUsageData = [],
  commissionsData = [],
  hourlyData = []
}: Props) {

  const calculateChange = (currentVal: string | number, previousVal: string | number) => {
    const current = typeof currentVal === 'string' ? parseFloat(currentVal) : currentVal;
    const previous = typeof previousVal === 'string' ? parseFloat(previousVal) : previousVal;
    
    if (previous === 0 || isNaN(previous)) {
      return current > 0 ? '+100' : '0';
    }
    
    const change = ((current - previous) / previous * 100);
    return change.toFixed(2);
  };

  const volumeChange = calculateChange(stats.volumeToday, stats.volumeYesterday || '0');
  const ordersChange = calculateChange(stats.ordersToday, stats.ordersYesterday || 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <>
      <Head title={`Dashboard - ${exchangeHouse.name}`} />
      
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {exchangeHouse.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Panel de control y analytics
            </p>
          </div>
          <Button 
            onClick={() => router.visit('/orders/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Button>
        </div>

        {/* Stats Cards Principales - Mejorados */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-700/50 hover:border-blue-500/70 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-200">Órdenes Hoy</CardTitle>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.ordersToday}</div>
              <div className="flex items-center gap-1 mt-2">
                {parseFloat(ordersChange) >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-400" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                )}
                <span className={`text-sm font-semibold ${parseFloat(ordersChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {ordersChange}%
                </span>
                <span className="text-xs text-blue-300">vs ayer</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-700/50 hover:border-purple-500/70 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Volumen Hoy</CardTitle>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">${parseFloat(stats.volumeToday).toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-2">
                {parseFloat(volumeChange) >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                <span className={`text-sm font-semibold ${parseFloat(volumeChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {volumeChange}%
                </span>
                <span className="text-xs text-purple-300">vs ayer</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-700/50 hover:border-green-500/70 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-200">Ganancias del Mes</CardTitle>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Activity className="h-5 w-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">${parseFloat(stats.commissionsMonth).toLocaleString()}</div>
              <p className="text-xs text-green-300 mt-2">
                Margen promedio: {exchangeHouse.commission_rate}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-700/50 hover:border-orange-500/70 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-200">Capacidad Usada</CardTitle>
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Target className="h-5 w-5 text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.dailyLimitUsed}%</div>
              <div className="mt-3 h-2.5 bg-gray-800/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    parseFloat(stats.dailyLimitUsed) > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                    parseFloat(stats.dailyLimitUsed) > 50 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                    'bg-gradient-to-r from-green-500 to-green-600'
                  }`}
                  style={{ width: `${stats.dailyLimitUsed}%` }}
                />
              </div>
              <p className="text-xs text-orange-300 mt-2">
                Límite diario disponible
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficas Principales */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Volumen y Órdenes (7 días) - Más grande */}
          {volumeData && volumeData.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  Rendimiento Semanal
                </CardTitle>
                <CardDescription>Volumen de transacciones últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={volumeData}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                      formatter={(value: any) => {
                        const num = typeof value === 'number' ? value : parseFloat(value);
                        return ['$' + (isNaN(num) ? '0' : num.toLocaleString()), ''];
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      name="Volumen ($)"
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorVolume)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="orders" 
                      name="Órdenes"
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorOrders)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Distribución por Pares - Mejorado */}
          {pairUsageData && pairUsageData.length > 0 && (
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  Pares Más Usados
                </CardTitle>
                <CardDescription>Distribución de operaciones por par de divisas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  {/* Gráfico */}
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pairUsageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                        label={({ name, percent }) => `${(percent * 100).toFixed(1)}%`}
                        labelLine={false}
                      >
                        {pairUsageData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke="#1f2937"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                        formatter={(value: any) => {
                          const num = typeof value === 'number' ? value : parseInt(value);
                          return [(isNaN(num) ? '0' : num) + ' operaciones', ''];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Leyenda personalizada */}
                  <div className="grid grid-cols-2 gap-3">
                    {pairUsageData.map((entry, index) => {
                      const total = pairUsageData.reduce((sum, item) => sum + item.value, 0);
                      const percentage = ((entry.value / total) * 100).toFixed(1);
                      
                      return (
                        <div 
                          key={`legend-${index}`}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all"
                        >
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: entry.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{entry.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">{entry.value} ops</span>
                              <span className="text-xs text-gray-600">•</span>
                              <span className="text-xs font-medium text-green-400">{percentage}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Gráficas Secundarias */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Comisiones por Par */}
          {commissionsData && commissionsData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  Rentabilidad por Par
                </CardTitle>
                <CardDescription>Top pares generadores de comisiones</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={commissionsData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="category" dataKey="pair" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                      formatter={(value: any) => {
                        const num = typeof value === 'number' ? value : parseFloat(value);
                        return ['$' + (isNaN(num) ? '0.00' : num.toFixed(2)), ''];
                      }}
                    />
                    <Bar dataKey="comisiones" name="Comisiones" fill="#10b981" radius={[8, 8, 0, 0]}>
                      {commissionsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${142 + index * 10}, 70%, ${50 - index * 3}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Actividad Horaria */}
          {hourlyData && hourlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Horas Pico de Actividad
                </CardTitle>
                <CardDescription>Distribución horaria de operaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hora" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                      formatter={(value: any) => {
                        const num = typeof value === 'number' ? value : parseInt(value);
                        return [(isNaN(num) ? '0' : num) + ' operaciones', ''];
                      }}
                    />
                    <Bar dataKey="operaciones" name="Operaciones" fill="#f59e0b" radius={[8, 8, 0, 0]}>
                      {hourlyData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.operaciones > 5 ? '#10b981' : entry.operaciones > 2 ? '#f59e0b' : '#6b7280'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>



        {/* Órdenes Recientes - Mejorado */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  Actividad Reciente
                </CardTitle>
                <CardDescription>Últimas transacciones procesadas</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.visit('/orders')}
              >
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.slice(0, 6).map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-800 hover:border-gray-700 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => router.visit(`/orders/${order.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      order.status === 'completed' ? 'bg-green-900/50' :
                      order.status === 'pending' ? 'bg-yellow-900/50' :
                      order.status === 'processing' ? 'bg-blue-900/50' :
                      'bg-red-900/50'
                    }`}>
                      <DollarSign className={`h-6 w-6 ${
                        order.status === 'completed' ? 'text-green-400' :
                        order.status === 'pending' ? 'text-yellow-400' :
                        order.status === 'processing' ? 'text-blue-400' :
                        'text-red-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{order.order_number}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                          {order.currency_pair.symbol}
                        </Badge>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-400">{order.user.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">${parseFloat(order.base_amount).toFixed(2)}</p>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
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

ExchangeHouseSimple.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default ExchangeHouseSimple;
