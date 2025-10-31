import { Head, Link, router } from '@inertiajs/react';
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
  PieChart as PieChartIcon,
  Target,
  Timer,
  BarChart3,
  CreditCard
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
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import { useEffect, useState } from 'react';
import axios from 'axios';

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
  [key: string]: string | number;
}

interface MarginAnalysis {
  pair: string;
  avgMargin: number;
  minMargin: number;
  maxMargin: number;
  operations: number;
  volume: number;
}

interface PaymentMethodStats {
  name: string;
  type: string;
  operations: number;
  volume: number;
  avgTicket: number;
  profit: number;
}

interface ProcessingSpeed {
  averageMinutes: number;
  minMinutes: number;
  maxMinutes: number;
  totalCompleted: number;
  distribution: {
    under5min: number;
    between5and15min: number;
    between15and30min: number;
    over30min: number;
  };
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

function ExchangeHouseAdvanced({ 
  exchangeHouse, 
  stats, 
  recentOrders, 
  currencyPairs,
  volumeData = [],
  pairUsageData = [],
  commissionsData = [],
  hourlyData = []
}: Props) {
  const [marginAnalysis, setMarginAnalysis] = useState<MarginAnalysis[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodStats[]>([]);
  const [processingSpeed, setProcessingSpeed] = useState<ProcessingSpeed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdvancedAnalytics();
  }, []);

  const loadAdvancedAnalytics = async () => {
    try {
      const [marginRes, paymentRes, speedRes] = await Promise.all([
        axios.get('/analytics/margin-analysis'),
        axios.get('/analytics/payment-method-analysis'),
        axios.get('/analytics/processing-speed')
      ]);

      setMarginAnalysis(marginRes.data);
      setPaymentMethods(paymentRes.data);
      setProcessingSpeed(speedRes.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = (current: number | string, previous: number | string): string => {
    const currentVal = typeof current === 'string' ? parseFloat(current) : current;
    const previousVal = typeof previous === 'string' ? parseFloat(previous) : previous;
    
    if (!previousVal || previousVal === 0) {
      return currentVal > 0 ? '+100' : '0';
    }
    
    const change = ((currentVal - previousVal) / previousVal * 100);
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

  // Convertir distribution a formato de gráfica
  const speedDistributionData = processingSpeed ? [
    { name: '< 5 min', value: processingSpeed.distribution.under5min, color: '#10b981' },
    { name: '5-15 min', value: processingSpeed.distribution.between5and15min, color: '#3b82f6' },
    { name: '15-30 min', value: processingSpeed.distribution.between15and30min, color: '#f59e0b' },
    { name: '> 30 min', value: processingSpeed.distribution.over30min, color: '#ef4444' }
  ] : [];

  return (
    <>
      <Head title={`Dashboard Analytics - ${exchangeHouse.name}`} />
      
      <div className="space-y-6 pb-8 bg-black min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {exchangeHouse.name}
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Dashboard de Analytics Avanzado
            </p>
          </div>
          <Button 
            className="bg-white text-black hover:bg-gray-100"
            onClick={() => router.visit('/orders/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Button>
        </div>

        {/* Stats Cards Principales */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-black border-2 border-slate-700/50 hover:border-blue-500 transition-all duration-300 min-h-[120px] md:min-h-[140px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-400">Órdenes Hoy</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-white">{stats.ordersToday}</div>
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

          <Card className="bg-black border-2 border-blue-700/50 hover:border-blue-500 transition-all duration-300 min-h-[120px] md:min-h-[140px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-400">Volumen Hoy</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-white">${parseFloat(stats.volumeToday).toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-2">
                {parseFloat(volumeChange) >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span className={`text-xs font-semibold ${parseFloat(volumeChange) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {volumeChange}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-2 border-emerald-700/50 hover:border-emerald-500 transition-all duration-300 min-h-[120px] md:min-h-[140px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-400">Comisiones Mes</CardTitle>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Activity className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-emerald-400">${parseFloat(stats.commissionsMonth).toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-2">Tasa: {exchangeHouse.commission_rate}%</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-2 border-purple-700/50 hover:border-purple-500 transition-all duration-300 min-h-[120px] md:min-h-[140px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-400">Límite Diario</CardTitle>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Target className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-white">{stats.dailyLimitUsed}%</div>
              <div className="mt-3 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${stats.dailyLimitUsed}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análisis de Márgenes por Par */}
        <Card className="bg-black border-2 border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
              Análisis de Márgenes por Par de Divisas
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              Márgenes promedio, mínimos y máximos del mes actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-gray-400">Cargando datos...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={marginAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="pair" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" label={{ value: 'Margen %', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.95)', 
                      border: '1px solid #475569', 
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="avgMargin" fill="#10b981" name="Margen Promedio" radius={[8, 8, 0, 0]} />
                  <Line type="monotone" dataKey="maxMargin" stroke="#3b82f6" name="Máximo" strokeWidth={2} />
                  <Line type="monotone" dataKey="minMargin" stroke="#ef4444" name="Mínimo" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Métodos de Pago y Velocidad de Procesamiento */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Métodos de Pago */}
          <Card className="bg-black border-2 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-400" />
                Análisis por Método de Pago
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">Distribución de volumen por método</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-gray-400">Cargando...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((method, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-black border border-slate-700/50 hover:border-blue-500 transition-all">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="text-sm font-bold text-white">{method.name}</p>
                          <p className="text-xs text-gray-400">{method.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-400">${method.volume.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">{method.operations} ops</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Ticket Promedio: ${method.avgTicket.toLocaleString()}</span>
                        <span className="text-emerald-400">Ganancia: ${method.profit.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Velocidad de Procesamiento */}
          <Card className="bg-black border-2 border-slate-700/50 hover:border-amber-500/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Timer className="h-5 w-5 text-amber-400" />
                Velocidad de Procesamiento
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">Distribución de tiempos de completado</CardDescription>
            </CardHeader>
            <CardContent>
              {loading || !processingSpeed ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-gray-400">Cargando...</div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 rounded-lg bg-slate-800/30">
                      <p className="text-2xl font-bold text-emerald-400">{processingSpeed.averageMinutes}</p>
                      <p className="text-xs text-gray-400">Min Promedio</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-800/30">
                      <p className="text-2xl font-bold text-blue-400">{processingSpeed.minMinutes}</p>
                      <p className="text-xs text-gray-400">Más Rápido</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-800/30">
                      <p className="text-2xl font-bold text-amber-400">{processingSpeed.maxMinutes}</p>
                      <p className="text-xs text-gray-400">Más Lento</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={speedDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.value} (${((entry.value / processingSpeed.totalCompleted) * 100).toFixed(0)}%)`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {speedDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0, 0, 0, 0.95)', 
                          border: '1px solid #475569', 
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráficas Mejoradas */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Volumen y Órdenes Combinado */}
          <Card className="bg-black border-2 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                <Activity className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                Volumen y Órdenes (Últimos 7 días)
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs md:text-sm">
                Evolución diaria de operaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                <ComposedChart data={volumeData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis yAxisId="left" stroke="#9ca3af" />
                  <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #475569', 
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorVolume)"
                    name="Volumen ($)"
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="orders" 
                    fill="#10b981" 
                    name="Órdenes"
                    radius={[8, 8, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Comisiones por Par */}
          <Card className="bg-black border-2 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
                Top Pares por Comisiones
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs md:text-sm">
                Los 8 pares más rentables este mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {commissionsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <BarChart data={commissionsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" />
                    <YAxis dataKey="pair" type="category" stroke="#9ca3af" width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #475569', 
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                    <Bar 
                      dataKey="comisiones" 
                      fill="#10b981" 
                      name="Comisiones ($)"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  No hay datos de comisiones este mes
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Segunda fila de gráficas */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {/* Distribución de Pares */}
          <Card className="bg-black border-2 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                <PieChartIcon className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
                Top 6 Pares Más Usados
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs md:text-sm">
                % de operaciones por par
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pairUsageData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250} className="md:h-[280px]">
                  <PieChart>
                    <Pie
                      data={pairUsageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pairUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #475569',
                        color: '#fff'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-gray-500">
                  No hay datos de pares este mes
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actividad por Hora */}
          <Card className="md:col-span-2 bg-black border-2 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                <Timer className="h-4 w-4 md:h-5 md:w-5 text-orange-400" />
                Actividad por Hora del Día
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs md:text-sm">
                Distribución horaria de operaciones (últimos 30 días)
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <ResponsiveContainer width="100%" height={250} className="md:h-[280px]">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hora" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #475569', 
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Bar 
                    dataKey="operaciones" 
                    fill="#f59e0b" 
                    name="Operaciones"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Órdenes Recientes y Pares de Divisas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 bg-black border-2 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Órdenes Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-black border border-slate-700/50 hover:border-blue-500/50 transition-all">
                    <div>
                      <p className="text-sm font-medium text-white">{order.order_number}</p>
                      <p className="text-xs text-gray-400">{order.currency_pair.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">${parseFloat(order.base_amount).toLocaleString()}</p>
                      <Badge className={`${getStatusColor(order.status)} border`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3 bg-black border-2 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Pares de Divisas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currencyPairs.map((pair) => (
                  <div key={pair.id} className="flex items-center justify-between p-4 rounded-xl bg-black border border-slate-700/50">
                    <div>
                      <p className="text-sm font-bold text-white">{pair.symbol}</p>
                      <p className="text-xs text-gray-400">{pair.base_currency} → {pair.quote_currency}</p>
                    </div>
                    <p className="text-lg font-mono font-bold text-blue-400">
                      {parseFloat(pair.current_rate).toFixed(4)}
                    </p>
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

ExchangeHouseAdvanced.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default ExchangeHouseAdvanced;
