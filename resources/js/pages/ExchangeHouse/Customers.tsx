import { Head, router, useForm } from '@inertiajs/react';
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
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { Users, TrendingUp, Star, UserX, Plus, Search, Filter, Eye, Trash2, MoreVertical, AlertTriangle, Mail, Phone, ShoppingCart, Calendar } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VolumeByPair {
  currency_pair: {
    symbol: string;
    base_currency: string;
    quote_currency: string;
  } | null;
  order_count: number;
  total_base_amount: string;
}

interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  tier: 'new' | 'regular' | 'vip' | 'inactive';
  total_volume: string;
  total_orders: number;
  loyalty_points: number;
  last_order_date: string | null;
  pending_orders_count?: number;
  pending_orders_amount?: string;
  volume_by_pair?: VolumeByPair[];
}

interface Stats {
  total: number;
  vip: number;
  regular: number;
  new: number;
  inactive: number;
  total_volume: number;
  customers_with_pending: number;
  total_pending_amount: number;
}

interface Props {
  customers: {
    data: Customer[];
    links: any[];
    current_page: number;
    last_page: number;
  };
  stats: Stats;
  filters?: {
    search?: string;
    tier?: string;
    status?: string;
  };
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

function Customers({ customers, stats, filters }: Props) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [tierFilter, setTierFilter] = useState(filters?.tier || 'all');
  
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    phone: '',
    identification: '',
    address: '',
    internal_notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/customers', {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setIsCreateDialogOpen(false);
      },
    });
  };

  const handleSearch = () => {
    router.get('/customers', {
      search: searchTerm,
      tier: tierFilter,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleViewCustomer = (customerId: number) => {
    router.visit(`/customers/${customerId}`);
  };

  const handleDeleteCustomer = (customerId: number, customerName: string) => {
    if (confirm(`¿Estás seguro de eliminar a ${customerName}? Esta acción no se puede deshacer.`)) {
      router.delete(`/customers/${customerId}`, {
        preserveScroll: true,
      });
    }
  };

  return (
    <>
      <Head title="Mis Clientes - CRM" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CRM - Mis Clientes</h1>
            <p className="text-muted-foreground">
              Gestiona tu base de clientes y sus métricas
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Agregar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nuevo Cliente</DialogTitle>
                <DialogDescription>
                  Registra un nuevo cliente en tu base de datos
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Nombre completo *</Label>
                    <Input
                      id="name"
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                      placeholder="Juan Pérez"
                      className="mt-1"
                      required
                    />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={e => setData('email', e.target.value)}
                      placeholder="juan@example.com"
                      className="mt-1"
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={data.phone}
                      onChange={e => setData('phone', e.target.value)}
                      placeholder="+58 424-1234567"
                      className="mt-1"
                    />
                    {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="identification">Identificación (CI/RIF/Pasaporte)</Label>
                    <Input
                      id="identification"
                      value={data.identification}
                      onChange={e => setData('identification', e.target.value)}
                      placeholder="V-12345678"
                      className="mt-1"
                    />
                    {errors.identification && <p className="text-sm text-red-500 mt-1">{errors.identification}</p>}
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Textarea
                      id="address"
                      value={data.address}
                      onChange={e => setData('address', e.target.value)}
                      placeholder="Dirección completa"
                      className="mt-1"
                    />
                    {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="internal_notes">Notas internas</Label>
                    <Textarea
                      id="internal_notes"
                      value={data.internal_notes}
                      onChange={e => setData('internal_notes', e.target.value)}
                      placeholder="Notas privadas sobre el cliente..."
                      className="mt-1"
                      rows={3}
                    />
                    {errors.internal_notes && <p className="text-sm text-red-500 mt-1">{errors.internal_notes}</p>}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Guardando...' : 'Crear Cliente'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alerta de Deudas Pendientes */}
        {stats.customers_with_pending > 0 && (
          <Card className="border-yellow-500 bg-yellow-900/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-yellow-500/20">
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <CardTitle className="text-yellow-500">⚠ Clientes con Deudas Pendientes</CardTitle>
                    <CardDescription>
                      {stats.customers_with_pending} cliente(s) tienen operaciones sin completar
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-yellow-500">
                    ${parseFloat(stats.total_pending_amount.toString()).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Total pendiente</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">VIP</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.vip}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regular</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.regular}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nuevos</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.new}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <UserX className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-500">{stats.inactive}</div>
            </CardContent>
          </Card>
        </div>

        {/* Volumen por Par de Divisas */}
        <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-black">
          <CardHeader>
            <CardTitle className="text-lg text-white sm:text-xl">Volumen Total por Par</CardTitle>
            <CardDescription className="text-xs text-gray-400 sm:text-sm">
              Resumen del volumen operado (no se suman porque son divisas diferentes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              // Calcular volumen por par de todos los clientes
              const volumeByPair = new Map<string, { base_amount: number; order_count: number; base_currency: string; quote_currency: string }>();
              
              customers.data.forEach(customer => {
                customer.volume_by_pair?.forEach(volume => {
                  if (volume.currency_pair) {
                    const symbol = volume.currency_pair.symbol;
                    const existing = volumeByPair.get(symbol) || { 
                      base_amount: 0, 
                      order_count: 0,
                      base_currency: volume.currency_pair.base_currency,
                      quote_currency: volume.currency_pair.quote_currency
                    };
                    existing.base_amount += parseFloat(volume.total_base_amount);
                    existing.order_count += volume.order_count;
                    volumeByPair.set(symbol, existing);
                  }
                });
              });
              
              const sortedPairs = Array.from(volumeByPair.entries())
                .sort((a, b) => b[1].base_amount - a[1].base_amount);
              
              return sortedPairs.length > 0 ? (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {sortedPairs.map(([symbol, data]) => (
                    <div 
                      key={symbol} 
                      className="group relative overflow-hidden rounded-lg border border-blue-800/50 bg-gradient-to-br from-blue-950/50 to-blue-900/30 p-4 transition-all hover:border-blue-700 hover:shadow-lg"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-base font-bold text-blue-300 sm:text-lg">{symbol}</span>
                        <Badge variant="outline" className="border-blue-700 text-xs text-blue-400">
                          {data.order_count}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-white sm:text-3xl">
                        {data.base_amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </div>
                      <div className="mt-1 text-xs font-medium text-blue-400">
                        {data.base_currency}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-600" />
                  <p className="mt-2 text-sm text-gray-500">
                    No hay operaciones registradas aún
                  </p>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Filtros y Búsqueda */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, email, teléfono o identificación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  <SelectItem value="pending">⚠ Con deudas pendientes</SelectItem>
                  <SelectItem value="vip">⭐ VIP</SelectItem>
                  <SelectItem value="regular">🟢 Regular</SelectItem>
                  <SelectItem value="new">🆕 Nuevos</SelectItem>
                  <SelectItem value="inactive">⚫ Inactivos</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={handleSearch}>
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>
              Lista completa de tu base de clientes ordenada por volumen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customers.data.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No se encontraron clientes</h3>
                <p className="text-muted-foreground mt-2">
                  {filters?.search 
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Agrega tu primer cliente usando el botón "Agregar Cliente"'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {customers.data.map((customer) => (
                  <div 
                    key={customer.id} 
                    className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black p-4 transition-all hover:border-gray-700 hover:shadow-lg sm:p-6"
                  >
                    {/* Header */}
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xl font-bold text-white sm:h-14 sm:w-14 sm:text-2xl">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-white sm:text-xl">{customer.name}</h3>
                          <div className="mt-1 flex flex-wrap gap-2">
                            <Badge className={`${tierColors[customer.tier]} text-xs`}>
                              {tierLabels[customer.tier]}
                            </Badge>
                            {customer.pending_orders_count && customer.pending_orders_count > 0 && (
                              <Badge className="bg-yellow-500 text-xs text-black hover:bg-yellow-600">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                {customer.pending_orders_count} pendiente
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewCustomer(customer.id)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Ver detalles
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Contacto */}
                    {(customer.email || customer.phone) && (
                      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                        {customer.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Volumen por Par */}
                    <div className="mb-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Volumen operado
                      </p>
                      {customer.volume_by_pair && customer.volume_by_pair.length > 0 ? (
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {customer.volume_by_pair.map((volume, idx) => (
                            volume.currency_pair && (
                              <div 
                                key={idx} 
                                className="rounded-lg border border-blue-800/50 bg-blue-950/30 p-3"
                              >
                                <div className="mb-1 text-xs font-medium text-blue-400">
                                  {volume.currency_pair.symbol}
                                </div>
                                <div className="text-lg font-bold text-white">
                                  {parseFloat(volume.total_base_amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {volume.currency_pair.base_currency}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Sin operaciones</p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 border-t border-gray-800 pt-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <ShoppingCart className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-400">
                          {customer.total_orders} {customer.total_orders === 1 ? 'orden' : 'órdenes'}
                        </span>
                      </div>
                      {customer.last_order_date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-400">
                            Última: {new Date(customer.last_order_date).toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Alerta de deuda */}
                    {customer.pending_orders_count && customer.pending_orders_count > 0 && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg border border-yellow-700/50 bg-yellow-900/20 p-3">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500" />
                        <p className="text-sm font-medium text-yellow-500">
                          Deuda: ${parseFloat(customer.pending_orders_amount || '0').toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

Customers.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default Customers;
