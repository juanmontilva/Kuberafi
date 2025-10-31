import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// Switch component not available, using checkbox instead
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
    ArrowLeft, 
    Save, 
    Building2, 
    ChevronRight,
    Home,
    List,
    AlertCircle,
    Tag
} from 'lucide-react';
import { FormEventHandler } from 'react';

interface ExchangeHouse {
    id: number;
    name: string;
    business_name: string;
    tax_id: string;
    email: string;
    phone?: string;
    address?: string;
    commission_rate: number;
    zero_commission_promo: boolean;
    daily_limit: number;
    allowed_currencies: string[];
    is_active: boolean;
}

interface Props extends PageProps {
    exchangeHouse: ExchangeHouse;
}

function EditExchangeHouse({ exchangeHouse }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: exchangeHouse.name,
        business_name: exchangeHouse.business_name,
        tax_id: exchangeHouse.tax_id,
        email: exchangeHouse.email,
        phone: exchangeHouse.phone || '',
        address: exchangeHouse.address || '',
        commission_rate: exchangeHouse.commission_rate,
        zero_commission_promo: exchangeHouse.zero_commission_promo,
        daily_limit: exchangeHouse.daily_limit,
        allowed_currencies: exchangeHouse.allowed_currencies,
        is_active: exchangeHouse.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/exchange-houses/${exchangeHouse.id}`);
    };

    const availableCurrencies = ['USD', 'EUR', 'VES', 'COP', 'PEN', 'CLP', 'ARS'];

    const toggleCurrency = (currency: string) => {
        const currentCurrencies = [...data.allowed_currencies];
        const index = currentCurrencies.indexOf(currency);
        
        if (index > -1) {
            currentCurrencies.splice(index, 1);
        } else {
            currentCurrencies.push(currency);
        }
        
        setData('allowed_currencies', currentCurrencies);
    };

    return (
        <>
            <Head title={`Editar - ${exchangeHouse.name}`} />
            
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
                        href="/exchange-houses" 
                        className="flex items-center px-2 py-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Building2 className="h-4 w-4 mr-1" />
                        Casas de Cambio
                    </Link>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Link 
                        href={`/exchange-houses/${exchangeHouse.id}`}
                        className="flex items-center px-2 py-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        {exchangeHouse.name}
                    </Link>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                        Editar
                    </span>
                </nav>

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" asChild className="h-10 w-10 p-0">
                                <Link href={`/exchange-houses/${exchangeHouse.id}`}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                                    Editar Casa de Cambio
                                </h1>
                                <p className="text-muted-foreground text-lg">
                                    Modificar información de {exchangeHouse.name}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            Solo el Super Administrador puede gestionar casas de cambio
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="outline" asChild>
                            <Link href={`/exchange-houses/${exchangeHouse.id}`}>
                                Cancelar
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Información Básica */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Información Básica
                                </CardTitle>
                                <CardDescription>
                                    Datos principales de la casa de cambio
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre Comercial *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-500">{errors.name}</p>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="business_name">Razón Social *</Label>
                                        <Input
                                            id="business_name"
                                            value={data.business_name}
                                            onChange={(e) => setData('business_name', e.target.value)}
                                            className={errors.business_name ? 'border-red-500' : ''}
                                        />
                                        {errors.business_name && (
                                            <p className="text-sm text-red-500">{errors.business_name}</p>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="tax_id">RIF/NIT *</Label>
                                        <Input
                                            id="tax_id"
                                            value={data.tax_id}
                                            onChange={(e) => setData('tax_id', e.target.value)}
                                            className={errors.tax_id ? 'border-red-500' : ''}
                                        />
                                        {errors.tax_id && (
                                            <p className="text-sm text-red-500">{errors.tax_id}</p>
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
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-500">{errors.email}</p>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Teléfono</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className={errors.phone ? 'border-red-500' : ''}
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-red-500">{errors.phone}</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="address">Dirección</Label>
                                    <Textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className={errors.address ? 'border-red-500' : ''}
                                        rows={3}
                                    />
                                    {errors.address && (
                                        <p className="text-sm text-red-500">{errors.address}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Configuración Financiera */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuración Financiera</CardTitle>
                                <CardDescription>
                                    Comisiones y límites operativos
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="commission_rate">Tasa de Comisión (%) *</Label>
                                    <Input
                                        id="commission_rate"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={data.commission_rate}
                                        onChange={(e) => setData('commission_rate', parseFloat(e.target.value))}
                                        className={errors.commission_rate ? 'border-red-500' : ''}
                                    />
                                    {errors.commission_rate && (
                                        <p className="text-sm text-red-500">{errors.commission_rate}</p>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="daily_limit">Límite Diario (USD) *</Label>
                                    <Input
                                        id="daily_limit"
                                        type="number"
                                        min="0"
                                        value={data.daily_limit}
                                        onChange={(e) => setData('daily_limit', parseFloat(e.target.value))}
                                        className={errors.daily_limit ? 'border-red-500' : ''}
                                    />
                                    {errors.daily_limit && (
                                        <p className="text-sm text-red-500">{errors.daily_limit}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-4 border-2 border-purple-200 bg-purple-50 rounded-lg">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-purple-600" />
                                            <Label htmlFor="zero_commission_promo" className="text-base font-semibold text-purple-900">
                                                Promoción 0 Comisiones
                                            </Label>
                                        </div>
                                        <p className="text-sm text-purple-700">
                                            La casa no pagará comisión a la plataforma. Se queda con el 100% de su comisión.
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="zero_commission_promo"
                                            checked={data.zero_commission_promo}
                                            onChange={(e) => setData('zero_commission_promo', e.target.checked)}
                                            className="h-5 w-5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Estado y Monedas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Estado y Monedas</CardTitle>
                                <CardDescription>
                                    Control de acceso y monedas permitidas
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <Label htmlFor="is_active" className="text-base font-medium">
                                            Estado de la Casa de Cambio
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            {data.is_active ? 'La casa de cambio puede operar en la plataforma' : 'La casa de cambio está suspendida'}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="is_active" className="text-sm">
                                            {data.is_active ? 'Activa' : 'Inactiva'}
                                        </Label>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <Label>Monedas Permitidas *</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {availableCurrencies.map((currency) => (
                                            <div key={currency} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`currency-${currency}`}
                                                    checked={data.allowed_currencies.includes(currency)}
                                                    onChange={() => toggleCurrency(currency)}
                                                    className="rounded border-gray-300"
                                                />
                                                <Label htmlFor={`currency-${currency}`} className="text-sm">
                                                    {currency}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.allowed_currencies && (
                                        <p className="text-sm text-red-500">{errors.allowed_currencies}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t">
                        <Button variant="outline" asChild>
                            <Link href={`/exchange-houses/${exchangeHouse.id}`}>
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

EditExchangeHouse.layout = (page: React.ReactElement) => (
    <KuberafiLayout>{page}</KuberafiLayout>
);

export default EditExchangeHouse;