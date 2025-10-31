import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { CurrencyPairRateHistory } from '@/components/CurrencyPairRateHistory';
import { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  AlertCircle,
  Percent,
  History
} from 'lucide-react';

interface CurrencyPair {
  id: number;
  base_currency: string;
  quote_currency: string;
  symbol: string;
  current_rate: string;
  min_amount: string;
  max_amount: string;
  is_active: boolean;
  pivot?: {
    margin_percent: string;
    min_amount: string;
    max_amount: string;
    is_active: boolean;
  };
}

interface ExchangeHouse {
  id: number;
  name: string;
  commission_rate: string;
}

interface Props {
  activePairs: CurrencyPair[];
  availablePairs: CurrencyPair[];
  exchangeHouse: ExchangeHouse;
  platformCommissionRate: number;
}

function CurrencyPairs({ activePairs, availablePairs, platformCommissionRate }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPair, setSelectedPair] = useState<CurrencyPair | null>(null);
  const [editingPair, setEditingPair] = useState<CurrencyPair | null>(null);
  const [historyPair, setHistoryPair] = useState<{ id: number; symbol: string } | null>(null);
  const [formData, setFormData] = useState({
    current_rate: '',
    margin_percent: '',
    min_amount: '',
    max_amount: '',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPair) return;

    router.post(`/currency-pairs/${selectedPair.id}/attach`, formData, {
      onSuccess: () => {
        setShowAddForm(false);
        setSelectedPair(null);
        setFormData({ current_rate: '', margin_percent: '', min_amount: '', max_amount: '' });
      }
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPair) return;

    router.put(`/currency-pairs/${editingPair.id}`, formData, {
      onSuccess: () => setEditingPair(null)
    });
  };

  const handleToggle = (pair: CurrencyPair) => {
    router.post(`/currency-pairs/${pair.id}/toggle`, {}, {
      preserveScroll: true,
    });
  };

  const handleDetach = (pair: CurrencyPair) => {
    if (confirm(`¿Eliminar la configuración del par ${pair.symbol}? Los datos históricos se mantendrán.`)) {
      router.delete(`/currency-pairs/${pair.id}/detach`, {}, {
        preserveScroll: true,
      });
    }
  };

  const startAdd = (pair: CurrencyPair) => {
    setSelectedPair(pair);
    setFormData({
      current_rate: pair.current_rate || '',
      margin_percent: '',
      min_amount: pair.min_amount || '',
      max_amount: pair.max_amount || '',
    });
    setShowAddForm(true);
  };

  const startEdit = (pair: CurrencyPair) => {
    setEditingPair(pair);
    setFormData({
      current_rate: pair.current_rate || '',
      margin_percent: pair.pivot?.margin_percent || '',
      min_amount: pair.pivot?.min_amount || '',
      max_amount: pair.pivot?.max_amount || '',
    });
  };

  const calculateEffectiveRate = (baseRate: string, marginPercent: string) => {
    const rate = parseFloat(baseRate);
    const margin = parseFloat(marginPercent);
    return (rate * (1 + margin / 100)).toFixed(6);
  };

  const calculateProfit = (amount: string, marginPercent: string) => {
    const amt = parseFloat(amount);
    const margin = parseFloat(marginPercent);
    return ((amt * margin) / 100).toFixed(2);
  };

  return (
    <>
      <Head title="Mis Pares de Divisas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Pares de Divisas</h1>
          <p className="text-muted-foreground">
            Configura los pares que usarás y define tus márgenes de ganancia
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pares Activos</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {activePairs.filter(p => p.pivot?.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground">
                De {activePairs.length} configurados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availablePairs.length}</div>
              <p className="text-xs text-muted-foreground">
                Pares sin configurar
              </p>
            </CardContent>
          </Card>
          {platformCommissionRate === 0 ? (
            <Card className="relative overflow-hidden border border-purple-500/20 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 shadow-lg shadow-purple-500/20">
              <div className="absolute inset-0 bg-black/60"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-xs font-medium text-gray-400">Comisión Plataforma</CardTitle>
                <div className="h-6 w-6 rounded-lg bg-white/5 flex items-center justify-center">
                  <Percent className="h-3 w-3 text-white/70" />
                </div>
              </CardHeader>
              <CardContent className="relative pb-4">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    {platformCommissionRate}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs">🎉</span>
                  <span className="text-xs font-medium text-white/80">
                    Promoción Activa
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="relative overflow-hidden border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Comisión Plataforma</CardTitle>
                <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                  <Percent className="h-4 w-4 text-gray-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">
                  {platformCommissionRate}%
                </div>
                <p className="text-xs text-gray-500">
                  Por cada operación
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info Card */}
        {platformCommissionRate === 0 ? (
          <Card className="relative overflow-hidden border border-purple-500/10 bg-gradient-to-br from-purple-950/80 via-purple-900/80 to-purple-950/80">
            <div className="absolute inset-0 bg-black/50"></div>
            <CardContent className="pt-4 pb-4 relative">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-600/80 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-6 bg-purple-500/50 rounded-full"></div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Cómo funciona</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    <span className="font-semibold text-gray-300">Margen de ganancia:</span> Define tu porcentaje de ganancia sobre la tasa base del par.
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    <span className="font-semibold text-gray-300">Cálculo final:</span> Tasa Base × (1 + Tu Margen%) = Tasa que cobrarás al cliente
                  </p>
                  <div className="relative mt-3 p-3 rounded-lg bg-purple-900/40 border border-purple-500/20">
                    <div className="flex items-start gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shrink-0 shadow-md">
                        <span className="text-xs">💰</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        <span className="font-bold text-purple-400">Promoción Especial:</span> ¡No pagas comisión a la plataforma! Te quedas con el 100% de tu margen de ganancia.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-1 w-12 bg-gray-700 rounded-full"></div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cómo funciona</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <span className="font-semibold text-white">Margen de ganancia:</span> Define tu porcentaje de ganancia sobre la tasa base del par.
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <span className="font-semibold text-white">Cálculo final:</span> Tasa Base × (1 + Tu Margen%) = Tasa que cobrarás al cliente
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    <span className="font-semibold text-gray-300">Nota:</span> La plataforma cobra {platformCommissionRate}% adicional sobre el monto de la operación
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Pairs */}
        {activePairs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Mis Pares Configurados</CardTitle>
              <CardDescription>
                Pares que tienes activos con tus márgenes personalizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activePairs.map((pair) => (
                  <div key={pair.id} className="p-4 rounded-lg bg-black border border-gray-800 hover:bg-gray-900">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{pair.symbol}</h3>
                        <Badge className={pair.pivot?.is_active ? 'bg-green-600' : 'bg-gray-600'}>
                          {pair.pivot?.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setHistoryPair({ id: pair.id, symbol: pair.symbol })}
                          title="Ver historial de tasas"
                        >
                          <History className="h-4 w-4 text-blue-400" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => startEdit(pair)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleToggle(pair)}>
                          {pair.pivot?.is_active ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDetach(pair)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tasa Base</p>
                        <p className="font-semibold">{parseFloat(pair.current_rate).toFixed(6)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tu Margen</p>
                        <p className="font-semibold text-green-600">{pair.pivot?.margin_percent}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tasa Efectiva</p>
                        <p className="font-semibold text-blue-400">
                          {calculateEffectiveRate(pair.current_rate, pair.pivot?.margin_percent || '0')}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ganancia por $1000</p>
                        <p className="font-semibold text-green-600">
                          ${calculateProfit('1000', pair.pivot?.margin_percent || '0')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 pt-3 border-t border-gray-800">
                      <span>Min: ${pair.pivot?.min_amount || pair.min_amount}</span>
                      <span>Max: ${pair.pivot?.max_amount || pair.max_amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Pairs */}
        {availablePairs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pares Disponibles</CardTitle>
              <CardDescription>
                Activa nuevos pares para tu casa de cambio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {availablePairs.map((pair) => (
                  <div key={pair.id} className="flex items-center justify-between p-4 rounded-lg bg-black border border-gray-800">
                    <div>
                      <h3 className="font-semibold">{pair.symbol}</h3>
                      <p className="text-sm text-muted-foreground">
                        Tasa: {parseFloat(pair.current_rate).toFixed(6)}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => startAdd(pair)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Form Modal */}
        {showAddForm && selectedPair && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Configurar {selectedPair.symbol}</CardTitle>
                <CardDescription>Define tu margen y límites</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <Label>Margen de Ganancia (%)*</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.margin_percent}
                      onChange={(e) => setFormData({ ...formData, margin_percent: e.target.value })}
                      placeholder="2.50"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tasa efectiva: {formData.margin_percent ? calculateEffectiveRate(selectedPair.current_rate, formData.margin_percent) : '-'}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-950/50 border border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-300 mb-2">
                      📋 Límites de la plataforma para este par:
                    </p>
                    <p className="text-sm text-blue-100">
                      Mínimo: <span className="font-semibold">${selectedPair.min_amount}</span> |
                      Máximo: <span className="font-semibold">${selectedPair.max_amount || '∞'}</span>
                    </p>
                    <p className="text-xs text-blue-300 mt-1">
                      Tus límites deben estar dentro de este rango
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tu Monto Mínimo</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min={selectedPair.min_amount}
                        max={selectedPair.max_amount || undefined}
                        value={formData.min_amount}
                        onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                        placeholder={selectedPair.min_amount}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Mínimo permitido: ${selectedPair.min_amount}
                      </p>
                    </div>
                    <div>
                      <Label>Tu Monto Máximo</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min={selectedPair.min_amount}
                        max={selectedPair.max_amount || undefined}
                        value={formData.max_amount}
                        onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                        placeholder={selectedPair.max_amount || '100000'}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Máximo permitido: ${selectedPair.max_amount || '∞'}
                      </p>
                    </div>
                  </div>
                  {platformCommissionRate === 0 ? (
                    <div className="relative overflow-hidden p-3 rounded-lg bg-purple-950/80 border border-purple-500/20">
                      <div className="absolute inset-0 bg-black/40"></div>
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-7 w-7 rounded-lg bg-purple-600/80 flex items-center justify-center shadow-md shadow-purple-500/20">
                            <span className="text-xs">💰</span>
                          </div>
                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Ejemplo de ganancia</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">
                          Con margen del <span className="font-bold text-gray-300">{formData.margin_percent || '0'}%</span>, en una operación de <span className="font-bold text-gray-300">$1,000</span>:
                        </p>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-[10px] text-gray-500">Tu ganancia:</span>
                          <span className="text-xl font-bold text-green-400">
                            ${calculateProfit('1000', formData.margin_percent || '0')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 p-2 rounded-md bg-purple-900/50 border border-purple-500/20">
                          <span className="text-xs">🎉</span>
                          <span className="text-[10px] font-medium text-purple-400">
                            Con promoción: ¡100% para ti!
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-lg bg-gray-700 flex items-center justify-center">
                          <span className="text-xs">💰</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ejemplo de ganancia</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">
                        Con margen del <span className="font-bold text-white">{formData.margin_percent || '0'}%</span>, en una operación de <span className="font-bold text-white">$1,000</span>:
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-gray-400">Tu ganancia:</span>
                        <span className="text-2xl font-bold text-green-400">
                          ${calculateProfit('1000', formData.margin_percent || '0')}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button type="submit">Agregar Par</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Form Modal */}
        {editingPair && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Editar {editingPair.symbol}</CardTitle>
                <CardDescription>Actualiza tu configuración</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="p-3 bg-blue-950/50 border border-blue-800 rounded-lg">
                    <Label className="text-blue-400 font-semibold">Tasa Base del Par*</Label>
                    <Input
                      type="number"
                      step="0.00000001"
                      value={formData.current_rate}
                      onChange={(e) => setFormData({ ...formData, current_rate: e.target.value })}
                      required
                      className="mt-1 bg-black border-blue-700"
                    />
                    <p className="text-xs text-blue-300 mt-2">
                      💵 Esta es la tasa del mercado (ej: 390.00 VES por 1 USD)
                    </p>
                  </div>
                  <div>
                    <Label>Tu Margen de Ganancia (%)*</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.margin_percent}
                      onChange={(e) => setFormData({ ...formData, margin_percent: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tasa efectiva: {calculateEffectiveRate(formData.current_rate || editingPair.current_rate, formData.margin_percent)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-950/50 border border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-300 mb-2">
                      📋 Límites de la plataforma para este par:
                    </p>
                    <p className="text-sm text-blue-100">
                      Mínimo: <span className="font-semibold">${editingPair.min_amount}</span> |
                      Máximo: <span className="font-semibold">${editingPair.max_amount || '∞'}</span>
                    </p>
                    <p className="text-xs text-blue-300 mt-1">
                      Tus límites deben estar dentro de este rango
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tu Monto Mínimo</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min={editingPair.min_amount}
                        max={editingPair.max_amount || undefined}
                        value={formData.min_amount}
                        onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Mínimo permitido: ${editingPair.min_amount}
                      </p>
                    </div>
                    <div>
                      <Label>Tu Monto Máximo</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min={editingPair.min_amount}
                        max={editingPair.max_amount || undefined}
                        value={formData.max_amount}
                        onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Máximo permitido: ${editingPair.max_amount || '∞'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Actualizar</Button>
                    <Button type="button" variant="outline" onClick={() => setEditingPair(null)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de Historial de Tasas */}
        {historyPair && (
          <CurrencyPairRateHistory
            currencyPairId={historyPair.id}
            symbol={historyPair.symbol}
            open={!!historyPair}
            onClose={() => setHistoryPair(null)}
          />
        )}
      </div>
    </>
  );
}

CurrencyPairs.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default CurrencyPairs;
