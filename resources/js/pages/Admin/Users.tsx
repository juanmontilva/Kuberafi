import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  Users,
  Shield,
  Building2,
  Plus,
  Edit,
  Eye
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  exchange_house?: {
    name: string;
  };
}

interface PaginatedUsers {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Props {
  users: PaginatedUsers;
}

function AdminUsers({ users }: Props) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'exchange_house': return 'bg-blue-100 text-blue-800';
      case 'operator': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'exchange_house': return 'Casa de Cambio';
      case 'operator': return 'Operador';
      default: return role;
    }
  };

  return (
    <>
      <Head title="Gestión de Usuarios" />
      
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">
              Administra todos los usuarios registrados en la plataforma
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/users/create">
              <Plus className="mr-2 h-4 w-4" />
              Crear Usuario
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {users.data.filter(u => u.role === 'super_admin').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Casas de Cambio</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {users.data.filter(u => u.role === 'exchange_house').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operadores</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {users.data.filter(u => u.role === 'operator').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>
              Todos los usuarios registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.data.length > 0 ? (
                users.data.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{user.name}</p>
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleText(user.role)}
                        </Badge>
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                        {user.exchange_house && ` • ${user.exchange_house.name}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Registrado: {new Date(user.created_at).toLocaleDateString('es-ES')}
                        {user.last_login_at && ` • Último acceso: ${new Date(user.last_login_at).toLocaleDateString('es-ES')}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/users/${user.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay usuarios registrados</p>
                  <Button className="mt-4" asChild>
                    <Link href="/admin/users/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Primer Usuario
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {users.last_page > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((users.current_page - 1) * users.per_page) + 1} a {Math.min(users.current_page * users.per_page, users.total)} de {users.total} usuarios
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

AdminUsers.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default AdminUsers;