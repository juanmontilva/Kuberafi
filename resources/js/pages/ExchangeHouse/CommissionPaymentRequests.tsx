import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { useState } from 'react';
import { 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  FileText,
  AlertCircle,
  ArrowLeft,
  Eye
} from 'lucide-react';

interface PendingCommissions {
  total_amount: number;
  total_orders: number;
  total_amount_month?: number;
  total_orders_month?: number;
  period_start: string;
  period_end: string;
}

interface PaymentRequest {
  id: number;
  period_start: string;
  period_end: string;
  total_commissions: string;
  total_orders: number;
  status: string;
  payment_method?: string;
  payment_reference?: string;
  payment_sent_at?: string;
  confirmed_at?: string;
  rejection_reason?: string;
  created_at: string;
}

interface PlatformPaymentMethod {
  id: number;
  name: string;
  type: string;
  type_label: string;
  currency: string;
  account_holder?: string;
  account_number?: string;
  bank_name?: string;
  identification?: string;
  routing_number?: string;
  swift_code?: string;
  instructions: string;
  is_primary: boolean;
  icon: string;
  display_name: string;
}

interface Props {
  requests: {
    data: PaymentRequest[];
    current_page: number;
    last_page: number;
  };
  pendingCommissions: PendingCommissions;
  platformPaymentMethods: PlatformPaymentMethod[];
}

function CommissionPaymentRequests({ requests, pendingCommissions, platformPaymentMethods }: Props) {
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PlatformPaymentMethod | null>(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    payment_method: '',
    payment_reference: '',
    payment_proof: '',
    payment_notes: '',
  });

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    post(`/my-commission-requests/${selectedRequest.id}/send-payment`, {
      onSuccess: () => {
        reset();
        setIsPaymentDialogOpen(false);
        setSelectedRequest(null);
      },
    });
  };

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
      <Head title="Mis Solicitudes de Pago" />
      
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-4xl font-bold tracking-tight">
                Pagos a Kuberafi
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Gestiona tus pagos de comisiones a la plataforma
            </p>
          </div>
        </div>

        {/* Comisiones Pendientes Totales */}
        {pendingCommissions.total_amount > 0 ? (
          <Card className="bg-gradient-to-br from-red-900/30 via-red-800/20 to-red-900/30 border-red-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-300">
                <DollarSign className="h-5 w-5" />
                ⚠️ Deuda Total Pendiente a Kuberafi
              </CardTitle>
              <CardDescription className="text-red-200">
                Total acumulado de todas las comisiones pendientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-bold text-red-400">
                      ${parseFloat(pendingCommissions.total_amount.toString()).toLocaleString()}
                    </div>
                    <p className="text-sm text-red-300 mt-1">
                      {pendingCommissions.total_orders} órdenes totales
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-red-900/50 text-red-300 border-red-700">
                      Pendiente de Pago
                    </Badge>
                  </div>
                </div>
                
                <div className="border-t border-red-700/30 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-300">Del mes actual:</span>
                    <span className="text-red-400 font-semibold">
                      ${parseFloat(pendingCommissions.total_amount_month?.toString() || '0').toLocaleString()} 
                      ({pendingCommissions.total_orders_month || 0} órdenes)
                    </span>
                  </div>
                  <p className="text-xs text-red-200 mt-2">
                    Período: {new Date(pendingCommissions.period_start).toLocaleDateString()} - {new Date(pendingCommissions.period_end).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-green-900/30 via-green-800/20 to-green-900/30 border-green-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-300">
                <CheckCircle className="h-5 w-5" />
                ✅ ¡Estás al Día con Kuberafi!
              </CardTitle>
              <CardDescription className="text-green-200">
                No tienes comisiones pendientes de pago
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-bold text-green-400">
                      $0.00
                    </div>
                    <p className="text-sm text-green-300 mt-1">
                      Sin deudas pendientes
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-900/50 text-green-300 border-green-700">
                      Al Día
                    </Badge>
                  </div>
                </div>
                
                <div className="border-t border-green-700/30 pt-4">
                  <p className="text-sm text-green-200">
                    🎉 ¡Excelente! Todos tus pagos están al día. Continúa operando con tranquilidad.
                  </p>
                  <p className="text-xs text-green-300 mt-2">
                    Período actual: {new Date(pendingCommissions.period_start).toLocaleDateString()} - {new Date(pendingCommissions.period_end).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historial de Solicitudes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Historial de Pagos
            </CardTitle>
            <CardDescription>
              Todas tus solicitudes de pago anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requests.data.length > 0 ? (
              <div className="space-y-4">
                {requests.data.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{getStatusText(request.status)}</span>
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(request.period_start).toLocaleDateString()} - {new Date(request.period_end).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">${request.total_commissions}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{request.total_orders} órdenes</span>
                        </div>
                      </div>

                      {request.payment_method && (
                        <p className="text-xs text-muted-foreground">
                          Método: {request.payment_method} | Ref: {request.payment_reference}
                        </p>
                      )}

                      {request.rejection_reason && (
                        <p className="text-xs text-red-600">
                          Motivo de rechazo: {request.rejection_reason}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                        asChild
                      >
                        <Link href={`/my-commission-requests/${request.id}`}>
                          <Eye className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Ver Operaciones</span>
                          <span className="sm:hidden">Ver Operaciones</span>
                        </Link>
                      </Button>
                      {request.status === 'pending' && (
                        <Button
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsPaymentDialogOpen(true);
                          }}
                        >
                          <Upload className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Enviar Pago</span>
                          <span className="sm:hidden">Enviar Pago</span>
                        </Button>
                      )}
                      {request.status === 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsPaymentDialogOpen(true);
                          }}
                        >
                          <Upload className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Reenviar</span>
                          <span className="sm:hidden">Reenviar</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay solicitudes de pago</h3>
                <p className="text-muted-foreground">
                  Las solicitudes de pago se generan automáticamente al final de cada mes
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog para enviar información de pago */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Enviar Información de Pago a Kuberafi</DialogTitle>
              <DialogDescription>
                Selecciona el método de pago y completa los datos de tu transferencia
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitPayment} className="space-y-6">
              {/* Métodos de Pago Disponibles */}
              {platformPaymentMethods.length > 0 && (
                <div className="space-y-3">
                  <Label>Métodos de Pago Disponibles</Label>
                  <div className="grid gap-3">
                    {platformPaymentMethods.map((method) => (
                      <Card 
                        key={method.id}
                        className={`cursor-pointer transition-all ${
                          selectedPaymentMethod?.id === method.id 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => {
                          setSelectedPaymentMethod(method);
                          setData('payment_method', method.display_name);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{method.icon}</div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{method.name}</h4>
                                {method.is_primary && (
                                  <Badge variant="default" className="text-xs">Recomendado</Badge>
                                )}
                                <Badge variant="outline" className="text-xs">{method.currency}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{method.type_label}</p>
                              
                              {selectedPaymentMethod?.id === method.id && (
                                <div className="mt-3 p-3 bg-muted rounded-lg space-y-2 text-sm">
                                  {method.account_holder && (
                                    <div>
                                      <span className="font-medium">Titular:</span> {method.account_holder}
                                    </div>
                                  )}
                                  {method.bank_name && (
                                    <div>
                                      <span className="font-medium">Banco:</span> {method.bank_name}
                                    </div>
                                  )}
                                  {method.account_number && (
                                    <div>
                                      <span className="font-medium">Cuenta:</span> {method.account_number}
                                    </div>
                                  )}
                                  {method.identification && (
                                    <div>
                                      <span className="font-medium">Identificación:</span> {method.identification}
                                    </div>
                                  )}
                                  {method.routing_number && (
                                    <div>
                                      <span className="font-medium">Routing:</span> {method.routing_number}
                                    </div>
                                  )}
                                  {method.swift_code && (
                                    <div>
                                      <span className="font-medium">SWIFT:</span> {method.swift_code}
                                    </div>
                                  )}
                                  <div className="pt-2 border-t border-border">
                                    <span className="font-medium">Instrucciones:</span>
                                    <p className="mt-1 whitespace-pre-wrap">{method.instructions}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Información del Pago */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold">Información de tu Pago</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Método Usado *</Label>
                  <Input
                    id="payment_method"
                    placeholder="Ej: Transferencia Bancaria, Zelle, etc."
                    value={data.payment_method}
                    onChange={(e) => setData('payment_method', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Selecciona un método arriba o escribe el que usaste
                  </p>
                  {errors.payment_method && (
                    <p className="text-sm text-red-600">{errors.payment_method}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_reference">Referencia/Número de Transacción *</Label>
                  <Input
                    id="payment_reference"
                    placeholder="Ej: 123456789"
                    value={data.payment_reference}
                    onChange={(e) => setData('payment_reference', e.target.value)}
                  />
                  {errors.payment_reference && (
                    <p className="text-sm text-red-600">{errors.payment_reference}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_proof">Comprobante (Opcional)</Label>
                  <Textarea
                    id="payment_proof"
                    placeholder="Pega aquí la URL de la imagen del comprobante (ej: https://imgur.com/abc123.jpg)"
                    value={data.payment_proof}
                    onChange={(e) => setData('payment_proof', e.target.value)}
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Sube tu comprobante a <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Imgur</a> o <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ImgBB</a> y pega el enlace aquí
                  </p>
                  {errors.payment_proof && (
                    <p className="text-sm text-red-600">{errors.payment_proof}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_notes">Notas Adicionales (Opcional)</Label>
                  <Textarea
                    id="payment_notes"
                    placeholder="Cualquier información adicional sobre el pago"
                    value={data.payment_notes}
                    onChange={(e) => setData('payment_notes', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsPaymentDialogOpen(false);
                    setSelectedPaymentMethod(null);
                    reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Enviando...' : 'Enviar Información'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

CommissionPaymentRequests.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default CommissionPaymentRequests;
