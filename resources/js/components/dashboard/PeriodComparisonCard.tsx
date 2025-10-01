import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface PeriodData {
  orders: number;
  volume: number;
  profit: number;
}

interface Comparison {
  current: PeriodData;
  previous: PeriodData;
  growth: {
    orders: number;
    volume: number;
    profit: number;
  };
}

export function PeriodComparisonCard() {
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComparison();
  }, []);

  const loadComparison = async () => {
    try {
      const response = await axios.get('/analytics/period-comparison');
      setComparison(response.data);
    } catch (error) {
      console.error('Error loading comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-black border-2 border-slate-700/50">
        <CardContent className="p-8">
          <div className="text-center text-gray-400">Cargando comparación...</div>
        </CardContent>
      </Card>
    );
  }

  if (!comparison) {
    return null;
  }

  const metrics = [
    {
      label: 'Órdenes',
      current: comparison.current.orders,
      previous: comparison.previous.orders,
      growth: comparison.growth.orders,
      icon: TrendingUp,
      color: 'blue'
    },
    {
      label: 'Volumen',
      current: comparison.current.volume,
      previous: comparison.previous.volume,
      growth: comparison.growth.volume,
      icon: DollarSign,
      color: 'emerald',
      isCurrency: true
    },
    {
      label: 'Ganancia',
      current: comparison.current.profit,
      previous: comparison.previous.profit,
      growth: comparison.growth.profit,
      icon: Target,
      color: 'purple',
      isCurrency: true
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; text: string; border: string } } = {
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' }
    };
    return colors[color];
  };

  return (
    <Card className="bg-black border-2 border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-white text-lg">Comparación de Períodos</CardTitle>
        <CardDescription className="text-gray-400 text-sm">
          Mes actual vs mes anterior
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const colors = getColorClasses(metric.color);
            const isPositive = metric.growth >= 0;
            
            return (
              <div 
                key={metric.label}
                className={`p-4 rounded-xl bg-black border-2 ${colors.border} hover:scale-105 transition-all`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">{metric.label}</span>
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`h-4 w-4 ${colors.text}`} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {metric.isCurrency && '$'}
                      {metric.current.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Este mes</div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                    <div>
                      <div className="text-sm text-gray-400">
                        {metric.isCurrency && '$'}
                        {metric.previous.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Mes anterior</div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-400" />
                      )}
                      <span className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {Math.abs(metric.growth).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
