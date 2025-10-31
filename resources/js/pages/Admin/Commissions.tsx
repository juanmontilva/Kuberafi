import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  DollarSign,
  Calendar,
  TrendingUp,
  Tag
} from 'lucide-react';

interface Commission {
  id: number;
  amount: string;
  rate_percent: string;
  base_amount: string;
  status: string;
  created_at: string;
  has_promo: boolean;
  order: {
    order_number: string;
    exchange_house: {
      name: string;
    };
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
  platformCommissionRate: string;
}

interface Props {
  commissions: PaginatedCommissions;
  stats: Stats;
}

function AdminCommissions({ commissions, stats }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      // Negro elegante: superficie negra con acentos en texto/borde
      case 'paid': return 'bg-black text-green-400 border border-green-700';
      case 'pending': return 'bg-black text-yellow-400 border border-yellow-700';
      case 'cancelled': return 'bg-black text-red-400 border border-red-700';
      default: return 'bg-black text-gray-300 border border-gray-700';
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
      <Head title="Comisiones de Plataforma" />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comisiones de Plataforma</h1>
          <p className="text-muted-foreground">
            Gestiona las comisiones generadas por la plataforma ({stats.platformCommissionRate}%)
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
              <CardTitle className="text-sm font-medium">Tasa</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.platformCommissionRate}%</div>
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
              Todas las comisiones generadas por la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commissions.data.length > 0 ? (
                commissions.data.map((commission) => (
                  <div key={commission.id} className="flex items-center justify-between p-4 rounded-lg bg-black border border-gray-800 hover:bg-gray-900">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{commission.order.order_number}</p>
                        <Badge className={getStatusColor(commission.status)}>
                          {getStatusText(commission.status)}
                        </Badge>
                        {commission.has_promo && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            <Tag className="h-3 w-3 mr-1" />
                            Promoción 0%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {commission.order.exchange_house.name} • {commission.order.currency_pair.symbol}
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
                        {parseFloat(commission.rate_percent).toFixed(4)}% de ${commission.base_amount}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay comisiones registradas</p>
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

AdminCommissions.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default AdminCommissions;