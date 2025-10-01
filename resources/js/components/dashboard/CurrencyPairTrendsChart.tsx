import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface RateTrend {
  date: string;
  rate: number;
  margin: number;
}

interface CurrencyPairTrends {
  [pairSymbol: string]: RateTrend[];
}

export function CurrencyPairTrendsChart() {
  const [trends, setTrends] = useState<CurrencyPairTrends>({});
  const [loading, setLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState<string>('');

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    try {
      const response = await axios.get('/analytics/currency-pair-trends', {
        params: { days: 30 }
      });
      const data = response.data;
      setTrends(data);
      
      // Seleccionar el primer par por defecto
      const firstPair = Object.keys(data)[0];
      if (firstPair) {
        setSelectedPair(firstPair);
      }
    } catch (error) {
      console.error('Error loading trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = selectedPair && trends[selectedPair] ? trends[selectedPair] : [];
  const pairNames = Object.keys(trends);

  return (
    <Card className="bg-black border-2 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Evolución de Tasas de Cambio
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              Últimos 30 días - Análisis de tendencia por par
            </CardDescription>
          </div>
          <select
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            {pairNames.map((pair) => (
              <option key={pair} value={pair}>
                {pair}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-gray-400">Cargando tendencias...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-gray-400">No hay datos disponibles para este par</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.95)', 
                  border: '1px solid #475569', 
                  borderRadius: '8px',
                  padding: '12px'
                }}
                labelStyle={{ color: '#ffffff', fontWeight: '600' }}
                itemStyle={{ color: '#3b82f6' }}
                formatter={(value: any) => [`${parseFloat(value).toFixed(6)}`, 'Tasa']}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '16px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#60a5fa' }}
                name="Tasa Efectiva"
              />
              <Line 
                type="monotone" 
                dataKey="margin" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                name="Margen %"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
