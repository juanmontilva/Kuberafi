import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  User,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface RateHistoryItem {
  id: number;
  rate: string;
  effective_rate: string;
  margin_percent: string;
  valid_from: string;
  valid_until: string | null;
  is_current: boolean;
  changed_by: {
    id: number;
    name: string;
  } | null;
  change_reason: string;
  notes: string | null;
}

interface ChartDataItem {
  date: string;
  dateShort: string;
  rate: number;
  effectiveRate: number;
  margin: number;
}

interface ComparisonData {
  current: {
    rate: string;
    effective_rate: string;
    valid_from: string;
  };
  comparisons: {
    yesterday: {
      rate: string | null;
      change_percent: number | null;
    };
    last_week: {
      rate: string | null;
      change_percent: number | null;
    };
    last_month: {
      rate: string | null;
      change_percent: number | null;
    };
  };
}

interface Props {
  currencyPairId: number;
  symbol: string;
  open: boolean;
  onClose: () => void;
}

export function CurrencyPairRateHistory({ currencyPairId, symbol, open, onClose }: Props) {
  const [history, setHistory] = useState<RateHistoryItem[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    current_rate: 0,
    highest_rate: 0,
    lowest_rate: 0,
    average_rate: 0,
    total_changes: 0,
  });
  const [fullscreen, setFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const dialogClasses = fullscreen
    ? 'bg-black border-2 border-slate-700 p-0 !max-w-none w-screen h-screen m-0 rounded-none'
    : 'bg-black border-2 border-slate-700 p-0 max-w-[95vw] w-full md:max-w-[85vw] lg:max-w-[1100px] max-h-[90vh]';

  useEffect(() => {
    if (open && currencyPairId) {
      fetchData();
      setCurrentPage(1); // Reset to page 1 when changing period
    }
  }, [open, currencyPairId, period]);

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = history.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    const tableElement = document.querySelector('[data-table="history"]');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch history
      const historyResponse = await fetch(`/currency-pairs/${currencyPairId}/rate-history?period=${period}`);
      const historyData = await historyResponse.json();
      
      setHistory(historyData.history.data || []);
      setStats(historyData.stats || {});

      // Fetch chart data
      const chartResponse = await fetch(`/currency-pairs/${currencyPairId}/rate-history/chart?period=${period}`);
      const chartResult = await chartResponse.json();
      setChartData(chartResult.data || []);

      // Fetch comparison
      const comparisonResponse = await fetch(`/currency-pairs/${currencyPairId}/rate-history/comparison`);
      const comparisonData = await comparisonResponse.json();
      setComparison(comparisonData);
    } catch (error) {
      console.error('Error fetching rate history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderChangePercent = (percent: number | null) => {
    if (percent === null) return <span className="text-gray-500">N/A</span>;
    
    const isPositive = percent >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        <span className="font-semibold">{Math.abs(percent).toFixed(2)}%</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={dialogClasses} onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        <style>{`
          [data-slot="dialog-content"] > button[class*="absolute"] {
            display: none !important;
          }
        `}</style>
        <div className={`flex flex-col ${fullscreen ? 'h-screen' : 'max-h-[90vh]'}`}>
          <DialogHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                  Historial de Tasas - {symbol}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-gray-400 mt-1 hidden sm:block">
                  Evolución y cambios históricos de tus tasas de cambio
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg" 
                  onClick={() => setFullscreen(v => !v)} 
                  title={fullscreen ? 'Ventana normal' : 'Pantalla completa'}
                >
                  {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg" 
                  onClick={onClose}
                  title="Cerrar"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4">
              <div className="space-y-4 sm:space-y-6">
            {/* Filtros de Período */}
            <div className="flex gap-2">
              <Button
                variant={period === '7' ? 'default' : 'outline'}
                onClick={() => setPeriod('7')}
                className={period === '7' ? 'bg-blue-600' : 'border-slate-700 text-white'}
                size="sm"
              >
                7d
              </Button>
              <Button
                variant={period === '30' ? 'default' : 'outline'}
                onClick={() => setPeriod('30')}
                className={period === '30' ? 'bg-blue-600' : 'border-slate-700 text-white'}
                size="sm"
              >
                30d
              </Button>
              <Button
                variant={period === '90' ? 'default' : 'outline'}
                onClick={() => setPeriod('90')}
                className={period === '90' ? 'bg-blue-600' : 'border-slate-700 text-white'}
                size="sm"
              >
                90d
              </Button>
            </div>

            {/* Cards de Comparación */}
            {comparison && comparison.current && (
              <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
                <Card className="bg-black border-2 border-blue-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Tasa Actual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-white break-words">
                      {comparison.current?.rate ? parseFloat(comparison.current.rate).toFixed(4) : 'N/A'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Efectiva: {comparison.current?.effective_rate ? parseFloat(comparison.current.effective_rate).toFixed(4) : 'N/A'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-black border-2 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">vs Ayer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-white">
                      {comparison.comparisons.yesterday.rate || 'N/A'}
                    </div>
                    {renderChangePercent(comparison.comparisons.yesterday.change_percent)}
                  </CardContent>
                </Card>

                <Card className="bg-black border-2 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">vs Última Semana</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-white">
                      {comparison.comparisons.last_week.rate || 'N/A'}
                    </div>
                    {renderChangePercent(comparison.comparisons.last_week.change_percent)}
                  </CardContent>
                </Card>

                <Card className="bg-black border-2 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">vs Último Mes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-white">
                      {comparison.comparisons.last_month.rate || 'N/A'}
                    </div>
                    {renderChangePercent(comparison.comparisons.last_month.change_percent)}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Gráfica de Evolución */}
            <Card className="bg-gradient-to-b from-slate-900 to-black border-2 border-slate-700/50 shadow-xl relative z-10">
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                      Evolución de Tasas
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-xs sm:text-sm">
                      Últimos {period} días • Actualizado en tiempo real
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="bg-transparent pb-2 sm:pb-4">
                <ResponsiveContainer width="100%" height={200} className="sm:!h-[300px]">
                  <AreaChart data={chartData} style={{ backgroundColor: 'transparent' }} margin={{ top: 10, right: 15, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorEffective" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="50%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.05}/>
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                    <XAxis 
                      dataKey="dateShort" 
                      stroke="#6b7280" 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      domain={['dataMin - 5', 'dataMax + 5']} 
                      tickFormatter={(v: number) => v.toFixed(2)}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <Tooltip 
                      cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '5 5' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.95)', 
                        border: '1px solid #475569', 
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(10px)'
                      }}
                      itemStyle={{ 
                        color: '#ffffff', 
                        fontSize: '13px',
                        padding: '4px 0'
                      }}
                      labelStyle={{ 
                        color: '#ffffff', 
                        fontWeight: '600',
                        marginBottom: '8px',
                        fontSize: '14px'
                      }}
                      formatter={(value: any, name: any) => [
                        typeof value === 'number' ? value.toFixed(4) : parseFloat(value).toFixed(4),
                        name
                      ]}
                    />
                    <Legend 
                      iconType="circle" 
                      wrapperStyle={{ 
                        paddingTop: 12,
                        fontSize: '13px'
                      }}
                      formatter={(value) => <span className="text-gray-300">{value}</span>}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#3b82f6" 
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRate)" 
                      name="Tasa Base"
                      dot={false}
                      activeDot={{ 
                        r: 6, 
                        fill: '#3b82f6',
                        stroke: '#1e40af',
                        strokeWidth: 2,
                        filter: 'url(#glow)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="effectiveRate" 
                      stroke="#10b981" 
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorEffective)" 
                      name="Tasa Efectiva"
                      dot={false}
                      activeDot={{ 
                        r: 6, 
                        fill: '#10b981',
                        stroke: '#047857',
                        strokeWidth: 2,
                        filter: 'url(#glow)'
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tabla de Historial */}
            <Card className="bg-black border-2 border-slate-700/50 relative z-10" data-table="history">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-white text-base sm:text-lg">Historial Detallado</CardTitle>
                <CardDescription className="text-gray-400 text-xs sm:text-sm">
                  {stats.total_changes} cambios registrados
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 bg-slate-900/50">
                        <th className="text-left py-2 px-3 font-medium text-gray-400 whitespace-nowrap">Fecha</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-400 whitespace-nowrap">Tasa Base</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-400 whitespace-nowrap">Margen</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-400 whitespace-nowrap">Tasa Efectiva</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-400 whitespace-nowrap">Usuario</th>
                        <th className="text-center py-2 px-3 font-medium text-gray-400 whitespace-nowrap">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-500">
                            No hay historial disponible
                          </td>
                        </tr>
                      ) : (
                        currentItems.map((item) => (
                          <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-900/30">
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1 text-white whitespace-nowrap">
                                <Clock className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                <span className="text-xs">{formatDate(item.valid_from)}</span>
                              </div>
                            </td>
                            <td className="text-right py-2 px-3">
                              <span className="font-mono font-semibold text-blue-400 whitespace-nowrap">
                                {parseFloat(item.rate).toFixed(4)}
                              </span>
                            </td>
                            <td className="text-right py-2 px-3">
                              <span className="text-purple-400 whitespace-nowrap">
                                {parseFloat(item.margin_percent).toFixed(2)}%
                              </span>
                            </td>
                            <td className="text-right py-2 px-3">
                              <span className="font-mono font-semibold text-emerald-400 whitespace-nowrap">
                                {parseFloat(item.effective_rate).toFixed(4)}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                <span className="text-gray-300 text-xs truncate max-w-[120px]" title={item.changed_by?.name || 'Sistema'}>
                                  {item.changed_by?.name || 'Sistema'}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center">
                              {item.is_current ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs px-2 py-0.5">
                                  Actual
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/30 text-xs px-2 py-0.5">
                                  Histórico
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  
                  {/* Paginación Desktop */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between py-4 px-4 border-t border-slate-800">
                      <div className="text-sm text-gray-400">
                        Mostrando {startIndex + 1} - {Math.min(endIndex, history.length)} de {history.length}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="border-slate-700 text-gray-300 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Anterior
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first, last, current, and adjacent pages
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <Button
                                  key={page}
                                  variant={page === currentPage ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => goToPage(page)}
                                  className={page === currentPage 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 min-w-[32px]' 
                                    : 'border-slate-700 text-gray-300 hover:text-white hover:bg-slate-800 min-w-[32px]'
                                  }
                                >
                                  {page}
                                </Button>
                              );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                              return <span key={page} className="text-gray-500">...</span>;
                            }
                            return null;
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="border-slate-700 text-gray-300 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Siguiente
                          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3 p-3">
                  {history.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No hay historial disponible
                    </div>
                  ) : (
                    currentItems.map((item) => (
                      <div key={item.id} className="bg-slate-900/30 border border-slate-700 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            {formatDate(item.valid_from)}
                          </div>
                          {item.is_current ? (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                              Actual
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/30 text-xs">
                              Histórico
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Tasa Base</span>
                            <div className="font-mono font-semibold text-blue-400">
                              {parseFloat(item.rate).toFixed(4)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Margen</span>
                            <div className="text-purple-400 font-semibold">
                              {parseFloat(item.margin_percent).toFixed(2)}%
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Tasa Efectiva</span>
                            <div className="font-mono font-semibold text-emerald-400">
                              {parseFloat(item.effective_rate).toFixed(4)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Usuario</span>
                            <div className="text-gray-300 truncate">
                              {item.changed_by?.name || 'Sistema'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {/* Paginación Mobile */}
                  {totalPages > 1 && (
                    <div className="flex flex-col gap-3 pt-3 border-t border-slate-800">
                      <div className="text-xs text-center text-gray-400">
                        Página {currentPage} de {totalPages} • {history.length} cambios
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="border-slate-700 text-gray-300 hover:text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </Button>
                        
                        <span className="text-sm text-white font-medium min-w-[60px] text-center">
                          {currentPage} / {totalPages}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="border-slate-700 text-gray-300 hover:text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4 relative z-0">
              <Card className="bg-black border-2 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-gray-400">Tasa Máxima</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-emerald-400">
                    {stats.highest_rate ? parseFloat(stats.highest_rate.toString()).toFixed(4) : 'N/A'}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border-2 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-gray-400">Tasa Mínima</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-red-400">
                    {stats.lowest_rate ? parseFloat(stats.lowest_rate.toString()).toFixed(4) : 'N/A'}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border-2 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-gray-400">Tasa Promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-blue-400">
                    {stats.average_rate ? parseFloat(stats.average_rate.toString()).toFixed(4) : 'N/A'}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border-2 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-gray-400">Total Cambios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-purple-400">
                    {stats.total_changes}
                  </div>
                </CardContent>
              </Card>
            </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
