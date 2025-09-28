import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  DollarSign, 
  AlertTriangle,
  Calendar,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw
} from 'lucide-react';

interface ExchangeHouse {
  id: number;
  name: string;
  business_name: string;
}

interface PendingByHouse {
  house: ExchangeHouse;
  total: number;
  count: number;
  oldest: string;
}

interface Payment {
  id: number;
  payment_number: string;
  total_amount: string;
  due_date: string;
  status: string;
  exchange_house: ExchangeHouse;
  days_overdue?: number;
}

interface Props {
  pendingByHouse: PendingByHouse[];
  overduePayments: Payment[];
  upcomingPayments: Payment[];
}

function PaymentsDashboard({ pendingByHouse, overduePayments, upcomingPayments }: Props) {
  const { post, processing } = useForm();

  const generatePayments = () => {
    post('/admin/payments/generate');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      // Estilo shadcn/ui: superficies negras, acentos solo en texto/borde
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

  const totalPending = pendingByHouse.reduce((sum, item) => sum + item.total, 0);
  const totalOverdue = overduePayments.reduce((sum, payment) => sum + parseFloat(payment.total_amount), 0);

  return (
    <>
      <Head title="Gestión de Pagos - Kuberafi" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Gestión de Pagos de Comisiones
            </h1>
            <p className="text-gray-400 mt-2">
              Control financiero profesional de pagos por comisiones
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={generatePayments} 
              disabled={processing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
              Generar Pagos
            </Button>
            <Button asChild variant="outline" className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800">
              <Link href="/admin/payment-schedules">
                <Plus className="h-4 w-4 mr-2" />
                Cronogramas
              </Link>
            </Button>
          </div>
        </div>

        {/* Alertas importantes */}
        {overduePayments.length > 0 && (
          <Alert className="bg-black border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              <strong>¡Atención!</strong> Tienes {overduePayments.length} pagos vencidos por un total de ${totalOverdue.toFixed(2)}
            </AlertDescription>
          </Alert>
        )}

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-black border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-400">Total Pendiente</div>
                <DollarSign className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                ${totalPending.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">
                {pendingByHouse.length} casas de cambio
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-400">Pagos Vencidos</div>
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-400 mb-1">
                ${totalOverdue.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">
                {overduePayments.length} pagos atrasados
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-400">Próximos 7 Días</div>
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {upcomingPayments.length}
              </div>
              <div className="text-sm text-gray-400">
                Pagos por vencer
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-400">Casas Activas</div>
                <Building2 className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-400 mb-1">
                {pendingByHouse.length}
              </div>
              <div className="text-sm text-gray-400">
                Con pagos pendientes
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secciones principales */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pagos pendientes por casa de cambio */}
          <Card className="bg-black border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Pagos Pendientes por Casa de Cambio
              </CardTitle>
              <CardDescription>
                Resumen de comisiones pendientes de pago
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingByHouse.length > 0 ? (
                  pendingByHouse.map((item) => (
                    <div key={item.house.id} className="flex items-center justify-between p-4 rounded-lg bg-black border border-gray-800 hover:bg-gray-900">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white">{item.house.name}</p>
                        <p className="text-xs text-gray-400">{item.house.business_name}</p>
                        <p className="text-xs text-gray-400">
                          {item.count} pagos • Más antiguo: {new Date(item.oldest).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">${item.total.toFixed(2)}</p>
                        <Button size="sm" asChild className="mt-2 bg-blue-600 hover:bg-blue-700">
                          <Link href={`/admin/payments?house=${item.house.id}`}>
                            Ver Pagos
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-400">No hay pagos pendientes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pagos vencidos */}
          <Card className="bg-black border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Pagos Vencidos - Acción Requerida
              </CardTitle>
              <CardDescription>
                Pagos que requieren atención inmediata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overduePayments.length > 0 ? (
                  overduePayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg bg-black border border-red-800 hover:bg-gray-900">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white">{payment.payment_number}</p>
                        <p className="text-xs text-gray-300">{payment.exchange_house.name}</p>
                        <p className="text-xs text-red-300">
                          Vencido hace {payment.days_overdue} días
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-300">${payment.total_amount}</p>
                        <Badge className="mt-1 bg-black text-red-400 border border-red-700">
                          Vencido
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-400">No hay pagos vencidos</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Próximos pagos */}
        {upcomingPayments.length > 0 && (
          <Card className="bg-black border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                Próximos Pagos (7 días)
              </CardTitle>
              <CardDescription>
                Pagos que vencen en los próximos 7 días
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingPayments.map((payment) => (
                  <div key={payment.id} className="p-4 rounded-lg bg-black border border-gray-800 hover:bg-gray-900">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">{payment.payment_number}</p>
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusText(payment.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">{payment.exchange_house.name}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-white">${payment.total_amount}</p>
                        <p className="text-xs text-gray-400">
                          Vence: {new Date(payment.due_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Acciones rápidas */}
        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Acciones Rápidas</CardTitle>
            <CardDescription>
              Herramientas de gestión financiera
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 h-auto p-4">
                <Link href="/admin/payments">
                  <div className="text-center">
                    <DollarSign className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Ver Todos los Pagos</div>
                    <div className="text-xs opacity-80">Historial completo</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 h-auto p-4">
                <Link href="/admin/payment-schedules">
                  <div className="text-center">
                    <Calendar className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Cronogramas</div>
                    <div className="text-xs opacity-80">Configurar frecuencias</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 h-auto p-4">
                <Link href="/admin/reports">
                  <div className="text-center">
                    <Building2 className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Reportes</div>
                    <div className="text-xs opacity-80">Análisis financiero</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

PaymentsDashboard.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default PaymentsDashboard;