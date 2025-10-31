import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  AlertCircle,
  ArrowLeft,
  TrendingUp,
  ArrowLeftRight
} from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  base_amount: string;
  quote_amount: string;
  exchange_rate: string;
  status: string;
  created_at: string;
  currency_pair: {
    base_currency: string;
    quote_currency: string;
  };
  customer?: {
    name: string;
  };
}

interface Commission {
  id: number;
  amount: string;
  type: string;
  status: string;
  created_at: string;
  order: Order;
}

interface PaymentRequest {
  id: number;
  period_start: string;
  period_end: string;
  total_commissions: string;
  total_orders: number;
  total_volume: string;
  status: string;
  payment_method?: string;
  payment_reference?: string;
  payment_proof?: string;
  payment_sent_at?: string;
  confirmed_at?: string;
  rejection_reason?: string;
  created_at: string;
}

interface Props {
  paymentRequest: PaymentRequest;
  commissions: {
    data: Commission[];
    current_page: number;
    last_page: number;
  };
}

function CommissionPaymentRequestDetail({ paymentRequest, commissions }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'payment_info_sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'payment_info_sent': return 'Info Enviada';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'payment_info_sent': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <>
      <Head title="Detalle de Solicitud de Pago" />
      
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/my-commission-requests">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-4xl font-bold tracking-tight">
                Detalle de Solicitud de Pago
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Operaciones incluidas en esta solicitud
            </p>
          </div>
        </div>

        {/* Resumen de la Solicitud */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resumen de la Solicitud
                </CardTitle>
                <CardDescription>
                  Período: {new Date(paymentRequest.period_start).toLocaleDateString()} - {new Date(paymentRequest.period_end).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(paymentRequest.status)}>
                {getStatusIcon(paymentRequest.status)}
                <span className="ml-1">{getStatusText(paymentRequest.status)}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total a Pagar</p>
                <p className="text-2xl font-bold">${paymentRequest.total_commissions}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Órdenes Incluidas</p>
                <p className="text-2xl font-bold">{paymentRequest.total_orders}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volumen Total</p>
                <p className="text-2xl font-bold">${parseFloat(paymentRequest.total_volume || '0').toLocaleString()}</p>
              </div>
            </div>

            {paymentRequest.payment_method && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Información de Pago</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Método:</span>
                    <p className="font-medium">{paymentRequest.payment_method}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Referencia:</span>
                    <p className="font-medium">{paymentRequest.payment_reference}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Operaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Operaciones Incluidas
            </CardTitle>
            <CardDescription>
              Todas las órdenes que generaron comisiones en este período
            </CardDescription>
          </CardHeader>
          <CardContent>
            {commissions.data.length > 0 ? (
              <div className="space-y-3">
                {commissions.data.map((commission) => (
                  <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold">
                          {commission.order.order_number}
                        </span>
                        {commission.order.customer && (
                          <span className="text-sm text-muted-foreground">
                            Cliente: {commission.order.customer.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {commission.order.currency_pair.base_currency} → {commission.order.currency_pair.quote_currency}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>
                            ${commission.order.base_amount} @ {commission.order.exchange_rate}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(commission.order.created_at).toLocaleDateString()} {new Date(commission.order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Comisión</p>
                      <p className="text-lg font-bold text-primary">
                        ${commission.amount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay operaciones</h3>
                <p className="text-muted-foreground">
                  No se encontraron operaciones para este período
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botón de Volver */}
        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/my-commission-requests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Solicitudes
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}

CommissionPaymentRequestDetail.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default CommissionPaymentRequestDetail;
