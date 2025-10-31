import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  DollarSign, 
  AlertTriangle,
  Calendar,
  Building2,
  CheckCircle,
  XCircle,
  Eye,
  ChevronRight,
  Home
} from 'lucide-react';

interface ExchangeHouse {
  id: number;
  name: string;
  business_name: string;
}

interface Payment {
  id: number;
  payment_number: string;
  total_amount: string;
  due_date: string;
  paid_at?: string;
  status: string;
  exchange_house: ExchangeHouse;
  days_overdue?: number;
}

interface PaginatedPayments {
  data: Payment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Stats {
  totalPending: string;
  totalCommissionPending: string;
  totalOverdue: string;
  totalCommissionOverdue: string;
  totalPaidThisMonth: string;
  totalCommissionPaidThisMonth: string;
  totalCommissionsOwed: string;
  overdueCount: number;
}

interface Props {
  payments: PaginatedPayments;
  stats: Stats;
}

function CommissionPayments({ payments, stats }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-black text-green-400 border border-green-700';
      case 'pending': return 'bg-black text-yellow-400 border border-yellow-700';
      case 'overdue': return 'bg-black text-red-400 border border-red-700';
      default: return 'bg-black text-gray-300 border border-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencido';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Head title="Pagos de Comisiones" />
      
      <div className="space-y-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm">
          <Link 
            href="/dashboard" 
            className="flex items-center px-2 py-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4 mr-1" />
            Inicio
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="px-2 py-1 bg-black border border-gray-800 text-gray-300 rounded-md font-medium">
            Pagos de Comisiones
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Pagos de Comisiones
            </h1>
            <p className="text-muted-foreground text-lg">
              Gestión de pagos a casas de cambio
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/admin/payments/dashboard">
                <DollarSign className="h-4 w-4 mr-2" />
                Dashboard de Pagos
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                💰 Comisiones Totales Pendientes
              </CardTitle>
              <DollarSign className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">
                ${stats.totalCommissionsOwed}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Lo que te deben a la plataforma
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Pendiente de Pago
              </CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${stats.totalPending}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Comisión: ${stats.totalCommissionPending}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Pagos Vencidos
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                ${stats.totalOverdue}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {stats.overdueCount} pagos | Comisión: ${stats.totalCommissionOverdue}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Pagado Este Mes
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                ${stats.totalPaidThisMonth}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Comisión: ${stats.totalCommissionPaidThisMonth}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle>Lista de Pagos</CardTitle>
            <CardDescription>
              Historial completo de pagos de comisiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                      Número
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                      Casa de Cambio
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                      Monto
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                      Fecha Vencimiento
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                      Estado
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">
                        No hay pagos registrados
                      </td>
                    </tr>
                  ) : (
                    payments.data.map((payment) => (
                      <tr 
                        key={payment.id} 
                        className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-gray-300">
                            {payment.payment_number}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-white">
                              {payment.exchange_house.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {payment.exchange_house.business_name}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-white">
                            ${payment.total_amount}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(payment.due_date).toLocaleDateString('es-ES')}
                          </div>
                          {payment.days_overdue && payment.days_overdue > 0 && (
                            <div className="text-xs text-red-400 mt-1">
                              Vencido hace {payment.days_overdue} días
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(payment.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(payment.status)}
                              {getStatusText(payment.status)}
                            </span>
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            asChild
                          >
                            <Link href={`/admin/payments/${payment.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {payments.last_page > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800">
                <div className="text-sm text-gray-400">
                  Mostrando {payments.data.length} de {payments.total} pagos
                </div>
                <div className="flex gap-2">
                  {payments.current_page > 1 && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/payments?page=${payments.current_page - 1}`}>
                        Anterior
                      </Link>
                    </Button>
                  )}
                  {payments.current_page < payments.last_page && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/payments?page=${payments.current_page + 1}`}>
                        Siguiente
                      </Link>
                    </Button>
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

CommissionPayments.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default CommissionPayments;
