import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { Users, TrendingUp, Star, UserX } from 'lucide-react';

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
  };
  stats: Stats;
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

function Customers({ customers, stats }: Props) {
  return (
    <>
      <Head title="Mis Clientes - CRM" />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM - Mis Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona tu base de clientes y sus métricas
          </p>
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
                <h3 className="mt-4 text-lg font-semibold">No tienes clientes aún</h3>
                <p className="text-muted-foreground mt-2">
                  Los clientes se crearán automáticamente cuando hagas órdenes
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {customers.data.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
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
