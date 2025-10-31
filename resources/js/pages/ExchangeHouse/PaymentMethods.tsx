import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { useState } from 'react';
import { 
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CreditCard,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  currency: string;
  account_holder: string | null;
  account_number: string | null;
  bank_name: string | null;
  identification: string | null;
  instructions: string | null;
  is_active: boolean;
  is_default: boolean;
  daily_limit: string | null;
  min_amount: string | null;
  max_amount: string | null;
  current_balance: number;
}

interface Stats {
  total: number;
  active: number;
  by_currency: Record<string, number>;
}

interface Currency {
  code: string;
  name: string;
}

interface Props {
  paymentMethods: PaymentMethod[];
  availableCurrencies: Currency[];
  stats: Stats;
}

const paymentTypeOptions = [
  { value: 'mobile_payment', label: '📱 Pago Móvil', icon: '📱' },
  { value: 'zelle', label: '💵 Zelle', icon: '💵' },
  { value: 'bank_transfer', label: '🏦 Transferencia Bancaria', icon: '🏦' },
  { value: 'crypto', label: '💎 Criptomonedas', icon: '💎' },
  { value: 'cash', label: '💰 Efectivo', icon: '💰' },
  { value: 'wire_transfer', label: '🌐 Wire Transfer', icon: '🌐' },
  { value: 'other', label: '💳 Otro', icon: '💳' },
];

function PaymentMethods({ paymentMethods, availableCurrencies, stats }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank_transfer',
    currency: availableCurrencies.length > 0 ? availableCurrencies[0].code : '',
    account_holder: '',
    account_number: '',
    bank_name: '',
    identification: '',
    instructions: '',
    is_active: true,
    is_default: false,
    daily_limit: '',
    min_amount: '',
    max_amount: '',
    initial_balance: '',
  });

  const getTypeIcon = (type: string) => {
    return paymentTypeOptions.find(opt => opt.value === type)?.icon || '💳';
  };

  const getTypeLabel = (type: string) => {
    return paymentTypeOptions.find(opt => opt.value === type)?.label || type;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMethod) {
      router.put(`/payment-methods/${editingMethod.id}`, formData, {
        onSuccess: () => {
          setShowModal(false);
          resetForm();
        }
      });
    } else {
      router.post('/payment-methods', formData, {
        onSuccess: () => {
          setShowModal(false);
          resetForm();
        }
      });
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      type: method.type,
      currency: method.currency,
      account_holder: method.account_holder || '',
      account_number: method.account_number || '',
      bank_name: method.bank_name || '',
      identification: method.identification || '',
      instructions: method.instructions || '',
      is_active: method.is_active,
      is_default: method.is_default,
      daily_limit: method.daily_limit || '',
      min_amount: method.min_amount || '',
      max_amount: method.max_amount || '',
      initial_balance: '', // No se puede editar el saldo inicial
    });
    setShowModal(true);
  };

  const handleDelete = (method: PaymentMethod) => {
    if (confirm('¿Estás seguro de eliminar este método de pago?')) {
      router.delete(`/payment-methods/${method.id}`);
    }
  };

  const handleToggle = (method: PaymentMethod) => {
    router.post(`/payment-methods/${method.id}/toggle`);
  };

  const resetForm = () => {
    setEditingMethod(null);
    setFormData({
      name: '',
      type: 'bank_transfer',
      currency: availableCurrencies.length > 0 ? availableCurrencies[0].code : '',
      account_holder: '',
      account_number: '',
      bank_name: '',
      identification: '',
      instructions: '',
      is_active: true,
      is_default: false,
      daily_limit: '',
      min_amount: '',
      max_amount: '',
      initial_balance: '',
    });
  };

  const groupedMethods = paymentMethods.reduce((acc, method) => {
    if (!acc[method.currency]) {
      acc[method.currency] = [];
    }
    acc[method.currency].push(method);
    return acc;
  }, {} as Record<string, PaymentMethod[]>);

  return (
    <>
      <Head title="Métodos de Pago" />
      
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Métodos de Pago</h1>
            <p className="text-muted-foreground">
              Configura cómo recibes el dinero de tus clientes
            </p>
          </div>
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Método
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMethod ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
                </DialogTitle>
                <DialogDescription>
                  Completa la información de tu método de pago
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Método *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ej: Pago Móvil Personal"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda *</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCurrencies.length > 0 ? (
                        availableCurrencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No hay monedas disponibles. El Super Admin debe crear pares de divisas primero.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {availableCurrencies.length === 0 && (
                    <p className="text-xs text-amber-600">
                      ⚠️ No hay pares de divisas configurados. Contacta al administrador.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account_holder">Titular de la Cuenta</Label>
                    <Input
                      id="account_holder"
                      value={formData.account_holder}
                      onChange={(e) => setFormData({...formData, account_holder: e.target.value})}
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_number">Número de Cuenta / ID</Label>
                    <Input
                      id="account_number"
                      value={formData.account_number}
                      onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                      placeholder="0412-1234567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Banco / Servicio</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                      placeholder="Banco de Venezuela"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="identification">Cédula / RIF / Teléfono</Label>
                    <Input
                      id="identification"
                      value={formData.identification}
                      onChange={(e) => setFormData({...formData, identification: e.target.value})}
                      placeholder="V-12345678"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instrucciones para el Cliente</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                    placeholder="Enviar captura de pantalla del comprobante de pago..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_amount">Monto Mínimo</Label>
                    <Input
                      id="min_amount"
                      type="number"
                      step="0.01"
                      value={formData.min_amount}
                      onChange={(e) => setFormData({...formData, min_amount: e.target.value})}
                      placeholder="10.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_amount">Monto Máximo</Label>
                    <Input
                      id="max_amount"
                      type="number"
                      step="0.01"
                      value={formData.max_amount}
                      onChange={(e) => setFormData({...formData, max_amount: e.target.value})}
                      placeholder="10000.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="daily_limit">Límite Diario</Label>
                    <Input
                      id="daily_limit"
                      type="number"
                      step="0.01"
                      value={formData.daily_limit}
                      onChange={(e) => setFormData({...formData, daily_limit: e.target.value})}
                      placeholder="50000.00"
                    />
                  </div>
                </div>

                {!editingMethod ? (
                  <div className="space-y-2 bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <Label htmlFor="initial_balance" className="text-blue-900 dark:text-blue-100 font-medium">
                        💰 Saldo Inicial en Caja
                      </Label>
                    </div>
                    <Input
                      id="initial_balance"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.initial_balance}
                      onChange={(e) => setFormData({...formData, initial_balance: e.target.value})}
                      placeholder="0.00"
                      className="bg-white dark:bg-gray-900"
                    />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Establece el saldo inicial que tienes disponible en esta cuenta para operar. 
                      Este saldo se registrará en tu fondo de caja.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="text-sm font-medium text-green-900 dark:text-green-100">
                            Saldo Actual en Caja
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300">
                            Este es tu saldo disponible para operar
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${
                          editingMethod.current_balance >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {editingMethod.currency} {editingMethod.current_balance.toLocaleString('en-US', { 
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-green-200 dark:border-green-800">
                      <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <p className="text-xs text-green-700 dark:text-green-300 flex-1">
                        Para ajustar este saldo, ve a <strong>"Mi Fondo de Caja"</strong> donde podrás registrar depósitos o retiros con trazabilidad completa.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit('/cash-box')}
                        className="shrink-0 border-green-600 text-green-700 hover:bg-green-100 dark:border-green-400 dark:text-green-300 dark:hover:bg-green-900"
                      >
                        Ir a Mi Fondo de Caja
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Activo</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_default}
                      onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Predeterminado para esta moneda</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingMethod ? 'Actualizar' : 'Crear'} Método
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Métodos</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Métodos configurados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <CreditCard className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                En uso actualmente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Por Moneda</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(stats.by_currency).map(([currency, count]) => (
                  <div key={currency} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{currency}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        {paymentMethods.length === 0 && (
          <Card className="bg-blue-950 border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-blue-100">
                    <span className="font-semibold">¡Comienza agregando tus métodos de pago!</span>
                  </p>
                  <p className="text-sm text-blue-100">
                    Define cómo recibes el dinero: Pago Móvil, Zelle, Transferencias, Crypto, etc.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Methods by Currency */}
        {Object.entries(groupedMethods).map(([currency, methods]) => (
          <Card key={currency}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Métodos en {currency}
                <Badge variant="outline">{methods.length}</Badge>
              </CardTitle>
              <CardDescription>
                Métodos de pago configurados para {currency}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {methods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-2xl">{getTypeIcon(method.type)}</span>
                        <p className="text-sm font-medium">{method.name}</p>
                        {method.is_default && (
                          <Badge variant="default">Predeterminado</Badge>
                        )}
                        <Badge variant={method.is_active ? "default" : "secondary"}>
                          {method.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                          💰 Saldo: {method.currency} {method.current_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5 ml-10">
                        {method.account_holder && (
                          <p><span className="font-medium">Titular:</span> {method.account_holder}</p>
                        )}
                        {method.account_number && (
                          <p><span className="font-medium">Cuenta/ID:</span> {method.account_number}</p>
                        )}
                        {method.bank_name && (
                          <p><span className="font-medium">Banco:</span> {method.bank_name}</p>
                        )}
                        {(method.min_amount || method.max_amount) && (
                          <p>
                            <span className="font-medium">Límites:</span> {' '}
                            {method.min_amount && `Min: ${method.currency} ${method.min_amount}`}
                            {method.min_amount && method.max_amount && ' - '}
                            {method.max_amount && `Max: ${method.currency} ${method.max_amount}`}
                          </p>
                        )}
                      </div>
                      {method.instructions && (
                        <div className="ml-10 mt-2 p-2 bg-muted rounded text-xs">
                          <p className="text-muted-foreground">{method.instructions}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(method)}
                        title={method.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {method.is_active ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(method)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(method)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

PaymentMethods.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default PaymentMethods;
