import { Head, Link, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { useState } from 'react';
import { 
  CreditCard, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft,
  Building2,
  Smartphone,
  DollarSign,
  Bitcoin,
  Globe
} from 'lucide-react';

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  currency: string;
  account_holder?: string;
  account_number?: string;
  bank_name?: string;
  identification?: string;
  routing_number?: string;
  swift_code?: string;
  instructions: string;
  is_active: boolean;
  is_primary: boolean;
  display_order: number;
  icon: string;
  type_label: string;
  display_name: string;
}

interface Props {
  paymentMethods: PaymentMethod[];
}

function PlatformPaymentMethods({ paymentMethods }: Props) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: '',
    type: 'bank_transfer',
    currency: 'USD',
    account_holder: '',
    account_number: '',
    bank_name: '',
    identification: '',
    routing_number: '',
    swift_code: '',
    instructions: '',
    is_active: true,
    is_primary: false,
    display_order: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMethod) {
      put(`/admin/platform-payment-methods/${editingMethod.id}`, {
        onSuccess: () => {
          reset();
          setEditingMethod(null);
        },
      });
    } else {
      post('/admin/platform-payment-methods', {
        onSuccess: () => {
          reset();
          setIsCreateDialogOpen(false);
        },
      });
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setData({
      name: method.name,
      type: method.type,
      currency: method.currency,
      account_holder: method.account_holder || '',
      account_number: method.account_number || '',
      bank_name: method.bank_name || '',
      identification: method.identification || '',
      routing_number: method.routing_number || '',
      swift_code: method.swift_code || '',
      instructions: method.instructions,
      is_active: method.is_active,
      is_primary: method.is_primary,
      display_order: method.display_order,
    });
    setEditingMethod(method);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este método de pago?')) {
      router.delete(`/admin/platform-payment-methods/${id}`);
    }
  };

  const handleToggle = (id: number) => {
    router.post(`/admin/platform-payment-methods/${id}/toggle`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bank_transfer': return <Building2 className="h-4 w-4" />;
      case 'mobile_payment': return <Smartphone className="h-4 w-4" />;
      case 'zelle': return <DollarSign className="h-4 w-4" />;
      case 'crypto': return <Bitcoin className="h-4 w-4" />;
      case 'wire_transfer': return <Globe className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const typeOptions = [
    { value: 'bank_transfer', label: 'Transferencia Bancaria' },
    { value: 'mobile_payment', label: 'Pago Móvil' },
    { value: 'zelle', label: 'Zelle' },
    { value: 'crypto', label: 'Criptomoneda' },
    { value: 'wire_transfer', label: 'Transferencia Internacional' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'other', label: 'Otro' },
  ];

  const currencyOptions = [
    { value: 'USD', label: 'USD - Dólar Estadounidense' },
    { value: 'VES', label: 'VES - Bolívar Venezolano' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'BTC', label: 'BTC - Bitcoin' },
    { value: 'USDT', label: 'USDT - Tether' },
  ];

  return (
    <>
      <Head title="Métodos de Pago de la Plataforma" />
      
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-4xl font-bold tracking-tight">
                Métodos de Pago de Kuberafi
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Configura las cuentas donde los operadores deben pagar sus comisiones
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Método
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Método de Pago</DialogTitle>
                <DialogDescription>
                  Agrega una cuenta donde los operadores pueden pagar sus comisiones
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Método *</Label>
                    <Input
                      id="name"
                      placeholder="Ej: Cuenta Principal USD"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((option) => (
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
                  <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account_holder">Titular de la Cuenta</Label>
                    <Input
                      id="account_holder"
                      placeholder="Nombre del titular"
                      value={data.account_holder}
                      onChange={(e) => setData('account_holder', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_number">Número de Cuenta</Label>
                    <Input
                      id="account_number"
                      placeholder="0123456789"
                      value={data.account_number}
                      onChange={(e) => setData('account_number', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Banco/Servicio</Label>
                    <Input
                      id="bank_name"
                      placeholder="Nombre del banco"
                      value={data.bank_name}
                      onChange={(e) => setData('bank_name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="identification">Identificación</Label>
                    <Input
                      id="identification"
                      placeholder="CI, RIF, teléfono"
                      value={data.identification}
                      onChange={(e) => setData('identification', e.target.value)}
                    />
                  </div>
                </div>

                {data.type === 'wire_transfer' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="routing_number">Routing Number</Label>
                      <Input
                        id="routing_number"
                        placeholder="Para transferencias internacionales"
                        value={data.routing_number}
                        onChange={(e) => setData('routing_number', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="swift_code">Código SWIFT</Label>
                      <Input
                        id="swift_code"
                        placeholder="Para transferencias SWIFT"
                        value={data.swift_code}
                        onChange={(e) => setData('swift_code', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instrucciones para Operadores *</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Instrucciones detalladas de cómo realizar el pago..."
                    value={data.instructions}
                    onChange={(e) => setData('instructions', e.target.value)}
                    rows={4}
                  />
                  {errors.instructions && <p className="text-sm text-red-600">{errors.instructions}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={data.is_active}
                      onCheckedChange={(checked) => setData('is_active', checked)}
                    />
                    <Label htmlFor="is_active">Activo</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_primary"
                      checked={data.is_primary}
                      onCheckedChange={(checked) => setData('is_primary', checked)}
                    />
                    <Label htmlFor="is_primary">Principal</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_order">Orden</Label>
                    <Input
                      id="display_order"
                      type="number"
                      min="0"
                      value={data.display_order}
                      onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Creando...' : 'Crear Método'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Métodos */}
        <div className="grid gap-4">
          {paymentMethods.length > 0 ? (
            paymentMethods.map((method) => (
              <Card key={method.id} className={!method.is_active ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getTypeIcon(method.type)}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {method.name}
                          {method.is_primary && (
                            <Badge variant="default">Principal</Badge>
                          )}
                          {!method.is_active && (
                            <Badge variant="secondary">Inactivo</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {method.type_label} • {method.currency}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggle(method.id)}
                      >
                        {method.is_active ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(method)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {method.account_holder && (
                      <div>
                        <span className="text-muted-foreground">Titular:</span>
                        <p className="font-medium">{method.account_holder}</p>
                      </div>
                    )}
                    {method.account_number && (
                      <div>
                        <span className="text-muted-foreground">Cuenta:</span>
                        <p className="font-medium">{method.account_number}</p>
                      </div>
                    )}
                    {method.bank_name && (
                      <div>
                        <span className="text-muted-foreground">Banco:</span>
                        <p className="font-medium">{method.bank_name}</p>
                      </div>
                    )}
                    {method.identification && (
                      <div>
                        <span className="text-muted-foreground">Identificación:</span>
                        <p className="font-medium">{method.identification}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Instrucciones:</p>
                    <p className="text-sm whitespace-pre-wrap">{method.instructions}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay métodos de pago configurados</h3>
                <p className="text-muted-foreground mb-4">
                  Crea el primer método de pago para que los operadores puedan enviar sus comisiones
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Método
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Dialog de Edición */}
        <Dialog open={!!editingMethod} onOpenChange={(open) => !open && setEditingMethod(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Método de Pago</DialogTitle>
              <DialogDescription>
                Actualiza la información del método de pago
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Same form fields as create */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_name">Nombre del Método *</Label>
                  <Input
                    id="edit_name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_type">Tipo *</Label>
                  <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_currency">Moneda *</Label>
                <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_account_holder">Titular de la Cuenta</Label>
                  <Input
                    id="edit_account_holder"
                    value={data.account_holder}
                    onChange={(e) => setData('account_holder', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_account_number">Número de Cuenta</Label>
                  <Input
                    id="edit_account_number"
                    value={data.account_number}
                    onChange={(e) => setData('account_number', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_bank_name">Banco/Servicio</Label>
                  <Input
                    id="edit_bank_name"
                    value={data.bank_name}
                    onChange={(e) => setData('bank_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_identification">Identificación</Label>
                  <Input
                    id="edit_identification"
                    value={data.identification}
                    onChange={(e) => setData('identification', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_instructions">Instrucciones *</Label>
                <Textarea
                  id="edit_instructions"
                  value={data.instructions}
                  onChange={(e) => setData('instructions', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit_is_active"
                    checked={data.is_active}
                    onCheckedChange={(checked) => setData('is_active', checked)}
                  />
                  <Label htmlFor="edit_is_active">Activo</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit_is_primary"
                    checked={data.is_primary}
                    onCheckedChange={(checked) => setData('is_primary', checked)}
                  />
                  <Label htmlFor="edit_is_primary">Principal</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_display_order">Orden</Label>
                  <Input
                    id="edit_display_order"
                    type="number"
                    min="0"
                    value={data.display_order}
                    onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingMethod(null);
                    reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

PlatformPaymentMethods.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default PlatformPaymentMethods;
