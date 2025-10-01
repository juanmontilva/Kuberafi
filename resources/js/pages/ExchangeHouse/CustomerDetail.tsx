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
}

interface Order {
  id: number;
  base_amount: string;
  quote_amount: string;
  status: string;
  created_at: string;
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

interface Props {
  customer: Customer;
  activities: {
    data: Activity[];
    links: any[];
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

function CustomerDetail({ customer, activities }: Props) {
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.visit('/customers')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
                <Badge className={tierColors[customer.tier]}>
                  {tierLabels[customer.tier]}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Cliente desde {new Date(customer.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              onClick={() => setIsDeleteDialogOpen(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Editar Cliente</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Cliente</DialogTitle>
                  <DialogDescription>
                    Actualiza la información del cliente
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleUpdateCustomer} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
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

                    <div>
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editForm.data.email}
                        onChange={e => editForm.setData('email', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-phone">Teléfono</Label>
                      <Input
                        id="edit-phone"
                        value={editForm.data.phone}
                        onChange={e => editForm.setData('phone', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="col-span-2">
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

                    <div className="col-span-2">
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
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Actividad
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
        <div className="grid gap-4 md:grid-cols-4">
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

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="orders">Órdenes ({customer.orders?.length || 0})</TabsTrigger>
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
                <CardTitle>Órdenes Recientes</CardTitle>
                <CardDescription>
                  Últimas 10 órdenes del cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!customer.orders || customer.orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No hay órdenes</h3>
                    <p className="text-muted-foreground mt-2">
                      Este cliente aún no ha realizado ninguna orden
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customer.orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Orden #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${parseFloat(order.base_amount).toLocaleString('en-US')}
                          </p>
                          <Badge variant="secondary">{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
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
