import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ShoppingCart,
  Star,
  FileText,
  Plus,
  MessageSquare,
  PhoneCall,
  Video,
  User,
  Trash2
} from 'lucide-react';
import { useState } from 'react';

interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  identification: string | null;
  address: string | null;
  tier: 'new' | 'regular' | 'vip' | 'inactive';
  tags: string[] | null;
  total_volume: string;
  total_orders: number;
  average_order_value: string;
  loyalty_points: number;
  last_order_date: string | null;
  internal_notes: string | null;
  kyc_status: 'pending' | 'verified' | 'rejected';
  is_active: boolean;
  is_blocked: boolean;
  blocked_reason: string | null;
  created_at: string;
  orders?: Order[];
  pending_orders_count?: number;
  pending_orders_amount?: string;
}

interface Order {
  id: number;
  order_number: string;
  base_amount: string;
  quote_amount: string;
  status: string;
  created_at: string;
  currency_pair: {
    id: number;
    symbol: string;
    base_currency: string;
    quote_currency: string;
  };
}

interface PaginatedOrders {
  data: Order[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: any[];
}

interface Activity {
  id: number;
  type: string;
  title: string | null;
  description: string | null;
  created_at: string;
  user: {
    id: number;
    name: string;
  } | null;
}

interface BankAccount {
  id: number;
  account_name: string;
  bank_name: string;
  account_number: string;
  account_type: string | null;
  currency: string;
  notes: string | null;
  created_at: string;
}

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

interface Props {
  customer: Customer;
  orders: PaginatedOrders;
  activities: {
    data: Activity[];
    links: any[];
  };
  bankAccounts: BankAccount[];
  currencies: Currency[];
}

const tierColors = {
  vip: 'bg-yellow-900/20 text-yellow-400 border-yellow-500',
  regular: 'bg-green-900/20 text-green-400 border-green-500',
  new: 'bg-blue-900/20 text-blue-400 border-blue-500',
  inactive: 'bg-gray-900/20 text-gray-400 border-gray-500',
};

const tierLabels = {
  vip: '⭐ VIP',
  regular: '🟢 Regular',
  new: '🆕 Nuevo',
  inactive: '⚫ Inactivo',
};

const activityIcons = {
  note: <FileText className="h-4 w-4" />,
  call: <PhoneCall className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  meeting: <Video className="h-4 w-4" />,
  order_created: <ShoppingCart className="h-4 w-4" />,
  kyc_update: <User className="h-4 w-4" />,
  status_change: <FileText className="h-4 w-4" />,
  tier_change: <Star className="h-4 w-4" />,
  other: <MessageSquare className="h-4 w-4" />,
};

const activityLabels = {
  note: 'Nota',
  call: 'Llamada',
  email: 'Email',
  meeting: 'Reunión',
  order_created: 'Orden creada',
  kyc_update: 'Actualización KYC',
  status_change: 'Cambio de estado',
  tier_change: 'Cambio de categoría',
  other: 'Otro',
};

function CustomerDetail({ customer, orders, activities, bankAccounts, currencies }: Props) {
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBankAccountDialogOpen, setIsBankAccountDialogOpen] = useState(false);
  const [editingBankAccount, setEditingBankAccount] = useState<BankAccount | null>(null);
  const [currencySearch, setCurrencySearch] = useState('');

  const { data, setData, post, processing, errors, reset } = useForm({
    type: 'note',
    title: '',
    description: '',
  });

  const editForm = useForm({
    name: customer.name,
    email: customer.email || '',
    phone: customer.phone || '',
    identification: customer.identification || '',
    address: customer.address || '',
    internal_notes: customer.internal_notes || '',
    tier: customer.tier,
  });

  const bankAccountForm = useForm({
    account_name: '',
    bank_name: '',
    account_number: '',
    account_type: '',
    currency: 'USD',
    notes: '',
  });

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/customers/${customer.id}/activities`, {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setIsActivityDialogOpen(false);
      },
    });
  };

  const handleUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    editForm.put(`/customers/${customer.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setIsEditDialogOpen(false);
      },
    });
  };

  const handleDeleteCustomer = () => {
    setIsDeleting(true);
    router.delete(`/customers/${customer.id}`, {
      onSuccess: () => {
        router.visit('/customers');
      },
      onError: () => {
        setIsDeleting(false);
      },
      onFinish: () => {
        setIsDeleting(false);
      },
    });
  };

  const handleAddBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    bankAccountForm.post(`/customers/${customer.id}/bank-accounts`, {
      preserveScroll: true,
      onSuccess: () => {
        bankAccountForm.reset();
        setIsBankAccountDialogOpen(false);
      },
    });
  };

  const handleEditBankAccount = (account: BankAccount) => {
    setEditingBankAccount(account);
    bankAccountForm.setData({
      account_name: account.account_name,
      bank_name: account.bank_name,
      account_number: account.account_number,
      account_type: account.account_type || '',
      currency: account.currency,
      notes: account.notes || '',
    });
    setIsBankAccountDialogOpen(true);
  };

  const handleUpdateBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBankAccount) return;
    
    bankAccountForm.put(`/customers/${customer.id}/bank-accounts/${editingBankAccount.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        bankAccountForm.reset();
        setEditingBankAccount(null);
        setIsBankAccountDialogOpen(false);
      },
    });
  };

  const handleDeleteBankAccount = (accountId: number) => {
    if (confirm('¿Eliminar esta cuenta bancaria?')) {
      router.delete(`/customers/${customer.id}/bank-accounts/${accountId}`, {
        preserveScroll: true,
      });
    }
  };

  const handleCloseBankAccountDialog = () => {
    setIsBankAccountDialogOpen(false);
    setEditingBankAccount(null);
    bankAccountForm.reset();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Head title={`${customer.name} - Detalle del Cliente`} />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.visit('/customers')}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <h1 className="text-2xl font-bold tracking-tight truncate sm:text-3xl">{customer.name}</h1>
                <Badge className={`${tierColors[customer.tier]} shrink-0 w-fit`}>
                  {tierLabels[customer.tier]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Cliente desde {new Date(customer.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <Button 
              variant="destructive" 
              onClick={() => setIsDeleteDialogOpen(true)}
              className="gap-2 flex-1 sm:flex-none"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sm:inline">Eliminar</span>
            </Button>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-none" size="sm">
                  Editar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                <DialogHeader>
                  <DialogTitle>Editar Cliente</DialogTitle>
                  <DialogDescription>
                    Actualiza la información del cliente
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleUpdateCustomer} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                      <Label htmlFor="edit-name">Nombre completo *</Label>
                      <Input
                        id="edit-name"
                        value={editForm.data.name}
                        onChange={e => editForm.setData('name', e.target.value)}
                        className="mt-1"
                        required
                      />
                      {editForm.errors.name && <p className="text-sm text-red-500 mt-1">{editForm.errors.name}</p>}
                    </div>

                    <div className="col-span-1">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editForm.data.email}
                        onChange={e => editForm.setData('email', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="col-span-1">
                      <Label htmlFor="edit-phone">Teléfono</Label>
                      <Input
                        id="edit-phone"
                        value={editForm.data.phone}
                        onChange={e => editForm.setData('phone', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <Label htmlFor="edit-tier">Categoría</Label>
                      <Select value={editForm.data.tier} onValueChange={(value: any) => editForm.setData('tier', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">🆕 Nuevo</SelectItem>
                          <SelectItem value="regular">🟢 Regular</SelectItem>
                          <SelectItem value="vip">⭐ VIP</SelectItem>
                          <SelectItem value="inactive">⚫ Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <Label htmlFor="edit-notes">Notas internas</Label>
                      <Textarea
                        id="edit-notes"
                        value={editForm.data.internal_notes}
                        onChange={e => editForm.setData('internal_notes', e.target.value)}
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={editForm.processing}>
                      {editForm.processing ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 flex-1 sm:flex-none" size="sm">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Agregar Actividad</span>
                  <span className="sm:hidden">Actividad</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Actividad</DialogTitle>
                  <DialogDescription>
                    Registra una interacción con el cliente
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleAddActivity} className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="type">Tipo de actividad</Label>
                      <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="note">📝 Nota</SelectItem>
                          <SelectItem value="call">📞 Llamada</SelectItem>
                          <SelectItem value="email">📧 Email</SelectItem>
                          <SelectItem value="meeting">🎥 Reunión</SelectItem>
                          <SelectItem value="other">💬 Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type}</p>}
                    </div>

                    <div>
                      <Label htmlFor="title">Título (opcional)</Label>
                      <Input
                        id="title"
                        value={data.title}
                        onChange={e => setData('title', e.target.value)}
                        placeholder="Resumen breve..."
                        className="mt-1"
                      />
                      {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                        placeholder="Describe la actividad..."
                        className="mt-1"
                        rows={4}
                        required
                      />
                      {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsActivityDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={processing}>
                      {processing ? 'Guardando...' : 'Registrar Actividad'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volumen Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${parseFloat(customer.total_volume).toLocaleString('en-US')}
              </div>
              <p className="text-xs text-muted-foreground">
                Promedio: ${parseFloat(customer.average_order_value).toLocaleString('en-US')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customer.total_orders}</div>
              {customer.last_order_date && (
                <p className="text-xs text-muted-foreground">
                  Última: {new Date(customer.last_order_date).toLocaleDateString('es-ES')}
                </p>
              )}
              {customer.pending_orders_count && customer.pending_orders_count > 0 && (
                <p className="text-xs text-yellow-500 mt-1">
                  ⚠ {customer.pending_orders_count} pendiente(s)
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Puntos de Lealtad</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customer.loyalty_points}</div>
              <p className="text-xs text-muted-foreground">Disponibles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado KYC</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={customer.kyc_status === 'verified' ? 'default' : 'secondary'}>
                {customer.kyc_status === 'verified' ? '✓ Verificado' : 
                 customer.kyc_status === 'rejected' ? '✗ Rechazado' : '⏳ Pendiente'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Alerta de órdenes pendientes */}
        {customer.pending_orders_count && customer.pending_orders_count > 0 && (
          <Card className="border-yellow-500 bg-yellow-900/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-yellow-500/20">
                    <ShoppingCart className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <CardTitle className="text-yellow-500">Operaciones Pendientes</CardTitle>
                    <CardDescription>
                      Este cliente tiene {customer.pending_orders_count} orden(es) sin completar
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-500">
                    ${parseFloat(customer.pending_orders_amount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Monto pendiente</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="orders">
              Órdenes ({orders.total})
              {customer.pending_orders_count && customer.pending_orders_count > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-black">
                  {customer.pending_orders_count} pendiente(s)
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Datos de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.identification && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.identification}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="flex-1">{customer.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {customer.internal_notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notas Internas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {customer.internal_notes}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cuentas Bancarias</CardTitle>
                    <CardDescription>
                      Cuentas frecuentes del cliente para operaciones
                    </CardDescription>
                  </div>
                  <Dialog open={isBankAccountDialogOpen} onOpenChange={setIsBankAccountDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2" onClick={() => {
                        setEditingBankAccount(null);
                        bankAccountForm.reset();
                        setIsBankAccountDialogOpen(true);
                      }}>
                        <Plus className="h-4 w-4" />
                        Agregar Cuenta
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingBankAccount ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
                        </DialogTitle>
                        <DialogDescription>
                          Guarda la información bancaria del cliente para futuras operaciones
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={editingBankAccount ? handleUpdateBankAccount : handleAddBankAccount} className="space-y-4">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="account_name">Nombre de la Cuenta *</Label>
                            <Input
                              id="account_name"
                              value={bankAccountForm.data.account_name}
                              onChange={e => bankAccountForm.setData('account_name', e.target.value)}
                              placeholder="Ej: Cuenta Principal, Cuenta Nómina..."
                              className="mt-1"
                              required
                            />
                            {bankAccountForm.errors.account_name && (
                              <p className="text-sm text-red-500 mt-1">{bankAccountForm.errors.account_name}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="bank_name">Banco *</Label>
                            <Input
                              id="bank_name"
                              value={bankAccountForm.data.bank_name}
                              onChange={e => bankAccountForm.setData('bank_name', e.target.value)}
                              placeholder="Nombre del banco..."
                              className="mt-1"
                              required
                            />
                            {bankAccountForm.errors.bank_name && (
                              <p className="text-sm text-red-500 mt-1">{bankAccountForm.errors.bank_name}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="account_number">Número de Cuenta *</Label>
                              <Input
                                id="account_number"
                                value={bankAccountForm.data.account_number}
                                onChange={e => bankAccountForm.setData('account_number', e.target.value)}
                                placeholder="0000-0000-0000"
                                className="mt-1"
                                required
                              />
                              {bankAccountForm.errors.account_number && (
                                <p className="text-sm text-red-500 mt-1">{bankAccountForm.errors.account_number}</p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="account_type">Tipo de Cuenta</Label>
                              <Input
                                id="account_type"
                                value={bankAccountForm.data.account_type}
                                onChange={e => bankAccountForm.setData('account_type', e.target.value)}
                                placeholder="Ahorro, Corriente..."
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="currency">Moneda *</Label>
                            <Select 
                              value={bankAccountForm.data.currency} 
                              onValueChange={(value) => {
                                bankAccountForm.setData('currency', value);
                                setCurrencySearch('');
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selecciona una moneda">
                                  {bankAccountForm.data.currency && currencies.find(c => c.code === bankAccountForm.data.currency)
                                    ? `${bankAccountForm.data.currency} - ${currencies.find(c => c.code === bankAccountForm.data.currency)?.name}`
                                    : 'Selecciona una moneda'}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <div className="p-2 border-b sticky top-0 bg-background">
                                  <Input
                                    placeholder="Buscar moneda..."
                                    value={currencySearch}
                                    onChange={(e) => setCurrencySearch(e.target.value)}
                                    className="h-8"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div className="max-h-[200px] overflow-y-auto">
                                  {currencies
                                    .filter(currency => 
                                      currencySearch === '' ||
                                      currency.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
                                      currency.name.toLowerCase().includes(currencySearch.toLowerCase())
                                    )
                                    .map(currency => (
                                      <SelectItem key={currency.id} value={currency.code}>
                                        {currency.code} - {currency.name}
                                      </SelectItem>
                                    ))}
                                  {currencies.filter(currency => 
                                    currencySearch === '' ||
                                    currency.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
                                    currency.name.toLowerCase().includes(currencySearch.toLowerCase())
                                  ).length === 0 && (
                                    <div className="p-4 text-sm text-muted-foreground text-center">
                                      No se encontraron monedas
                                    </div>
                                  )}
                                </div>
                              </SelectContent>
                            </Select>
                            {bankAccountForm.errors.currency && (
                              <p className="text-sm text-red-500 mt-1">{bankAccountForm.errors.currency}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="notes">Notas</Label>
                            <Textarea
                              id="notes"
                              value={bankAccountForm.data.notes}
                              onChange={e => bankAccountForm.setData('notes', e.target.value)}
                              placeholder="Información adicional..."
                              className="mt-1"
                              rows={3}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseBankAccountDialog}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" disabled={bankAccountForm.processing}>
                            {bankAccountForm.processing ? 'Guardando...' : editingBankAccount ? 'Actualizar' : 'Agregar'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {bankAccounts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      No hay cuentas bancarias registradas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bankAccounts.map((account) => (
                      <div key={account.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{account.account_name}</p>
                              <Badge variant="secondary">{account.currency}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {account.bank_name}
                            </p>
                            <p className="text-sm font-mono mt-1">
                              {account.account_number}
                            </p>
                            {account.account_type && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Tipo: {account.account_type}
                              </p>
                            )}
                            {account.notes && (
                              <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">
                                {account.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditBankAccount(account)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteBankAccount(account.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {customer.tags && customer.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Etiquetas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Actividades</CardTitle>
                <CardDescription>
                  Todas las interacciones y eventos relacionados con este cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activities.data.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No hay actividades aún</h3>
                    <p className="text-muted-foreground mt-2">
                      Comienza agregando notas, llamadas o interacciones
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.data.map((activity) => (
                      <div key={activity.id} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="flex-shrink-0 mt-1">
                          <div className="p-2 rounded-full bg-muted">
                            {activityIcons[activity.type as keyof typeof activityIcons]}
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {activity.title || activityLabels[activity.type as keyof typeof activityLabels]}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(activity.created_at)}
                            </span>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {activity.description}
                            </p>
                          )}
                          {activity.user && (
                            <p className="text-xs text-muted-foreground">
                              Por: {activity.user.name}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Todas las Órdenes</CardTitle>
                    <CardDescription>
                      {orders.total > 0 ? (
                        <>
                          Mostrando {((orders.current_page - 1) * orders.per_page) + 1} a {Math.min(orders.current_page * orders.per_page, orders.total)} de {orders.total} órdenes
                          {customer.pending_orders_count && customer.pending_orders_count > 0 && (
                            <span className="text-yellow-500 ml-2">
                              • {customer.pending_orders_count} pendiente(s)
                            </span>
                          )}
                        </>
                      ) : (
                        'No hay órdenes registradas'
                      )}
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => router.visit('/orders/create')}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nueva Orden
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {orders.data.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No hay órdenes</h3>
                    <p className="text-muted-foreground mt-2">
                      Este cliente aún no ha realizado ninguna orden
                    </p>
                    <Button 
                      onClick={() => router.visit('/orders/create')}
                      className="mt-4 gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Crear Primera Orden
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {orders.data.map((order) => {
                        const statusColors = {
                          pending: 'bg-yellow-900/20 text-yellow-400 border-yellow-500',
                          processing: 'bg-blue-900/20 text-blue-400 border-blue-500',
                          completed: 'bg-green-900/20 text-green-400 border-green-500',
                          cancelled: 'bg-gray-900/20 text-gray-400 border-gray-500',
                          failed: 'bg-red-900/20 text-red-400 border-red-500',
                        };
                        
                        const statusLabels = {
                          pending: '⏳ Pendiente',
                          processing: '🔄 Procesando',
                          completed: '✓ Completada',
                          cancelled: '✗ Cancelada',
                          failed: '⚠ Fallida',
                        };
                        
                        return (
                          <div 
                            key={order.id} 
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => router.visit(`/orders/${order.id}`)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{order.order_number}</p>
                                <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                                  {statusLabels[order.status as keyof typeof statusLabels]}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {order.currency_pair.symbol} • {new Date(order.created_at).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">
                                ${parseFloat(order.base_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                → {order.currency_pair.base_currency}
                              </p>
                              {order.status === 'pending' && (
                                <p className="text-xs text-yellow-500 mt-1">
                                  ⚠ Operación pendiente
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Paginación */}
                    {orders.last_page > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Página {orders.current_page} de {orders.last_page}
                        </p>
                        <div className="flex items-center gap-2">
                          {orders.current_page > 1 && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.visit(`/customers/${customer.id}?page=${orders.current_page - 1}`, {
                                preserveScroll: true,
                                preserveState: true,
                              })}
                            >
                              Anterior
                            </Button>
                          )}
                          
                          {/* Números de página */}
                          <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, orders.last_page) }, (_, i) => {
                              let pageNum;
                              if (orders.last_page <= 5) {
                                pageNum = i + 1;
                              } else if (orders.current_page <= 3) {
                                pageNum = i + 1;
                              } else if (orders.current_page >= orders.last_page - 2) {
                                pageNum = orders.last_page - 4 + i;
                              } else {
                                pageNum = orders.current_page - 2 + i;
                              }
                              
                              return (
                                <Button
                                  key={pageNum}
                                  variant={orders.current_page === pageNum ? 'default' : 'outline'}
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                  onClick={() => router.visit(`/customers/${customer.id}?page=${pageNum}`, {
                                    preserveScroll: true,
                                    preserveState: true,
                                  })}
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>

                          {orders.current_page < orders.last_page && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.visit(`/customers/${customer.id}?page=${orders.current_page + 1}`, {
                                preserveScroll: true,
                                preserveState: true,
                              })}
                            >
                              Siguiente
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Confirmación de Eliminación */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Eliminar cliente?</DialogTitle>
              <DialogDescription>
                Esta acción eliminará a <strong>{customer.name}</strong> de tu base de datos.
                El historial de órdenes y actividades se mantendrá pero el cliente no será visible.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCustomer}
                disabled={isDeleting}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

CustomerDetail.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default CustomerDetail;
