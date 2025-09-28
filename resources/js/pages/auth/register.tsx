import { login } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { Building2, Shield, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    return (
        <AuthLayout
            title="Acceso por Invitación"
            description="Kuberafi es una plataforma exclusiva para casas de cambio certificadas"
        >
            <Head title="Acceso Restringido" />
            
            <div className="space-y-6">
                <div className="text-center">
                    <Shield className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
                    <h2 className="mt-4 text-xl font-semibold">Plataforma Restringida</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        El acceso a Kuberafi está limitado a casas de cambio autorizadas
                    </p>
                </div>

                <div className="grid gap-4">
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="font-medium">Para Casas de Cambio</h3>
                            <p className="text-sm text-muted-foreground">
                                Solo empresas registradas y verificadas pueden acceder
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                        <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="font-medium">Usuarios por Invitación</h3>
                            <p className="text-sm text-muted-foreground">
                                Los administradores crean cuentas para sus operadores
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Button asChild className="w-full">
                        <Link href={login()}>
                            Iniciar Sesión
                        </Link>
                    </Button>
                    
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            ¿Eres una casa de cambio?{' '}
                            <span className="font-medium">
                                Contacta a nuestro equipo comercial
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
