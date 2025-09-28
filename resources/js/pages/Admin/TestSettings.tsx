import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { useState } from 'react';

interface Props {
    currentRate: number;
}

function TestSettings({ currentRate }: Props) {
    const [rate, setRate] = useState(currentRate.toString());
    const { setData, put, processing, errors } = useForm<{
        settings: Array<{ key: string; value: string; type: string }>;
    }>({
        settings: [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log('Enviando rate:', rate);
        
        setData('settings', [{
            key: 'platform_commission_rate',
            value: rate,
            type: 'number',
        }]);

        put('/admin/settings', {
            onSuccess: () => {
                console.log('Éxito!');
                alert('Configuración actualizada exitosamente');
                window.location.reload();
            },
            onError: (errors) => {
                console.error('Errores:', errors);
                alert('Error: ' + JSON.stringify(errors));
            }
        });
    };

    return (
        <>
            <Head title="Test Settings" />
            
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Prueba de Configuración</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="rate">Comisión de Plataforma (%)</Label>
                                <Input
                                    id="rate"
                                    type="number"
                                    step="0.01"
                                    value={rate}
                                    onChange={(e) => setRate(e.target.value)}
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    Valor actual: {currentRate}%
                                </p>
                            </div>
                            
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Guardar'}
                            </Button>
                            
                            {errors && (
                                <div className="text-red-600">
                                    {JSON.stringify(errors)}
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

TestSettings.layout = (page: React.ReactElement) => (
    <KuberafiLayout>{page}</KuberafiLayout>
);

export default TestSettings;