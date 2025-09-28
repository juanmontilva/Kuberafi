import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  DollarSign, 
  TrendingUp, 
  Clock,
  Plus,
  ArrowUpRight
} from 'lucide-react';

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

interface Props {
  exchangeHouse: ExchangeHouse;
  stats: Stats;
  recentOrders: Order[];
  currencyPairs: CurrencyPair[];
}

function ExchangeHouseDashboard({ 
  exchangeHouse, 
  stats, 
  recentOrders, 
  currencyPairs 
}: Props) {
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
      <Head title={`Dashboard - ${exchangeHouse.name}`} />
      
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{exchangeHouse.name}</h1>
            <p className="text-muted-foreground">
              {exchangeHouse.business_name}
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Órdenes Hoy</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ordersToday}</div>
              <p className="text-xs text-muted-foreground">
                Transacciones procesadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volumen Hoy</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.volumeToday}</div>
              <p className="text-xs text-muted-foreground">
                En transacciones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comisiones Mes</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.commissionsMonth}</div>
              <p className="text-xs text-muted-foreground">
                Tasa: {exchangeHouse.commission_rate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Límite Diario</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.dailyLimitUsed}%</div>
              <Progress value={parseFloat(stats.dailyLimitUsed)} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Límite: ${exchangeHouse.daily_limit}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Orders */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Órdenes Recientes</CardTitle>
              <CardDescription>
                Tus últimas transacciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.currency_pair.symbol} • {order.user.name}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">${order.base_amount}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Currency Pairs */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Pares de Divisas</CardTitle>
              <CardDescription>
                Tasas actuales del mercado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currencyPairs.map((pair) => (
                  <div key={pair.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{pair.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        {pair.base_currency} → {pair.quote_currency}
                      </p>
                    </div>
                    <p className="text-sm font-mono">
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

ExchangeHouseDashboard.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default ExchangeHouseDashboard;