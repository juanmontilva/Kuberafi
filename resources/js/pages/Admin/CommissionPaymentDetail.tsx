import { Head, Link, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { useState } from 'react';
import { 
  ArrowLeft,
  DollarSign, 
  Calendar,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from 'lucide-react';

interface ExchangeHouse {
  id: number;
  name: string;
  business_name: string;
}

interface Payment {
  id: number;
  payment_number: string;
  exchange_house_id: number;
  total_amount: string;
  commission_amount: string;
  period_start: string;
  period_end: string;
  due_date: string;
  frequency: string;
  status: string;
  payment_method?: string;
  payment_reference?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
  exchange_house: ExchangeHouse;
}

interface Props {
  payment: Payment;
}

function CommissionPaymentDetail({ payment }: Props) {
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    payment_method: '',
    payment_reference: '',
    notes: '',
  });

  const handleMarkAsPaid = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/admin/payments/${payment.id}/mark-paid`, {
      onSuccess: () => {
        reset();
        setIsMarkPaidOpen(false);
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <>
      <Head title={`Pago ${payment.payment_number}`} />
      
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/payments">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  {payment.payment_number}
                </h1>
                <p className="text-muted-foreground text-lg">
                  Detalle del pago de comisiones
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(payment.status)}>
              {getStatusText(payment.status)}
            </Badge>
            {payment.status === 'pending' && (
              <>
                <Button onClick={() => setIsMarkPaidOpen(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Pagado
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    if (confirm('¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer.')) {
                      router.delete(`/admin/payments/${payment.id}`);
                    }
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Información Principal */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Casa de Cambio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="text-lg font-semibold">{payment.exchange_house.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Razón Social</p>
                  <p className="text-sm">{payment.exchange_house.business_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Monto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Total a Pagar</p>
                  <p className="text-3xl font-bold">${payment.total_amount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Comisión Plataforma</p>
                  <p className="text-lg font-semibold text-green-600">${payment.commission_amount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Período y Fechas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período y Fechas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Período</p>
                <p className="text-sm font-medium">
                  {new Date(payment.period_start).toLocaleDateString()} - {new Date(payment.period_end).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fecha de Vencimiento</p>
                <p className="text-sm font-medium">{new Date(payment.due_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Frecuencia</p>
                <p className="text-sm font-medium capitalize">{payment.frequency}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de Pago */}
        {payment.payment_method && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Método de Pago</p>
                  <p className="text-sm font-medium">{payment.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Referencia</p>
                  <p className="text-sm font-medium">{payment.payment_reference}</p>
                </div>
                {payment.paid_at && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Fecha de Pago</p>
                    <p className="text-sm font-medium">{new Date(payment.paid_at).toLocaleString()}</p>
                  </div>
                )}
                {payment.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Notas</p>
                    <p className="text-sm">{payment.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog para marcar como pagado */}
        <Dialog open={isMarkPaidOpen} onOpenChange={setIsMarkPaidOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Marcar como Pagado</DialogTitle>
              <DialogDescription>
                Confirma que has recibido el pago de ${payment.total_amount}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleMarkAsPaid} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Método de Pago</Label>
                <input
                  id="payment_method"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Ej: Transferencia Bancaria"
                  value={data.payment_method}
                  onChange={(e) => setData('payment_method', e.target.value)}
                />
                {errors.payment_method && (
                  <p className="text-sm text-red-600">{errors.payment_method}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_reference">Referencia</Label>
                <input
                  id="payment_reference"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Número de referencia"
                  value={data.payment_reference}
                  onChange={(e) => setData('payment_reference', e.target.value)}
                />
                {errors.payment_reference && (
                  <p className="text-sm text-red-600">{errors.payment_reference}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Información adicional sobre el pago"
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsMarkPaidOpen(false);
                    reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Procesando...' : 'Confirmar Pago'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

CommissionPaymentDetail.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default CommissionPaymentDetail;
