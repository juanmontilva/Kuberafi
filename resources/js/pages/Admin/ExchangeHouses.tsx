import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  Plus,
  Eye,
  Edit,
  Building2,
  Users,
  DollarSign
} from 'lucide-react';

interface ExchangeHouse {
  id: number;
  name: string;
  business_name: string;
  email: string;
  commission_rate: string;
  daily_limit: string;
  is_active: boolean;
  users_count: number;
  orders_count: number;
  orders_sum_base_amount: string;
  created_at: string;
}

interface PaginatedExchangeHouses {
  data: ExchangeHouse[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Props {
  exchangeHouses: PaginatedExchangeHouses;
}

function AdminExchangeHouses({ exchangeHouses }: Props) {
  return (
    <>
      <Head title="Casas de Cambio" />
      
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Casas de Cambio</h1>
            <p className="text-muted-foreground">
              Gestiona todas las casas de cambio registradas en la plataforma
            </p>
          </div>
          <Button asChild>
            <Link href="/exchange-houses/create">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Casa de Cambio
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Casas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exchangeHouses.total}</div>
              <p className="text-xs text-muted-foreground">
                Registradas en la plataforma
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activas</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {exchangeHouses.data.filter(h => h.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Operando actualmente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volumen Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${exchangeHouses.data.reduce((sum, house) => sum + parseFloat(house.orders_sum_base_amount || '0'), 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                En transacciones
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Exchange Houses List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Casas de Cambio</CardTitle>
            <CardDescription>
              Todas las casas de cambio registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exchangeHouses.data.length > 0 ? (
                exchangeHouses.data.map((house) => (
                  <div key={house.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{house.name}</p>
                        <Badge variant={house.is_active ? "default" : "secondary"}>
                          {house.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {house.business_name} • {house.email}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {house.users_count} usuarios
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {house.orders_count} órdenes
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">${house.orders_sum_base_amount || '0.00'}</p>
                      <p className="text-xs text-muted-foreground">
                        Límite: ${house.daily_limit}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/exchange-houses/${house.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/exchange-houses/${house.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay casas de cambio registradas</p>
                  <Button className="mt-4" asChild>
                    <Link href="/exchange-houses/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Primera Casa de Cambio
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {exchangeHouses.last_page > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((exchangeHouses.current_page - 1) * exchangeHouses.per_page) + 1} a {Math.min(exchangeHouses.current_page * exchangeHouses.per_page, exchangeHouses.total)} de {exchangeHouses.total} casas
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

AdminExchangeHouses.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default AdminExchangeHouses;