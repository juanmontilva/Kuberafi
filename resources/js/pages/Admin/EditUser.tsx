import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
    ArrowLeft, 
    Save, 
    User, 
    ChevronRight,
    Home,
    Users,
    AlertCircle,
    Shield
} from 'lucide-react';
import { FormEventHandler } from 'react';

interface ExchangeHouse {
    id: number;
    name: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    exchange_house_id: number | null;
    is_active: boolean;
    exchangeHouse?: ExchangeHouse;
}

interface Props {
    user: UserData;
    exchangeHouses: ExchangeHouse[];
}

function EditUser({ user, exchangeHouses }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role: user.role || '',
        exchange_house_id: user.exchange_house_id?.toString() || '',
        is_active: user.is_active ?? true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`);
    };

    const roleOptions = [
        { value: 'super_admin', label: 'Super Administrador' },
        { value: 'exchange_house', label: 'Casa de Cambio' },
        { value: 'operator', label: 'Operador' },
    ];

    const needsExchangeHouse = ['exchange_house', 'operator'].includes(data.role);

    return (
        <>
            <Head title={`Editar Usuario: ${user.name}`} />
            
            <div className="space-y-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2 text-sm">
                    <Link 
                        href="/dashboard" 
                        className="flex items-center px-2 py-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Home className="h-4 w-4 mr-1" />
                        Inicio
                    </Link>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Link 
                        href="/admin/users" 
                        className="flex items-center px-2 py-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Users className="h-4 w-4 mr-1" />
                        Usuarios
                    </Link>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="px-2 py-1 bg-black border border-gray-800 text-gray-300 rounded-md font-medium">
                        Editar Usuario
                    </span>
                </nav>

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" asChild className="h-10 w-10 p-0">
                                <Link href="/admin/users">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                                    Editar Usuario
                                </h1>
                                <p className="text-muted-foreground text-lg">
                                    {user.name} ({user.email})
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Shield className="h-4 w-4" />
                            Modificar información y permisos del usuario
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/admin/users">
                                Cancelar
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Alert */}
                <div className="flex items-center gap-3 p-4 bg-black border border-yellow-800 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div>
                        <p className="text-sm font-medium text-yellow-200">
                            Edición de Usuario
                        </p>
                        <p className="text-sm text-yellow-300">
                            Deja la contraseña en blanco si no deseas cambiarla.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Información Personal */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Información Personal
                                </CardTitle>
                                <CardDescription>
                                    Datos básicos del usuario
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre Completo *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={errors.name ? 'border-red-500' : ''}
                                            placeholder="Ej: Juan Pérez"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-500">{errors.name}</p>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={errors.email ? 'border-red-500' : ''}
                                            placeholder="usuario@ejemplo.com"
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-500">{errors.email}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Credenciales */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cambiar Contraseña (Opcional)</CardTitle>
                                <CardDescription>
                                    Deja en blanco para mantener la contraseña actual
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Nueva Contraseña</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={errors.password ? 'border-red-500' : ''}
                                        placeholder="Dejar en blanco para no cambiar"
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-500">{errors.password}</p>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirmar Nueva Contraseña</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={errors.password_confirmation ? 'border-red-500' : ''}
                                        placeholder="Confirmar nueva contraseña"
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rol y Permisos */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Rol y Permisos</CardTitle>
                                <CardDescription>
                                    Define el nivel de acceso del usuario
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="role">Rol *</Label>
                                    <select
                                        id="role"
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.role ? 'border-red-500' : ''}`}
                                    >
                                        <option value="">Seleccionar rol</option>
                                        {roleOptions.map((role) => (
                                            <option key={role.value} value={role.value}>
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.role && (
                                        <p className="text-sm text-red-500">{errors.role}</p>
                                    )}
                                </div>
                                
                                {needsExchangeHouse && (
                                    <div className="space-y-2">
                                        <Label htmlFor="exchange_house_id">Casa de Cambio *</Label>
                                        <select
                                            id="exchange_house_id"
                                            value={data.exchange_house_id}
                                            onChange={(e) => setData('exchange_house_id', e.target.value)}
                                            className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.exchange_house_id ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Seleccionar casa de cambio</option>
                                            {exchangeHouses.map((house) => (
                                                <option key={house.id} value={house.id.toString()}>
                                                    {house.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.exchange_house_id && (
                                            <p className="text-sm text-red-500">{errors.exchange_house_id}</p>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="is_active" className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        Usuario Activo
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Los usuarios inactivos no pueden iniciar sesión
                                    </p>
                                </div>

                                {data.role && (
                                    <div className="p-3 bg-black border border-gray-800 rounded-lg">
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                            Permisos del rol seleccionado:
                                        </p>
                                        <p className="text-sm">
                                            {data.role === 'super_admin' && 'Control total de la plataforma, gestión de casas de cambio y usuarios'}
                                            {data.role === 'exchange_house' && 'Gestión de su casa de cambio, usuarios y órdenes'}
                                            {data.role === 'operator' && 'Operación de órdenes dentro de su casa de cambio'}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t">
                        <Button variant="outline" asChild>
                            <Link href="/admin/users">
                                Cancelar
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

EditUser.layout = (page: React.ReactElement) => (
    <KuberafiLayout>{page}</KuberafiLayout>
);

export default EditUser;
