import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  History,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useState } from 'react';

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  currency: string;
  is_active: boolean;
}

interface Balance {
  id: number;
  payment_method_id: number;
  currency: string;
  balance: number;
  payment_method: {
    id: number;
    name: string;
    type: string;
  };
}

interface Movement {
  id: number;
  type: string;
  currency: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: string;
  payment_method: {
    name: string;
  };
  order?: {
    order_number: string;
  };
}

interface TodayStats {
  currency: string;
  total_in: number;
  total_out: number;
  movements_count: number;
}

interface Props {
  paymentMethods: PaymentMethod[];
  balances: Record<string, Balance[]>;
  recentMovements: Movement[];
  todayStats: Record<string, TodayStats>;
}

function CashBoxIndex({ paymentMethods, balances, recentMovements, todayStats }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null);

  const { data, setData, post, processing, reset, errors } = useForm({
    payment_method_id: '',
    type: 'deposit',
    currency: '',
    amount: '',
    description: '',
  });

  const handleOpenModal = (balance?: Balance, type: 'deposit' | 'withdrawal' = 'deposit') => {
    if (balance) {
      setSelectedBalance(balance);
      setData({
        payment_method_id: balance.payment_method_id.toString(),
        type,
        currency: balance.currency,
        amount: '',
        description: '',
      });
    } else {
      setSelectedBalance(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/cash-box/movement', {
      preserveScroll: true,
      onSuccess: () => {
        setIsModalOpen(false);
        reset();
      },
    });
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'order_in':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
      case 'order_out':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'order_in':
        return 'text-green-600';
      case 'withdrawal':
      case 'order_out':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getMovementLabel = (type: string) => {
    const labels: Record<string, string> = {
      deposit: 'Depósito',
      withdrawal: 'Retiro',
      order_in: 'Entrada (Orden)',
      order_out: 'Salida (Orden)',
      adjustment: 'Ajuste',
    };
    return labels[type] || type;
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : currency === 'VES' ? 'Bs.' : currency;
    return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <>
      <Head title="Mi Fondo de Caja" />
      
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Wallet className="h-6 w-6 md:h-8 md:w-8" />
              Mi Fondo de Caja
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Control de saldos por método de pago
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.visit('/cash-box/history')}
              className="h-11 md:h-10"
            >
              <History className="h-4 w-4 mr-2" />
              Historial
            </Button>
            <Button 
              onClick={() => handleOpenModal()}
              className="h-11 md:h-10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar Movimiento
            </Button>
          </div>
        </div>

        {/* Resumen del Día */}
        {Object.keys(todayStats).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">📊 Resumen del Día</CardTitle>
              <CardDescription className="text-sm">Movimientos de hoy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-3">
                {Object.entries(todayStats).map(([currency, stats]) => (
                  <div key={currency} className="p-3 md:p-4 border rounded-lg">
                    <div className="text-xs md:text-sm text-muted-foreground mb-2">{currency}</div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-muted-foreground">Entradas</div>
                        <div className="text-sm md:text-base font-bold text-green-600">
                          {formatCurrency(stats.total_in, currency)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Salidas</div>
                        <div className="text-sm md:text-base font-bold text-red-600">
                          {formatCurrency(stats.total_out, currency)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Neto</div>
                        <div className={`text-sm md:text-base font-bold ${stats.total_in - stats.total_out >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(stats.total_in - stats.total_out, currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saldos por Método de Pago */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">💵 Saldos por Método de Pago</CardTitle>
            <CardDescription className="text-sm">Fondos disponibles en cada método</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(balances).length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No tienes saldos registrados aún</p>
                <Button onClick={() => handleOpenModal()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primer Depósito
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(balances).map(([currency, currencyBalances]) => (
                  <div key={currency}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">{currency}</h3>
                    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {currencyBalances.map((balance) => (
                        <div key={balance.id} className="p-4 border rounded-lg bg-card">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="text-sm font-medium">{balance.payment_method.name}</div>
                              <div className="text-xs text-muted-foreground">{balance.payment_method.type}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg md:text-xl font-bold">
                                {formatCurrency(balance.balance, balance.currency)}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleOpenModal(balance, 'deposit')}
                              className="flex-1 h-9 text-xs md:text-sm"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Depositar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleOpenModal(balance, 'withdrawal')}
                              className="flex-1 h-9 text-xs md:text-sm"
                            >
                              <Minus className="h-3 w-3 mr-1" />
                              Retirar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Movimientos Recientes */}
        {recentMovements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">📜 Movimientos Recientes</CardTitle>
              <CardDescription className="text-sm">Últimas 20 transacciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      {getMovementIcon(movement.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{getMovementLabel(movement.type)}</span>
                          {movement.order && (
                            <span className="text-xs text-muted-foreground">
                              Orden #{movement.order.order_number}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {movement.payment_method.name} • {movement.description || 'Sin descripción'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(movement.created_at).toLocaleString('es-ES')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm md:text-base font-bold ${getMovementColor(movement.type)}`}>
                        {movement.amount >= 0 ? '+' : ''}{formatCurrency(movement.amount, movement.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Balance: {formatCurrency(movement.balance_after, movement.currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => router.visit('/cash-box/history')}>
                  Ver Historial Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal para Registrar Movimiento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">💰 Registrar Movimiento</DialogTitle>
            <DialogDescription className="text-sm">
              Registra un depósito, retiro o ajuste en tu fondo de caja
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm">Tipo de Movimiento</Label>
              <Select value={data.type} onValueChange={(value) => setData('type', value as any)}>
                <SelectTrigger className="h-11 md:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">💰 Depósito</SelectItem>
                  <SelectItem value="withdrawal">💸 Retiro</SelectItem>
                  <SelectItem value="adjustment">🔧 Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method_id" className="text-sm">Método de Pago</Label>
              <Select 
                value={data.payment_method_id} 
                onValueChange={(value) => {
                  setData('payment_method_id', value);
                  // Auto-completar la moneda cuando se selecciona un método
                  const selectedMethod = paymentMethods.find(m => m.id.toString() === value);
                  if (selectedMethod) {
                    setData('currency', selectedMethod.currency);
                  }
                }}
                disabled={!!selectedBalance}
              >
                <SelectTrigger className="h-11 md:h-10">
                  <SelectValue placeholder="Selecciona un método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.length > 0 ? (
                    paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id.toString()}>
                        {method.name} ({method.currency})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No hay métodos de pago disponibles. Crea uno primero en "Métodos de Pago".
                    </div>
                  )}
                </SelectContent>
              </Select>
              {errors.payment_method_id && (
                <p className="text-sm text-red-500">{errors.payment_method_id}</p>
              )}
              {paymentMethods.length === 0 && (
                <p className="text-xs text-amber-600">
                  ⚠️ Debes crear métodos de pago primero
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm">Moneda</Label>
              <Input
                id="currency"
                value={data.currency}
                disabled
                className="h-11 md:h-10 bg-muted"
                placeholder="Se completa automáticamente"
              />
              {errors.currency && (
                <p className="text-sm text-red-500">{errors.currency}</p>
              )}
              <p className="text-xs text-muted-foreground">
                La moneda se selecciona automáticamente según el método de pago
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm">Monto</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={data.amount}
                onChange={(e) => setData('amount', e.target.value)}
                placeholder="0.00"
                className="h-11 md:h-10"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
              {selectedBalance && (
                <p className="text-xs text-muted-foreground">
                  Saldo actual: {formatCurrency(selectedBalance.balance, selectedBalance.currency)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">Descripción</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Describe el motivo del movimiento..."
                rows={3}
                className="text-sm"
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 h-11 md:h-10"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={processing}
                className="flex-1 h-11 md:h-10"
              >
                {processing ? 'Registrando...' : 'Registrar Movimiento'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

CashBoxIndex.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default CashBoxIndex;
