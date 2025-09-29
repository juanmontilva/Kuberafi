import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { useState } from 'react';
import { 
  DollarSign,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  AlertCircle,
  Percent
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

function CurrencyPairs({ activePairs, availablePairs, exchangeHouse, platformCommissionRate }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPair, setSelectedPair] = useState<CurrencyPair | null>(null);
  const [editingPair, setEditingPair] = useState<CurrencyPair | null>(null);
  const [formData, setFormData] = useState({
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
        setFormData({ margin_percent: '', min_amount: '', max_amount: '' });
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
    if (confirm(`¿Eliminar la configuración del par ${pair.symbol}?`)) {
      router.delete(`/currency-pairs/${pair.id}`);
    }
  };

  const startAdd = (pair: CurrencyPair) => {
    setSelectedPair(pair);
    setFormData({
      margin_percent: '',
      min_amount: pair.min_amount || '',
      max_amount: pair.max_amount || '',
    });
    setShowAddForm(true);
  };

  const startEdit = (pair: CurrencyPair) => {
    setEditingPair(pair);
    setFormData({
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comisión Plataforma</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformCommissionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Por cada operación
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-950 border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-blue-100">
                  <span className="font-semibold">Margen de ganancia:</span> Define tu porcentaje de ganancia sobre la tasa base del par.
                </p>
                <p className="text-sm text-blue-100">
                  <span className="font-semibold">Cálculo final:</span> Tasa Base × (1 + Tu Margen%) = Tasa que cobrarás al cliente
                </p>
                <p className="text-sm text-blue-100">
                  <span className="font-semibold">Nota:</span> La plataforma cobra {platformCommissionRate}% adicional sobre el monto de la operación
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                      onChange={(e) => setFormData({...formData, margin_percent: e.target.value})}
                      placeholder="2.50"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tasa efectiva: {formData.margin_percent ? calculateEffectiveRate(selectedPair.current_rate, formData.margin_percent) : '-'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Monto Mínimo</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.min_amount}
                        onChange={(e) => setFormData({...formData, min_amount: e.target.value})}
                        placeholder={selectedPair.min_amount}
                      />
                    </div>
                    <div>
                      <Label>Monto Máximo</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.max_amount}
                        onChange={(e) => setFormData({...formData, max_amount: e.target.value})}
                        placeholder={selectedPair.max_amount || '100000'}
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-green-950 border border-green-800 rounded-lg text-sm">
                    <p className="text-green-100">
                      Ejemplo: Con margen del {formData.margin_percent || '0'}%, en una operación de $1000:
                    </p>
                    <p className="text-green-400 font-semibold mt-1">
                      Tu ganancia: ${calculateProfit('1000', formData.margin_percent || '0')}
                    </p>
                  </div>
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
                  <div>
                    <Label>Margen de Ganancia (%)*</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.margin_percent}
                      onChange={(e) => setFormData({...formData, margin_percent: e.target.value})}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tasa efectiva: {calculateEffectiveRate(editingPair.current_rate, formData.margin_percent)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Monto Mínimo</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.min_amount}
                        onChange={(e) => setFormData({...formData, min_amount: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Monto Máximo</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.max_amount}
                        onChange={(e) => setFormData({...formData, max_amount: e.target.value})}
                      />
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
      </div>
    </>
  );
}

CurrencyPairs.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default CurrencyPairs;
