import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { useState } from 'react';
import { 
  Settings,
  TrendingUp,
  DollarSign,
  ArrowLeftRight,
  Check,
  X,
  Edit,
  Power
} from 'lucide-react';

interface CurrencyPair {
  id: number;
  symbol: string;
  base_currency: string;
  quote_currency: string;
  current_rate: string;
  calculation_type: string;
  is_active?: boolean;
  pivot?: {
    commission_model: 'percentage' | 'spread' | 'mixed';
    commission_percent?: number;
    buy_rate?: number;
    sell_rate?: number;
    margin_percent?: number;
    min_amount?: string;
    max_amount?: string;
    is_active: boolean;
  };
}

interface Props {
  configuredPairs: CurrencyPair[];
  availablePairs: CurrencyPair[];
}

export default function CurrencyPairConfig({ configuredPairs, availablePairs }: Props) {
  const [editingPair, setEditingPair] = useState<CurrencyPair | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data, setData, put, processing, errors, reset } = useForm({
    commission_model: 'percentage' as 'percentage' | 'spread' | 'mixed',
    commission_percent: '',
    buy_rate: '',
    sell_rate: '',
    min_amount: '',
    max_amount: '',
    is_active: true,
  });

  const handleEdit = (pair: CurrencyPair) => {
    setEditingPair(pair);
    setData({
      commission_model: pair.pivot?.commission_model || 'percentage',
      commission_percent: pair.pivot?.commission_percent?.toString() || '5',
      buy_rate: pair.pivot?.buy_rate?.toString() || '',
      sell_rate: pair.pivot?.sell_rate?.toString() || '',
      min_amount: pair.pivot?.min_amount || '',
      max_amount: pair.pivot?.max_amount || '',
      is_active: pair.pivot?.is_active ?? true,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPair) return;

    put(`/currency-pairs-config/${editingPair.id}`, {
      onSuccess: () => {
        setShowModal(false);
        setEditingPair(null);
        reset();
      },
    });
  };

  const handleToggle = (pair: CurrencyPair) => {
    router.post(`/currency-pairs-config/${pair.id}/toggle`);
  };

  const calculateSpread = () => {
    const buy = parseFloat(data.buy_rate);
    const sell = parseFloat(data.sell_rate);
    if (isNaN(buy) || isNaN(sell) || buy === 0) return { points: 0, percent: 0 };
    return {
      points: sell - buy,
      percent: ((sell - buy) / buy) * 100,
    };
  };

  const calculateProfit = () => {
    const baseAmount = 100; // Ejemplo con 100 unidades
    const spread = calculateSpread();
    
    switch (data.commission_model) {
      case 'percentage':
        const commissionPercent = parseFloat(data.commission_percent) || 0;
        return baseAmount * (commissionPercent / 100);
        
      case 'spread':
        return baseAmount * spread.points;
        
      case 'mixed':
        const commission = parseFloat(data.commission_percent) || 0;
        const sellRate = parseFloat(data.sell_rate) || 0;
        const spreadProfit = baseAmount * spread.points;
        const commissionProfit = (baseAmount * (commission / 100)) * sellRate;
        return spreadProfit + commissionProfit;
        
      default:
        return 0;
    }
  };

  return (
    <>
      <Head title="Configuración de Pares" />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración de Pares de Divisas</h1>
          <p className="text-muted-foreground">
            Configura el modelo de comisión para cada par de divisas
          </p>
        </div>

        {/* Pares Configurados */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Pares Configurados</CardTitle>
            <CardDescription>
              Pares activos con su modelo de comisión
            </CardDescription>
          </CardHeader>
          <CardContent>
            {configuredPairs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tienes pares configurados aún
              </div>
            ) : (
              <div className="space-y-3">
                {configuredPairs.map((pair) => (
                  <div
                    key={pair.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{pair.symbol}</h3>
                        {pair.pivot?.is_active ? (
                          <span className="px-2 py-1 text-xs bg-green-500/20 text-green-600 dark:text-green-400 rounded-full">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-600 dark:text-gray-400 rounded-full">
                            Inactivo
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        {/* Modelo */}
                        <div className="flex items-center gap-2 text-sm">
                          {pair.pivot?.commission_model === 'percentage' && (
                            <>
                              <span className="text-blue-500">📊 Porcentaje:</span>
                              <span className="font-semibold">{pair.pivot.commission_percent}%</span>
                            </>
                          )}
                          {pair.pivot?.commission_model === 'spread' && (
                            <>
                              <span className="text-green-500">💱 Spread:</span>
                              <span className="font-semibold">
                                Compra: {pair.pivot.buy_rate} | Venta: {pair.pivot.sell_rate}
                              </span>
                              <span className="text-muted-foreground">
                                ({((pair.pivot.sell_rate! - pair.pivot.buy_rate!) / pair.pivot.buy_rate! * 100).toFixed(2)}%)
                              </span>
                            </>
                          )}
                          {pair.pivot?.commission_model === 'mixed' && (
                            <>
                              <span className="text-purple-500">🔀 Mixto:</span>
                              <span className="font-semibold">
                                Spread: {pair.pivot.buy_rate}/{pair.pivot.sell_rate} + {pair.pivot.commission_percent}%
                              </span>
                            </>
                          )}
                        </div>
                        
                        {/* Límites */}
                        {(pair.pivot?.min_amount || pair.pivot?.max_amount) && (
                          <div className="text-xs text-muted-foreground">
                            Límites: {pair.pivot.min_amount || '0'} - {pair.pivot.max_amount || '∞'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(pair)}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleEdit(pair)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pares Disponibles */}
        {availablePairs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pares Disponibles</CardTitle>
              <CardDescription>
                Pares que puedes agregar y configurar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {availablePairs.map((pair) => (
                  <div
                    key={pair.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{pair.symbol}</h3>
                      <p className="text-sm text-muted-foreground">
                        Tasa actual: {parseFloat(pair.current_rate).toFixed(4)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(pair)}
                    >
                      Configurar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal de Configuración */}
        {showModal && editingPair && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Configurar {editingPair.symbol}</h2>
                    <p className="text-sm text-muted-foreground">
                      Elige el modelo de comisión y configura los parámetros
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPair(null);
                      reset();
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Selector de Modelo */}
                  <div className="space-y-3">
                    <Label>Modelo de Comisión</Label>
                    <RadioGroup
                      value={data.commission_model}
                      onValueChange={(value: any) => setData('commission_model', value)}
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                        <RadioGroupItem value="percentage" id="percentage" />
                        <Label htmlFor="percentage" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-500">📊</span>
                            <div>
                              <div className="font-semibold">Porcentaje Fijo</div>
                              <div className="text-xs text-muted-foreground">
                                Comisión tradicional sobre el monto
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                        <RadioGroupItem value="spread" id="spread" />
                        <Label htmlFor="spread" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="text-green-500">💱</span>
                            <div>
                              <div className="font-semibold">Spread (Compra/Venta)</div>
                              <div className="text-xs text-muted-foreground">
                                Ganancia por diferencia de tasas
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                        <RadioGroupItem value="mixed" id="mixed" />
                        <Label htmlFor="mixed" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="text-purple-500">🔀</span>
                            <div>
                              <div className="font-semibold">Mixto (Spread + Porcentaje)</div>
                              <div className="text-xs text-muted-foreground">
                                Combina ambos modelos para máxima ganancia
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Campos según Modelo */}
                  {data.commission_model === 'percentage' && (
                    <div className="space-y-2">
                      <Label htmlFor="commission_percent">Comisión (%)</Label>
                      <Input
                        id="commission_percent"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={data.commission_percent}
                        onChange={(e) => setData('commission_percent', e.target.value)}
                        placeholder="5.0"
                      />
                      {errors.commission_percent && (
                        <p className="text-sm text-red-600">{errors.commission_percent}</p>
                      )}
                    </div>
                  )}

                  {(data.commission_model === 'spread' || data.commission_model === 'mixed') && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="buy_rate">Tasa de Compra</Label>
                        <Input
                          id="buy_rate"
                          type="number"
                          step="0.000001"
                          min="0"
                          value={data.buy_rate}
                          onChange={(e) => setData('buy_rate', e.target.value)}
                          placeholder="290.00"
                        />
                        <p className="text-xs text-muted-foreground">Tu costo por unidad</p>
                        {errors.buy_rate && (
                          <p className="text-sm text-red-600">{errors.buy_rate}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="spread_percent">Margen de Ganancia (%)</Label>
                        <Input
                          id="spread_percent"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={data.commission_percent}
                          onChange={(e) => setData('commission_percent', e.target.value)}
                          placeholder="2.50"
                        />
                        <p className="text-xs text-muted-foreground">
                          Tu ganancia sobre la tasa de compra
                        </p>
                        {errors.commission_percent && (
                          <p className="text-sm text-red-600">{errors.commission_percent}</p>
                        )}
                      </div>

                      {data.buy_rate && data.commission_percent && (
                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tasa de venta:</span>
                              <span className="font-bold">
                                {(parseFloat(data.buy_rate) * (1 + parseFloat(data.commission_percent) / 100)).toFixed(6)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-600 dark:text-green-400">Ganancia por unidad:</span>
                              <span className="font-bold text-green-600 dark:text-green-400">
                                {(parseFloat(data.buy_rate) * parseFloat(data.commission_percent) / 100).toFixed(6)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {data.commission_model === 'mixed' && (
                    <div className="space-y-2">
                      <Label htmlFor="commission_percent_mixed">Comisión Adicional (%)</Label>
                      <Input
                        id="commission_percent_mixed"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={data.commission_percent}
                        onChange={(e) => setData('commission_percent', e.target.value)}
                        placeholder="2.0"
                      />
                      {errors.commission_percent && (
                        <p className="text-sm text-red-600">{errors.commission_percent}</p>
                      )}
                    </div>
                  )}

                  {/* Límites */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min_amount">Monto Mínimo</Label>
                      <Input
                        id="min_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.min_amount}
                        onChange={(e) => setData('min_amount', e.target.value)}
                        placeholder="10.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_amount">Monto Máximo</Label>
                      <Input
                        id="max_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.max_amount}
                        onChange={(e) => setData('max_amount', e.target.value)}
                        placeholder="10000.00"
                      />
                    </div>
                  </div>

                  {/* Vista Previa */}
                  <div className="p-4 bg-accent/50 rounded-lg space-y-2">
                    <h3 className="font-semibold text-sm">Vista Previa (100 unidades)</h3>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Modelo:</span>
                        <span className="font-semibold capitalize">{data.commission_model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ganancia estimada:</span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {calculateProfit().toFixed(2)} {editingPair.quote_currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowModal(false);
                        setEditingPair(null);
                        reset();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={processing}
                    >
                      {processing ? 'Guardando...' : 'Guardar Configuración'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

CurrencyPairConfig.layout = (page: React.ReactNode) => <KuberafiLayout children={page} />;
