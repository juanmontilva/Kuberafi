import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar
} from 'lucide-react';

interface Stats {
  totalOrders: number;
  totalVolume: string;
  totalCommissions: string;
  platformCommissionRate: number;
}

interface MonthlyData {
  month: number;
  orders: number;
  volume: string;
}

interface Props {
  stats: Stats;
  monthlyData: MonthlyData[];
}

function AdminReports({ stats, monthlyData }: Props) {
  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  return (
    <>
      <Head title="Reportes Avanzados" />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes Avanzados</h1>
          <p className="text-muted-foreground">
            Análisis detallado del rendimiento de la plataforma
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Desde el inicio de operaciones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volumen Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalVolume}</div>
              <p className="text-xs text-muted-foreground">
                En transacciones procesadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comisiones Generadas</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.totalCommissions}</div>
              <p className="text-xs text-muted-foreground">
                Ingresos de la plataforma
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Rendimiento Mensual {new Date().getFullYear()}
            </CardTitle>
            <CardDescription>
              Órdenes y volumen por mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.length > 0 ? (
                monthlyData.map((data) => (
                  <div key={data.month} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{getMonthName(data.month)}</p>
                      <p className="text-xs text-muted-foreground">
                        {data.orders} órdenes procesadas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${parseFloat(data.volume).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        Promedio: ${data.orders > 0 ? (parseFloat(data.volume) / data.orders).toFixed(2) : '0.00'} por orden
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay datos mensuales disponibles</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Rendimiento</CardTitle>
              <CardDescription>
                Indicadores clave de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Promedio por orden:</span>
                  <span className="text-sm font-medium">
                    ${stats.totalOrders > 0 ? (parseFloat(stats.totalVolume.replace(/,/g, '')) / stats.totalOrders).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Comisión promedio:</span>
                  <span className="text-sm font-medium">
                    ${stats.totalOrders > 0 ? (parseFloat(stats.totalCommissions.replace(/,/g, '')) / stats.totalOrders).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tasa de comisión:</span>
                  <span className="text-sm font-medium">{stats.platformCommissionRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proyecciones</CardTitle>
              <CardDescription>
                Estimaciones basadas en tendencias actuales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Órdenes este mes:</span>
                  <span className="text-sm font-medium">
                    {monthlyData.length > 0 ? monthlyData[monthlyData.length - 1]?.orders || 0 : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Volumen este mes:</span>
                  <span className="text-sm font-medium">
                    ${monthlyData.length > 0 ? parseFloat(monthlyData[monthlyData.length - 1]?.volume || '0').toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Crecimiento mensual:</span>
                  <span className="text-sm font-medium text-green-600">
                    {monthlyData.length >= 2 ? 
                      `${(((monthlyData[monthlyData.length - 1]?.orders || 0) / (monthlyData[monthlyData.length - 2]?.orders || 1) - 1) * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

AdminReports.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default AdminReports;