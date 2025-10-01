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
import { Users, TrendingUp, Star, UserX, Plus, Search, Filter, Eye, Trash2, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
}

interface Stats {
  total: number;
  vip: number;
  regular: number;
  new: number;
  inactive: number;
  total_volume: number;
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

        {/* Volumen Total */}
        <Card className="bg-gradient-to-br from-blue-900 to-blue-800">
          <CardHeader>
            <CardTitle className="text-white">Volumen Total Operado</CardTitle>
            <CardDescription className="text-blue-200">
              Suma de todas las operaciones de tus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">
              ${parseFloat(stats.total_volume.toString()).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
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
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tiers</SelectItem>
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
              <div className="space-y-3">
                {customers.data.map((customer) => (
                  <div 
                    key={customer.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">👤</span>
                        <p className="text-sm font-medium">{customer.name}</p>
                        <Badge className={tierColors[customer.tier]}>
                          {tierLabels[customer.tier]}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5 ml-10">
                        {customer.email && (
                          <p>📧 {customer.email}</p>
                        )}
                        {customer.phone && (
                          <p>📱 {customer.phone}</p>
                        )}
                        <p>
                          <span className="font-medium">Volumen:</span> ${parseFloat(customer.total_volume).toLocaleString('en-US')} USD
                          {' | '}
                          <span className="font-medium">Órdenes:</span> {customer.total_orders}
                          {' | '}
                          <span className="font-medium">Puntos:</span> {customer.loyalty_points}
                        </p>
                        {customer.last_order_date && (
                          <p className="text-xs">
                            <span className="font-medium">Última orden:</span> {new Date(customer.last_order_date).toLocaleDateString('es-ES')}
                          </p>
                        )}
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
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
