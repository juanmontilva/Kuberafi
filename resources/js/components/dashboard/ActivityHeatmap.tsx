import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface HeatmapCell {
  day: string;
  hour: string;
  operations: number;
  volume: number;
}

export function ActivityHeatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHeatmap();
  }, []);

  const loadHeatmap = async () => {
    try {
      const response = await axios.get('/analytics/activity-heatmap', {
        params: { days: 30 }
      });
      setHeatmapData(response.data);
    } catch (error) {
      console.error('Error loading heatmap:', error);
    } finally {
      setLoading(false);
    }
  };

  // Organizar datos en matriz [día][hora]
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  const matrix = days.map(day => {
    return hours.map(hour => {
      const cell = heatmapData.find(d => d.day === day && d.hour === hour);
      return cell ? cell.operations : 0;
    });
  });

  // Encontrar el máximo para normalizar colores
  const maxOperations = Math.max(...heatmapData.map(d => d.operations), 1);

  const getColor = (value: number) => {
    if (value === 0) return 'bg-slate-800/30';
    const intensity = value / maxOperations;
    if (intensity > 0.75) return 'bg-emerald-500';
    if (intensity > 0.5) return 'bg-emerald-600';
    if (intensity > 0.25) return 'bg-emerald-700';
    return 'bg-emerald-800';
  };

  return (
    <Card className="bg-black border-2 border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-400" />
          Mapa de Calor de Actividad
        </CardTitle>
        <CardDescription className="text-gray-400 text-sm">
          Distribución de operaciones por día y hora (últimos 30 días)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-gray-400">Cargando mapa de calor...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Header con horas */}
              <div className="flex mb-2">
                <div className="w-16"></div>
                {[0, 4, 8, 12, 16, 20].map(hour => (
                  <div key={hour} className="flex-1 text-center text-xs text-gray-500" style={{ minWidth: '40px' }}>
                    {String(hour).padStart(2, '0')}h
                  </div>
                ))}
              </div>

              {/* Matriz de días y horas */}
              {days.map((day, dayIndex) => (
                <div key={day} className="flex items-center mb-1">
                  <div className="w-16 text-xs text-gray-400 font-medium">{day}</div>
                  <div className="flex-1 flex gap-1">
                    {matrix[dayIndex].map((operations, hourIndex) => {
                      const cell = heatmapData.find(
                        d => d.day === day && d.hour === hours[hourIndex]
                      );
                      return (
                        <div
                          key={hourIndex}
                          className={`flex-1 h-8 rounded ${getColor(operations)} transition-all hover:scale-110 cursor-pointer group relative`}
                          style={{ minWidth: '12px' }}
                          title={`${day} ${hours[hourIndex]}: ${operations} operaciones`}
                        >
                          {/* Tooltip on hover */}
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black border border-slate-700 rounded text-xs whitespace-nowrap pointer-events-none z-10 transition-opacity">
                            <div className="text-white font-semibold">{operations} ops</div>
                            {cell && (
                              <div className="text-gray-400">${cell.volume.toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Leyenda */}
              <div className="flex items-center gap-4 mt-4 justify-center">
                <span className="text-xs text-gray-500">Menos</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded bg-slate-800/30"></div>
                  <div className="w-4 h-4 rounded bg-emerald-800"></div>
                  <div className="w-4 h-4 rounded bg-emerald-700"></div>
                  <div className="w-4 h-4 rounded bg-emerald-600"></div>
                  <div className="w-4 h-4 rounded bg-emerald-500"></div>
                </div>
                <span className="text-xs text-gray-500">Más</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
