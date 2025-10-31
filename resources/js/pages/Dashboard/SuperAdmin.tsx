import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  DollarSign, 
  Building2, 
  TrendingUp, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Zap,
  Globe,
  Shield,
  FileText
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
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

function SuperAdminDashboard({ stats, chartData, recentOrders, topExchangeHouses }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      // Estilo negro elegante tipo shadcn/ui: superficie negra, acentos en texto/borde
      case 'completed': return 'bg-black text-green-400 border border-green-700';
      case 'pending': return 'bg-black text-yellow-400 border border-yellow-700';
      case 'processing': return 'bg-black text-blue-400 border border-blue-700';
      case 'cancelled': return 'bg-black text-red-400 border border-red-700';
      default: return 'bg-black text-gray-300 border border-gray-700';
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

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        <span className="text-xs font-medium">{Math.abs(growth).toFixed(1)}%</span>
      </div>
    );
  };

  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <>
      <Head title="Dashboard - Super Admin" />
      
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
              Dashboard Kuberafi
            </h1>
            <p className="text-sm md:text-base text-gray-400 mt-1 md:mt-2">
              Panel de control ejecutivo • Comisión actual: {stats.platformCommissionRate}%
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-11 md:h-10 w-full md:w-auto">
              <Activity className="h-4 w-4 mr-2" />
              Quick Create
            </Button>
          </div>
        </div>

        {/* Tarjeta Destacada de Comisiones */}
        <Card className="bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-purple-900/30 border-purple-700/50 rounded-lg shadow-lg shadow-purple-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-400" />
                <div className="text-sm font-medium text-purple-300">💰 Comisiones de Kuberafi</div>
              </div>
              <Badge className="bg-purple-900/50 text-purple-300 border-purple-700">
                {stats.platformCommissionRate}% por operación
              </Badge>
            </div>
            <div className="flex items-baseline gap-4 mb-2">
              <div className="text-4xl font-bold text-purple-400">${stats.platformCommissionsMonth}</div>
              <div className="flex items-center text-green-400 text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +{Math.abs(stats.commissionsGrowth).toFixed(1)}%
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-300">Total del mes actual</span>
              <span className="text-gray-400">Hoy: <span className="text-purple-400 font-semibold">${stats.platformCommissionsToday}</span></span>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-black border-gray-800 rounded-lg min-h-[120px] md:min-h-[140px]">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className="text-xs md:text-sm text-gray-400">Volumen Hoy</div>
                <div className="flex items-center text-green-400 text-xs md:text-sm">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +{Math.abs(stats.volumeGrowth).toFixed(1)}%
                </div>
              </div>
              <div className="text-lg md:text-2xl font-bold text-white mb-1">${stats.totalVolumeToday}</div>
              <div className="text-xs md:text-sm text-gray-400 truncate">Mes: ${stats.totalVolumeMonth}</div>
            </CardContent>
          </Card>

          <Card className="bg-black border-gray-800 rounded-lg min-h-[120px] md:min-h-[140px]">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className="text-xs md:text-sm text-gray-400">Órdenes Hoy</div>
                <div className="flex items-center text-green-400 text-xs md:text-sm">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +{Math.abs(stats.ordersGrowth).toFixed(1)}%
                </div>
              </div>
              <div className="text-lg md:text-2xl font-bold text-white mb-1">{stats.totalOrdersToday}</div>
              <div className="text-xs md:text-sm text-gray-400">Transacciones</div>
            </CardContent>
          </Card>

          <Card className="bg-black border-gray-800 rounded-lg min-h-[120px] md:min-h-[140px]">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className="text-xs md:text-sm text-gray-400">Casas</div>
                <Building2 className="h-3 w-3 md:h-4 md:w-4 text-blue-400" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-white mb-1">{stats.totalExchangeHouses}</div>
              <div className="text-xs md:text-sm text-gray-400">Activas</div>
            </CardContent>
          </Card>

          <Card className="bg-black border-gray-800 rounded-lg min-h-[120px] md:min-h-[140px]">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className="text-xs md:text-sm text-gray-400">Usuarios</div>
                <Users className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-white mb-1">{stats.totalUsers}</div>
              <div className="text-xs md:text-sm text-gray-400">Activos</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chart Section */}
        <Card className="bg-black border-gray-800">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="text-white text-base md:text-lg">Volumen Total</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Total de los últimos 3 meses</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 h-9 md:h-8 text-xs md:text-sm">
                3 meses
              </Button>
              <Button variant="outline" size="sm" className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 h-9 md:h-8 text-xs md:text-sm">
                30 días
              </Button>
              <Button variant="outline" size="sm" className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 h-9 md:h-8 text-xs md:text-sm">
                7 días
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="md:h-[350px]">
              <AreaChart data={chartData.last7Days}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
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
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorVolume)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorOrders)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="outline" className="space-y-4 md:space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <TabsList className="bg-black border-gray-800 w-full md:w-auto overflow-x-auto">
              <TabsTrigger value="outline" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white text-gray-400 text-xs md:text-sm">
                Outline
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white text-gray-400 text-xs md:text-sm">
                Performance
                <Badge className="ml-1 md:ml-2 bg-gray-800 text-gray-300 text-xs">3</Badge>
              </TabsTrigger>
              <TabsTrigger value="personnel" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white text-gray-400 text-xs md:text-sm">
                Personnel
                <Badge className="ml-1 md:ml-2 bg-gray-800 text-gray-300 text-xs">2</Badge>
              </TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white text-gray-400 text-xs md:text-sm">
                Documents
              </TabsTrigger>
            </TabsList>
            <div className="hidden md:flex gap-2">
              <Button variant="outline" size="sm" className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800">
                Customize Columns
              </Button>
              <Button variant="outline" size="sm" className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800">
                + Add Section
              </Button>
            </div>
          </div>

          <TabsContent value="outline" className="space-y-4 md:space-y-6">
            {/* Vista móvil - Cards */}
            <div className="md:hidden space-y-3">
              {topExchangeHouses.map((house, index) => (
                <div key={house.id} className="bg-black border border-gray-800 rounded-lg p-4 active:scale-[0.98] transition-transform">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">#{index + 1}</span>
                      <div>
                        <div className="text-white font-medium text-sm">{house.name}</div>
                        <div className="text-gray-400 text-xs">Casa de cambio</div>
                      </div>
                    </div>
                    <Badge className="bg-black text-green-400 border border-green-700 text-xs">
                      Activo
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xs text-gray-400">Volumen</div>
                      <div className="text-sm text-white font-medium">${house.orders_sum_base_amount || '0.00'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Órdenes</div>
                      <div className="text-sm text-white">{house.orders_count}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Comisión</div>
                      <div className="text-sm text-gray-300">2.5%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista desktop - Tabla */}
            <div className="hidden md:block bg-black border border-gray-800 rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">#</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Casa de Cambio</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Volumen</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Estado</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Órdenes</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Comisión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topExchangeHouses.map((house, index) => (
                      <tr key={house.id} className="border-b border-gray-800 hover:bg-gray-900">
                        <td className="p-4 text-gray-300">{index + 1}</td>
                        <td className="p-4">
                          <div className="text-white font-medium">{house.name}</div>
                          <div className="text-gray-400 text-sm">Casa de cambio</div>
                        </td>
                        <td className="p-4 text-white font-medium">${house.orders_sum_base_amount || '0.00'}</td>
                        <td className="p-4">
                          <Badge className="bg-black text-green-400 border border-green-700">
                            Activo
                          </Badge>
                        </td>
                        <td className="p-4 text-white">{house.orders_count}</td>
                        <td className="p-4 text-gray-300">2.5%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>



          <TabsContent value="performance" className="space-y-6">
            <div className="bg-black border border-gray-800 rounded-lg">
              <div className="p-6">
                <h3 className="text-white font-medium mb-4">Transacciones Recientes</h3>
                <div className="space-y-3">
                  {recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-black border border-gray-800 hover:bg-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">{order.order_number}</div>
                          <div className="text-gray-400 text-xs">{order.exchange_house.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">${order.base_amount}</div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="personnel" className="space-y-6">
            <div className="bg-black border border-gray-800 rounded-lg">
              <div className="p-6">
                <h3 className="text-white font-medium mb-4">Personal Clave</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black border border-gray-800 hover:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">Super Administrador</div>
                        <div className="text-gray-400 text-xs">Control total de la plataforma</div>
                      </div>
                    </div>
                    <Badge className="bg-black text-purple-400 border border-purple-700">
                      Admin
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black border border-gray-800 hover:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">Casas de Cambio</div>
                        <div className="text-gray-400 text-xs">{stats.totalExchangeHouses} casas activas</div>
                      </div>
                    </div>
                    <Badge className="bg-black text-blue-400 border border-blue-700">
                      Activo
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="bg-black border border-gray-800 rounded-lg">
              <div className="p-6">
                <h3 className="text-white font-medium mb-4">Documentos de Enfoque</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black border border-gray-800 hover:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">Configuraciones del Sistema</div>
                        <div className="text-gray-400 text-xs">Gestión de comisiones y límites</div>
                      </div>
                    </div>
                    <Badge className="bg-gray-800 text-gray-300 border-gray-700">
                      Config
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black border border-gray-800 hover:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">Reportes Avanzados</div>
                        <div className="text-gray-400 text-xs">Análisis de rendimiento</div>
                      </div>
                    </div>
                    <Badge className="bg-gray-800 text-gray-300 border-gray-700">
                      Reporte
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

SuperAdminDashboard.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default SuperAdminDashboard;