import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Target,
  Award,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';

interface Stats {
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  cancelled_orders: number;
  total_volume: number;
  completed_volume: number;
  total_commission: number;
  avg_commission_per_order: number;
  avg_order_value: number;
  conversion_rate: number;
  unique_customers: number;
}

interface Customer {
  id: number;
  name: string;
  orders_count: number;
  total_volume: number;
}

interface Ranking {
  position: number;
  total_operators: number;
  rankings: Array<{
    user_id: number;
    name: string;
    total_orders: number;
    total_volume: number;
    total_commission: number;
  }>;
}

interface DailyData {
  date: string;
  orders: number;
  volume: number;
  commission: number;
}

interface StatusData {
  status: string;
  count: number;
  volume: number;
}

interface Goals {
  orders: number;
  volume: number;
  commission: number;
}

interface Props {
  currentStats: Stats;
  previousStats: Stats;
  changes: Record<string, number>;
  ranking: Ranking | null;
  dailyEvolution: DailyData[];
  topCustomers: Customer[];
  statusDistribution: StatusData[];
  goals: Goals;
  period: string;
}

function Performance({ 
  currentStats, 
  changes, 
  ranking, 
  topCustomers, 
  statusDistribution,
  goals,
  period 
}: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    router.get('/my-performance', { period: newPeriod }, {
      preserveState: true,
    });
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getPeriodLabel = (p: string) => {
    const labels: Record<string, string> = {
      today: 'Hoy',
      week: 'Esta Semana',
      month: 'Este Mes',
      quarter: 'Este Trimestre',
      year: 'Este Año',
    };
    return labels[p] || labels.month;
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <>
      <Head title="Mi Rendimiento" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mi Rendimiento</h1>
            <p className="text-muted-foreground">
              Estadísticas de desempeño y métricas personales
            </p>
          </div>
          
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Año</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ranking */}
        {ranking && (
          <Card className="border-yellow-500 bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-yellow-500" />
                  <div>
                    <CardTitle className="text-2xl">
                      Posición #{ranking.position} de {ranking.total_operators}
                    </CardTitle>
                    <CardDescription>
                      Ranking de operadores en {getPeriodLabel(selectedPeriod).toLowerCase()}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Stats Cards con Comparación */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Órdenes Completadas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStats.completed_orders}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {getChangeIcon(changes.completed_orders)}
                <span className={getChangeColor(changes.completed_orders)}>
                  {Math.abs(changes.completed_orders).toFixed(1)}% vs período anterior
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volumen Operado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${currentStats.completed_volume.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {getChangeIcon(changes.completed_volume)}
                <span className={getChangeColor(changes.completed_volume)}>
                  {Math.abs(changes.completed_volume).toFixed(1)}% vs período anterior
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comisiones Ganadas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                ${currentStats.total_commission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {getChangeIcon(changes.total_commission)}
                <span className={getChangeColor(changes.total_commission)}>
                  {Math.abs(changes.total_commission).toFixed(1)}% vs período anterior
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentStats.conversion_rate.toFixed(1)}%
              </div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {getChangeIcon(changes.conversion_rate)}
                <span className={getChangeColor(changes.conversion_rate)}>
                  {Math.abs(changes.conversion_rate).toFixed(1)}% vs período anterior
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metas y Progreso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Metas de {getPeriodLabel(selectedPeriod)}
            </CardTitle>
            <CardDescription>
              Progreso hacia tus objetivos del período
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Órdenes Completadas</span>
                <span className="text-sm text-muted-foreground">
                  {currentStats.completed_orders} / {goals.orders}
                </span>
              </div>
              <Progress value={calculateProgress(currentStats.completed_orders, goals.orders)} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Volumen Operado</span>
                <span className="text-sm text-muted-foreground">
                  ${currentStats.completed_volume.toLocaleString('en-US', { maximumFractionDigits: 0 })} / ${goals.volume.toLocaleString('en-US')}
                </span>
              </div>
              <Progress value={calculateProgress(currentStats.completed_volume, goals.volume)} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Comisiones</span>
                <span className="text-sm text-muted-foreground">
                  ${currentStats.total_commission.toLocaleString('en-US', { minimumFractionDigits: 2 })} / ${goals.commission.toLocaleString('en-US')}
                </span>
              </div>
              <Progress value={calculateProgress(currentStats.total_commission, goals.commission)} />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Top Clientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Clientes
              </CardTitle>
              <CardDescription>
                Clientes con mayor volumen en {getPeriodLabel(selectedPeriod).toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topCustomers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay datos de clientes en este período
                </p>
              ) : (
                <div className="space-y-3">
                  {topCustomers.map((customer, index) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {customer.orders_count} orden(es)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ${parseFloat(customer.total_volume.toString()).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribución por Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Órdenes</CardTitle>
              <CardDescription>
                Por estado en {getPeriodLabel(selectedPeriod).toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statusDistribution.map((item) => {
                  const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
                    completed: { icon: CheckCircle, color: 'text-green-500', label: 'Completadas' },
                    pending: { icon: Clock, color: 'text-yellow-500', label: 'Pendientes' },
                    cancelled: { icon: XCircle, color: 'text-gray-500', label: 'Canceladas' },
                    processing: { icon: TrendingUp, color: 'text-blue-500', label: 'Procesando' },
                    failed: { icon: XCircle, color: 'text-red-500', label: 'Fallidas' },
                  };

                  const config = statusConfig[item.status] || statusConfig.completed;
                  const Icon = config.icon;
                  const percentage = (item.count / currentStats.total_orders) * 100;

                  return (
                    <div key={item.status} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${config.color}`} />
                        <div>
                          <p className="font-medium">{config.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}% del total
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{item.count}</p>
                        <p className="text-xs text-muted-foreground">
                          ${parseFloat(item.volume.toString()).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas Adicionales */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Promedio por Orden</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${currentStats.avg_order_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comisión Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${currentStats.avg_commission_per_order.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentStats.unique_customers}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

Performance.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default Performance;
