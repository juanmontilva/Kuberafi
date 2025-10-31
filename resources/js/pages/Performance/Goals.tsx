import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { Target, Save, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface Goal {
  period: string;
  orders_goal: number;
  volume_goal: number;
  commission_goal: number;
}

interface Props {
  goals: Record<string, Goal>;
}

function PerformanceGoals({ goals }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  const { data, setData, post, processing, reset } = useForm({
    period: 'month',
    orders_goal: goals.month?.orders_goal || 200,
    volume_goal: goals.month?.volume_goal || 100000,
    commission_goal: goals.month?.commission_goal || 5000,
  });

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const goal = goals[period as keyof typeof goals];
    setData({
      period,
      orders_goal: goal?.orders_goal || 0,
      volume_goal: goal?.volume_goal || 0,
      commission_goal: goal?.commission_goal || 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('performance-goals.update'), {
      preserveScroll: true,
      onSuccess: () => {
        // Opcional: mostrar notificación de éxito
      },
    });
  };

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      today: 'Diarias',
      week: 'Semanales',
      month: 'Mensuales',
      quarter: 'Trimestrales',
      year: 'Anuales',
    };
    return labels[period] || labels.month;
  };

  const getPeriodDescription = (period: string) => {
    const descriptions: Record<string, string> = {
      today: 'Metas que tus operadores deben alcanzar cada día',
      week: 'Metas que tus operadores deben alcanzar cada semana',
      month: 'Metas que tus operadores deben alcanzar cada mes',
      quarter: 'Metas que tus operadores deben alcanzar cada trimestre',
      year: 'Metas que tus operadores deben alcanzar cada año',
    };
    return descriptions[period] || descriptions.month;
  };

  return (
    <>
      <Head title="Configurar Metas de Rendimiento" />
      
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Metas de Rendimiento
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Configura las metas que tus operadores deben alcanzar en cada período
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Target className="h-5 w-5" />
              Configuración de Metas
            </CardTitle>
            <CardDescription className="text-sm">
              Establece objetivos realistas para motivar a tu equipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedPeriod} onValueChange={handlePeriodChange}>
              <TabsList className="w-full md:w-auto overflow-x-auto flex md:inline-flex justify-start mb-6">
                <TabsTrigger value="today" className="text-xs md:text-sm">Diarias</TabsTrigger>
                <TabsTrigger value="week" className="text-xs md:text-sm">Semanales</TabsTrigger>
                <TabsTrigger value="month" className="text-xs md:text-sm">Mensuales</TabsTrigger>
                <TabsTrigger value="quarter" className="text-xs md:text-sm">Trimestrales</TabsTrigger>
                <TabsTrigger value="year" className="text-xs md:text-sm">Anuales</TabsTrigger>
              </TabsList>

              {['today', 'week', 'month', 'quarter', 'year'].map((period) => (
                <TabsContent key={period} value={period}>
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 md:p-4">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <h3 className="text-sm md:text-base font-medium text-blue-900 dark:text-blue-100">
                            Metas {getPeriodLabel(period)}
                          </h3>
                          <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300 mt-1">
                            {getPeriodDescription(period)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="orders_goal" className="text-sm md:text-base">
                          Órdenes Completadas
                        </Label>
                        <Input
                          id="orders_goal"
                          type="number"
                          min="0"
                          value={data.orders_goal}
                          onChange={(e) => setData('orders_goal', parseInt(e.target.value) || 0)}
                          className="h-11 md:h-10 text-sm md:text-base"
                          placeholder="Ej: 200"
                        />
                        <p className="text-xs text-muted-foreground">
                          Número de órdenes a completar
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="volume_goal" className="text-sm md:text-base">
                          Volumen Operado ($)
                        </Label>
                        <Input
                          id="volume_goal"
                          type="number"
                          min="0"
                          step="0.01"
                          value={data.volume_goal}
                          onChange={(e) => setData('volume_goal', parseFloat(e.target.value) || 0)}
                          className="h-11 md:h-10 text-sm md:text-base"
                          placeholder="Ej: 100000"
                        />
                        <p className="text-xs text-muted-foreground">
                          Volumen total en dólares
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="commission_goal" className="text-sm md:text-base">
                          Comisiones Ganadas ($)
                        </Label>
                        <Input
                          id="commission_goal"
                          type="number"
                          min="0"
                          step="0.01"
                          value={data.commission_goal}
                          onChange={(e) => setData('commission_goal', parseFloat(e.target.value) || 0)}
                          className="h-11 md:h-10 text-sm md:text-base"
                          placeholder="Ej: 5000"
                        />
                        <p className="text-xs text-muted-foreground">
                          Comisiones totales esperadas
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit" 
                        disabled={processing}
                        className="w-full md:w-auto h-11 md:h-10 text-sm md:text-base"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {processing ? 'Guardando...' : 'Guardar Metas'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Tarjeta informativa */}
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-medium text-yellow-900 dark:text-yellow-100">
                  💡 Consejos para establecer metas efectivas
                </h3>
                <ul className="text-xs md:text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                  <li>Establece metas realistas basadas en el desempeño histórico</li>
                  <li>Considera la estacionalidad y tendencias del mercado</li>
                  <li>Revisa y ajusta las metas periódicamente</li>
                  <li>Comunica claramente las metas a tu equipo</li>
                  <li>Celebra cuando se alcancen los objetivos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

PerformanceGoals.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default PerformanceGoals;
