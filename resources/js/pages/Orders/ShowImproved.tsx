import { Head, Link, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  ArrowLeft, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  User,
  CreditCard,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';

interface Order {
  id: number;
  order_number: string;
  status: string;
  base_amount: string;
  quote_amount: string;
  market_rate: string;
  applied_rate: string;
  expected_margin_percent: string;
  actual_margin_percent: string;
  house_commission_percent: string;
  house_commission_amount: string;
  platform_commission: string;
  exchange_commission: string;
  net_amount: string;
  created_at: string;
  completed_at: string | null;
  notes: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  cancelled_by: {
    name: string;
  } | null;
  currency_pair: {
    symbol: string;
    base_currency: string;
    quote_currency: string;
  };
  user: {
    name: string;
  };
  customer: {
    name: string;
  } | null;
}

interface Props {
  order: Order;
}

export default function ShowImproved({ order }: Props) {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const { data, setData, post, processing, errors, reset } = useForm({
    actual_rate: order.applied_rate,
    actual_quote_amount: order.quote_amount,
    actual_margin_percent: order.expected_margin_percent,
    notes: order.notes || '',
  });

  const { data: cancelData, setData: setCancelData, post: postCancel, processing: cancelProcessing, errors: cancelErrors, reset: resetCancel } = useForm({
    cancellation_reason: '',
  });

  // Calcular margen real basado en el monto recibido
  const calculateRealMargin = () => {
    const baseAmount = parseFloat(order.base_amount);
    const actualQuoteAmount = parseFloat(data.actual_quote_amount);
    const expectedQuoteAmount = parseFloat(order.quote_amount);
    
    if (actualQuoteAmount && expectedQuoteAmount && baseAmount) {
      // Diferencia en bolívares
      const difference = expectedQuoteAmount - actualQuoteAmount;
      // Margen real = (diferencia / monto base) * 100
      const realMargin = (difference / baseAmount) * 100;
      return realMargin.toFixed(2);
    }
    return '0.00';
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/orders/${order.id}/complete`, {
      preserveScroll: true,
      onSuccess: () => {
        setShowCompleteModal(false);
        reset();
      },
    });
  };

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    postCancel(`/orders/${order.id}/cancel`, {
      preserveScroll: true,
      onSuccess: () => {
        setShowCancelModal(false);
        resetCancel();
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completada',
      cancelled: 'Cancelada',
      failed: 'Fallida'
    };
    return texts[status] || status;
  };

  const marginDifference = parseFloat(order.actual_margin_percent) - parseFloat(order.expected_margin_percent);
  const isProfitable = marginDifference >= 0;

  return (
    <>
      <Head title={`Orden ${order.order_number}`} />
      
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{order.order_number}</h1>
              <p className="text-gray-400 text-sm mt-1">
                {order.currency_pair.symbol} • {new Date(order.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
          
          {order.status === 'pending' && (
            <div className="flex gap-2">
              <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completar Orden
                  </Button>
                </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Completar Orden</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Ingresa los datos reales de la transacción completada
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleComplete} className="space-y-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-300 font-medium mb-2">💡 Información</p>
                    <p className="text-xs text-gray-400">
                      Cliente entrega: <span className="text-white font-bold">${parseFloat(order.base_amount).toLocaleString()} {order.currency_pair.base_currency}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Esperabas dar: <span className="text-white font-bold">{parseFloat(order.quote_amount).toLocaleString()} {order.currency_pair.quote_currency}</span>
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="actual_quote_amount" className="text-white">
                      Monto Real Entregado al Cliente ({order.currency_pair.quote_currency}) *
                    </Label>
                    <Input
                      id="actual_quote_amount"
                      type="number"
                      step="0.01"
                      value={data.actual_quote_amount}
                      onChange={(e) => {
                        setData('actual_quote_amount', e.target.value);
                        // Auto-calcular margen real
                        const baseAmount = parseFloat(order.base_amount);
                        const actualQuote = parseFloat(e.target.value);
                        const expectedQuote = parseFloat(order.quote_amount);
                        const appliedRate = parseFloat(order.applied_rate);
                        
                        if (actualQuote && expectedQuote && baseAmount && appliedRate) {
                          // Diferencia en bolívares
                          const differenceInBs = expectedQuote - actualQuote;
                          // Convertir diferencia a dólares
                          const differenceInUsd = differenceInBs / appliedRate;
                          // Calcular margen adicional sobre el monto base
                          const additionalMargin = (differenceInUsd / baseAmount) * 100;
                          // Margen real = margen esperado + margen adicional
                          const expectedMargin = parseFloat(order.expected_margin_percent);
                          const realMargin = expectedMargin + additionalMargin;
                          
                          setData('actual_margin_percent', realMargin.toFixed(2));
                        }
                      }}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Ej: 375000000"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Esperabas: {parseFloat(order.quote_amount).toLocaleString()}
                    </p>
                    {errors.actual_quote_amount && <p className="text-red-400 text-sm mt-1">{errors.actual_quote_amount}</p>}
                  </div>

                  <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Diferencia</span>
                      <span className={`text-lg font-bold ${
                        parseFloat(data.actual_quote_amount) < parseFloat(order.quote_amount) 
                          ? 'text-emerald-400' 
                          : 'text-red-400'
                      }`}>
                        {(parseFloat(order.quote_amount) - parseFloat(data.actual_quote_amount)).toLocaleString()} Bs
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {parseFloat(data.actual_quote_amount) < parseFloat(order.quote_amount)
                        ? '✅ Entregaste menos bolívares = más ganancia'
                        : '❌ Entregaste más bolívares = menos ganancia'}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="actual_margin_percent" className="text-white">
                      Margen Real Calculado (%)
                    </Label>
                    <Input
                      id="actual_margin_percent"
                      type="number"
                      step="0.01"
                      value={data.actual_margin_percent}
                      onChange={(e) => setData('actual_margin_percent', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white font-bold text-lg"
                      readOnly
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        Margen esperado: {parseFloat(order.expected_margin_percent).toFixed(2)}%
                      </p>
                      <p className={`text-xs font-bold ${
                        parseFloat(data.actual_margin_percent) >= parseFloat(order.expected_margin_percent)
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}>
                        {parseFloat(data.actual_margin_percent) >= parseFloat(order.expected_margin_percent)
                          ? `+${(parseFloat(data.actual_margin_percent) - parseFloat(order.expected_margin_percent)).toFixed(2)}%`
                          : `${(parseFloat(data.actual_margin_percent) - parseFloat(order.expected_margin_percent)).toFixed(2)}%`}
                      </p>
                    </div>
                    {errors.actual_margin_percent && <p className="text-red-400 text-sm mt-1">{errors.actual_margin_percent}</p>}
                  </div>

                  <div>
                    <Label htmlFor="actual_rate" className="text-white">Tasa Real Aplicada (Referencia)</Label>
                    <Input
                      id="actual_rate"
                      type="number"
                      step="0.000001"
                      value={data.actual_rate}
                      onChange={(e) => setData('actual_rate', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tasa esperada: {parseFloat(order.market_rate).toFixed(6)}
                    </p>
                    {errors.actual_rate && <p className="text-red-400 text-sm mt-1">{errors.actual_rate}</p>}
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-white">Notas (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={data.notes}
                      onChange={(e) => setData('notes', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                      rows={3}
                      placeholder="Detalles adicionales de la transacción..."
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCompleteModal(false)}
                      className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={processing}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      {processing ? 'Procesando...' : 'Completar Orden'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Cancelar Orden
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Cancelar Orden</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Explica el motivo de la cancelación. No se cobrará comisión por esta orden.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCancel} className="space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-300 font-medium mb-2">⚠️ Importante</p>
                    <p className="text-xs text-gray-400">
                      Al cancelar esta orden, no se generará comisión para Kuberafi. 
                      Asegúrate de explicar claramente el motivo de la cancelación.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cancellation_reason" className="text-white">
                      Motivo de Cancelación *
                    </Label>
                    <Textarea
                      id="cancellation_reason"
                      value={cancelData.cancellation_reason}
                      onChange={(e) => setCancelData('cancellation_reason', e.target.value)}
                      placeholder="Explica por qué se cancela esta orden (mínimo 10 caracteres)..."
                      className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                      required
                    />
                    {cancelErrors.cancellation_reason && (
                      <p className="text-sm text-red-400">{cancelErrors.cancellation_reason}</p>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCancelModal(false);
                        resetCancel();
                      }}
                      className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                    >
                      Cerrar
                    </Button>
                    <Button
                      type="submit"
                      disabled={cancelProcessing}
                      variant="destructive"
                    >
                      {cancelProcessing ? 'Cancelando...' : 'Confirmar Cancelación'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <Badge className={`${getStatusColor(order.status)} border px-3 py-1`}>
            {getStatusText(order.status)}
          </Badge>
          {order.status === 'completed' && (
            <span className="text-sm text-gray-400">
              Completada el {new Date(order.completed_at!).toLocaleString('es-ES')}
            </span>
          )}
        </div>

        {/* Alerta de Margen (solo para órdenes completadas) */}
        {order.status === 'completed' && (
          <Card className={`border-2 ${isProfitable ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {isProfitable ? (
                  <div className="p-2 rounded-full bg-emerald-500/20">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                ) : (
                  <div className="p-2 rounded-full bg-red-500/20">
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-white">
                    Análisis de Margen
                  </p>
                  <p className={`text-xs ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isProfitable ? 'Ganaste' : 'Perdiste'} {Math.abs(marginDifference).toFixed(2)}% {isProfitable ? 'más' : 'menos'} de lo esperado
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm text-gray-400">Esperado vs Real</p>
                  <p className="text-lg font-bold">
                    <span className="text-gray-400">{parseFloat(order.expected_margin_percent).toFixed(2)}%</span>
                    {' → '}
                    <span className={isProfitable ? 'text-emerald-400' : 'text-red-400'}>
                      {parseFloat(order.actual_margin_percent).toFixed(2)}%
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Detalles de la Transacción */}
          <Card className="bg-black border-2 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-400" />
                Detalles de la Transacción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                <span className="text-gray-400">Monto Base</span>
                <span className="text-white font-bold text-lg">
                  ${parseFloat(order.base_amount).toLocaleString()} {order.currency_pair.base_currency}
                </span>
              </div>
              
              <div className="flex items-center justify-center py-2">
                <ArrowRight className="h-5 w-5 text-gray-500" />
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                <span className="text-gray-400">Monto a Recibir</span>
                <span className="text-white font-bold text-lg">
                  {parseFloat(order.quote_amount).toLocaleString()} {order.currency_pair.quote_currency}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-700">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">Tasa de Cambio</span>
                  <span className="text-white font-mono">{parseFloat(order.applied_rate).toFixed(6)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">Monto Neto</span>
                  <span className="text-emerald-400">${parseFloat(order.net_amount).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comisiones */}
          <Card className="bg-black border-2 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Comisiones y Ganancias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <span className="text-gray-300">Comisión Casa de Cambio</span>
                <span className="text-emerald-400 font-bold">
                  ${parseFloat(order.house_commission_amount).toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Comisión Plataforma</span>
                <span className="text-red-400">${parseFloat(order.platform_commission).toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                <span className="text-white font-semibold">Ganancia Neta</span>
                <span className="text-emerald-400 font-bold text-xl">
                  ${parseFloat(order.exchange_commission).toLocaleString()}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-700">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">% Comisión Casa</span>
                  <span className="text-white">{parseFloat(order.house_commission_percent).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Margen Real</span>
                  <span className={`font-bold ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                    {parseFloat(order.actual_margin_percent).toFixed(2)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cliente/Usuario */}
          <Card className="bg-black border-2 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5 text-purple-400" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Operado por</p>
                <p className="text-white font-medium">{order.user.name}</p>
              </div>
              {order.customer && (
                <div>
                  <p className="text-gray-400 text-sm">Cliente</p>
                  <p className="text-white font-medium">{order.customer.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fechas y Notas */}
          <Card className="bg-black border-2 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-400" />
                Fechas y Notas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Creada</p>
                <p className="text-white">{new Date(order.created_at).toLocaleString('es-ES')}</p>
              </div>
              {order.completed_at && (
                <div>
                  <p className="text-gray-400 text-sm">Completada</p>
                  <p className="text-white">{new Date(order.completed_at).toLocaleString('es-ES')}</p>
                </div>
              )}
              {order.notes && (
                <div className="pt-2 border-t border-slate-700">
                  <p className="text-gray-400 text-sm mb-1">Notas</p>
                  <p className="text-white text-sm bg-slate-800/50 p-3 rounded">{order.notes}</p>
                </div>
              )}
              {order.status === 'cancelled' && order.cancellation_reason && (
                <div className="pt-2 border-t border-slate-700">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-red-400 font-semibold mb-1">Orden Cancelada</p>
                        <p className="text-gray-300 text-sm mb-2">{order.cancellation_reason}</p>
                        {order.cancelled_by && order.cancelled_at && (
                          <p className="text-gray-400 text-xs">
                            Cancelada por {order.cancelled_by.name} el {new Date(order.cancelled_at).toLocaleString('es-ES')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

ShowImproved.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);
