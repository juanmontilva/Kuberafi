import { Head } from '@inertiajs/react';
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
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  LineChart,
  Line,
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
  Rectangle,
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
  [key: string]: string | number; // Index signature for Recharts compatibility
}

interface CommissionsData {
  pair: string;
  comisiones: number;
  operaciones: number;
}

interface HourlyData {
  hora: string;
  operaciones: number;
}

interface TopClientData {
  name: string;
  volumen: number;
  operaciones: number;
  comision: number;
}

interface RateComparisonData {
  pair: string;
  current: number;
  market: number;
}

interface Props {
  exchangeHouse: ExchangeHouse;
  stats: Stats;
  recentOrders: Order[];
  currencyPairs: CurrencyPair[];
  volumeData?: VolumeData[];
  pairUsageData?: PairUsageData[];
  commissionsData?: CommissionsData[];
  hourlyData?: HourlyData[];
  topClientsData?: TopClientData[];
  rateComparisonData?: RateComparisonData[];
}

function ExchangeHouseBinance({ 
  exchangeHouse, 
  stats, 
  recentOrders, 
  currencyPairs,
  volumeData = [],
  pairUsageData = [],
  commissionsData = [],
  hourlyData = [],
  topClientsData = [],
  rateComparisonData = []
}: Props) {
  const volumeChange = stats.volumeYesterday 
    ? ((parseFloat(stats.volumeToday) - parseFloat(stats.volumeYesterday)) / parseFloat(stats.volumeYesterday) * 100).toFixed(2)
    : '0';
  
  const ordersChange = stats.ordersYesterday
    ? ((stats.ordersToday - stats.ordersYesterday) / stats.ordersYesterday * 100).toFixed(2)
    : '0';

  const commissionsChange = stats.commissionsLastMonth
    ? ((parseFloat(stats.commissionsMonth) - parseFloat(stats.commissionsLastMonth)) / parseFloat(stats.commissionsLastMonth) * 100).toFixed(2)
    : '0';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <>
      <Head title={`Dashboard - ${exchangeHouse.name}`} />
      
      <div className="space-y-6 pb-8 bg-black min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {exchangeHouse.name}
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              {exchangeHouse.business_name}
            </p>
          </div>
          <Button className="bg-white text-black hover:bg-gray-100 shadow-sm transition-all">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Button>
        </div>

        {/* Stats Cards - Estilo Elegante */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Órdenes Hoy */}
          <Card className="bg-black border-2 border-slate-700/50 hover:border-blue-500 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Órdenes Hoy</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.ordersToday}</div>
              <div className="flex items-center gap-1 mt-2">
                {parseFloat(ordersChange) >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-400" />
                )}
                <span className={`text-xs font-semibold ${parseFloat(ordersChange) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {ordersChange}%
                </span>
                <span className="text-xs text-gray-500">vs ayer</span>
              </div>
            </CardContent>
          </Card>

          {/* Volumen Hoy */}
          <Card className="bg-black border-2 border-blue-700/50 hover:border-blue-500 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Volumen Hoy</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DollarSign className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">${parseFloat(stats.volumeToday).toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-2">
                {parseFloat(volumeChange) >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span className={`text-xs font-semibold ${parseFloat(volumeChange) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {volumeChange}%
                </span>
                <span className="text-xs text-gray-500">vs ayer</span>
              </div>
            </CardContent>
          </Card>

          {/* Comisiones */}
          <Card className="bg-black border-2 border-emerald-700/50 hover:border-emerald-500 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Comisiones Mes</CardTitle>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Activity className="h-4 w-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">${parseFloat(stats.commissionsMonth).toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">{commissionsChange}%</span>
                <span className="text-xs text-gray-500">Tasa: {exchangeHouse.commission_rate}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Límite Diario */}
          <Card className="bg-black border-2 border-purple-700/50 hover:border-purple-500 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Límite Diario</CardTitle>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <PieChartIcon className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.dailyLimitUsed}%</div>
              <div className="mt-3 h-2 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 shadow-lg shadow-purple-500/50"
                  style={{ width: `${stats.dailyLimitUsed}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Límite: ${parseFloat(exchangeHouse.daily_limit).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Gráfica de Volumen - 2 columnas */}
          <Card className="md:col-span-2 bg-black border-2 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-white text-base sm:text-lg">Volumen y Órdenes (Últimos 7 días)</CardTitle>
              <CardDescription className="text-gray-400 text-xs sm:text-sm">Tendencia de transacciones</CardDescription>
            </CardHeader>
            <CardContent className="bg-black p-2 sm:p-6">
              <ResponsiveContainer width="100%" height={250} className="sm:!h-[320px]">
                <AreaChart data={volumeData.length > 0 ? volumeData : [{ date: 'Sin datos', volume: 0, orders: 0 }]} style={{ backgroundColor: 'transparent' }} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af" 
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <Tooltip 
                    cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '5 5' }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.95)', 
                      border: '1px solid #475569', 
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: '#ffffff', fontSize: '12px' }}
                    labelStyle={{ color: '#ffffff', fontWeight: '600', fontSize: '13px' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                    iconType="circle"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorVolume)" 
                    name="Volumen ($)"
                    dot={false}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorOrders)" 
                    name="Órdenes"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfica de Pares Más Usados - 1 columna */}
          <Card className="bg-black border-2 border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-white text-base sm:text-lg">Pares Más Usados</CardTitle>
              <CardDescription className="text-gray-400 text-xs sm:text-sm">Distribución de operaciones</CardDescription>
            </CardHeader>
            <CardContent className="bg-black p-2 sm:p-6">
              <ResponsiveContainer width="100%" height={280} className="sm:!h-[350px]">
                <PieChart style={{ backgroundColor: 'transparent' }}>
                  <Pie
                    data={pairUsageData.length > 0 ? pairUsageData : [{ name: 'Sin datos', value: 1, color: '#6b7280' }]}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    label={(entry: any) => `${(entry.percent * 100).toFixed(1)}%`}
                    outerRadius={70}
                    innerRadius={45}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pairUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.95)', 
                      border: '1px solid #475569', 
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: '#ffffff', fontSize: '12px' }}
                    labelStyle={{ color: '#ffffff', fontSize: '13px' }}
                    formatter={(value: any, name: string) => [`${value} ops`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={70}
                    wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}
                    iconType="circle"
                    formatter={(value, entry: any) => {
                      const total = pairUsageData.reduce((sum, item) => sum + item.value, 0);
                      const percent = total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : '0';
                      return <span style={{ color: '#d1d5db', marginLeft: '8px' }}>{value} ({percent}%)</span>;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Nueva fila de gráficas adicionales */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Comisiones por Par */}
          <Card className="bg-black border-2 border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white text-lg">Comisiones por Par</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Ganancia generada por cada par de divisas</CardDescription>
            </CardHeader>
            <CardContent className="bg-black">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={commissionsData.length > 0 ? commissionsData : [{ pair: 'Sin datos', comisiones: 0, operaciones: 0 }]} style={{ backgroundColor: 'transparent' }}>
                  <defs>
                    <linearGradient id="colorComisiones" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="pair" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    cursor={<Rectangle fill="transparent" stroke="transparent" />}
                    contentStyle={{ 
                      backgroundColor: '#000000', 
                      border: '1px solid #475569', 
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: '#ffffff', fontWeight: '600' }}
                  />
                  <Legend />
                  <Bar dataKey="comisiones" fill="url(#colorComisiones)" name="Comisiones ($)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="operaciones" fill="#8b5cf6" name="Operaciones" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Horarios Pico */}
          <Card className="bg-black border-2 border-slate-700/50 hover:border-amber-500/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white text-lg">Horarios Pico de Operaciones</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Distribución de operaciones por hora</CardDescription>
            </CardHeader>
            <CardContent className="bg-black">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={hourlyData.length > 0 ? hourlyData : [{ hora: '00:00', operaciones: 0 }]} style={{ backgroundColor: 'transparent' }}>
                  <defs>
                    <linearGradient id="colorHour" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hora" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    cursor={false}
                    contentStyle={{ 
                      backgroundColor: '#000000', 
                      border: '1px solid #475569', 
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: '#ffffff', fontWeight: '600' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="operaciones" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    fill="url(#colorHour)"
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Comparación de Tasas */}
        <Card className="bg-black border-2 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white text-lg">Comparación de Tasas vs Mercado</CardTitle>
            <CardDescription className="text-gray-400 text-sm">Tus tasas comparadas con el promedio del mercado</CardDescription>
          </CardHeader>
          <CardContent className="bg-black">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={rateComparisonData.length > 0 ? rateComparisonData : [{ pair: 'Sin datos', current: 0, market: 0 }]} style={{ backgroundColor: 'transparent' }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="pair" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  cursor={<Rectangle fill="transparent" stroke="transparent" />}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(71, 85, 105, 0.5)', 
                    borderRadius: '12px',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                  }}
                  labelStyle={{ color: '#fff', fontWeight: '600' }}
                />
                <Legend />
                <Bar dataKey="current" fill="#3b82f6" name="Tu Tasa" radius={[8, 8, 0, 0]} />
                <Bar dataKey="market" fill="#10b981" name="Mercado" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Clientes */}
        <Card className="bg-black border-2 border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white text-lg">Top 5 Clientes del Mes</CardTitle>
            <CardDescription className="text-gray-400 text-sm">Clientes con mayor volumen de operaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClientsData.length > 0 ? topClientsData.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-black border border-slate-700/50 hover:border-indigo-500 transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{client.name}</p>
                      <p className="text-xs text-gray-400">{client.operaciones} operaciones</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-400">${client.volumen.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Comisión: ${client.comision}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No hay datos de clientes disponibles</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Orders */}
          <Card className="col-span-4 bg-black border-2 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white text-lg">Órdenes Recientes</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Tus últimas transacciones en tiempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-black border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white">{order.order_number}</p>
                      <p className="text-xs text-gray-400">
                        {order.currency_pair.symbol} • {order.user.name}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-mono font-bold text-white">${parseFloat(order.base_amount).toLocaleString()}</p>
                      <Badge className={`${getStatusColor(order.status)} border`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Currency Pairs - Estilo Elegante */}
          <Card className="col-span-3 bg-black border-2 border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white text-lg">Pares de Divisas</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Tasas en tiempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currencyPairs.map((pair) => (
                  <div key={pair.id} className="flex items-center justify-between p-4 rounded-xl bg-black border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
                    <div>
                      <p className="text-sm font-bold text-white">{pair.symbol}</p>
                      <p className="text-xs text-gray-400">
                        {pair.base_currency} → {pair.quote_currency}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-mono font-bold text-blue-400">
                        {parseFloat(pair.current_rate).toFixed(4)}
                      </p>
                      <div className="flex items-center justify-end gap-1 text-xs">
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">+2.5%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

ExchangeHouseBinance.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default ExchangeHouseBinance;
