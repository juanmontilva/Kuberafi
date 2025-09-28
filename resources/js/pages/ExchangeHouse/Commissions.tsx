import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { useAuth } from '@/hooks/use-auth';
import { 
  DollarSign,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface Commission {
  id: number;
  amount: string;
  rate_percent: string;
  base_amount: string;
  status: string;
  created_at: string;
  order: {
    order_number: string;
    currency_pair: {
      symbol: string;
    };
  };
}

interface PaginatedCommissions {
  data: Commission[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Stats {
  totalCommissions: string;
  monthlyCommissions: string;
}

interface Props {
  commissions: PaginatedCommissions;
  stats: Stats;
}

function ExchangeHouseCommissions({ commissions, stats }: Props) {
  const { user } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <>
      <Head title="Mis Comisiones" />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Comisiones</h1>
          <p className="text-muted-foreground">
            Comisiones generadas por {user.exchange_house?.name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comisiones</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalCommissions}</div>
              <p className="text-xs text-muted-foreground">
                Desde el inicio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.monthlyCommissions}</div>
              <p className="text-xs text-muted-foreground">
                Comisiones del mes actual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mi Tasa</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {commissions.data.length > 0 
                  ? `${parseFloat(commissions.data[0].rate_percent).toFixed(2)}%`
                  : 'N/A'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Por transacción
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Commissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Comisiones</CardTitle>
            <CardDescription>
              Todas las comisiones generadas por tus transacciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commissions.data.length > 0 ? (
                commissions.data.map((commission) => (
                  <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{commission.order.order_number}</p>
                        <Badge className={getStatusColor(commission.status)}>
                          {getStatusText(commission.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {commission.order.currency_pair.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(commission.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium text-green-600">${commission.amount}</p>
                      <p className="text-xs text-muted-foreground">
                        {parseFloat(commission.rate_percent).toFixed(2)}% de ${commission.base_amount}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tienes comisiones registradas</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Las comisiones se generan automáticamente cuando completas órdenes
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {commissions.last_page > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((commissions.current_page - 1) * commissions.per_page) + 1} a {Math.min(commissions.current_page * commissions.per_page, commissions.total)} de {commissions.total} comisiones
                </p>
                <div className="flex items-center gap-2">
                  {commissions.current_page > 1 && (
                    <button className="px-3 py-1 text-sm border rounded hover:bg-muted">
                      Anterior
                    </button>
                  )}
                  {commissions.current_page < commissions.last_page && (
                    <button className="px-3 py-1 text-sm border rounded hover:bg-muted">
                      Siguiente
                    </button>
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

ExchangeHouseCommissions.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default ExchangeHouseCommissions;