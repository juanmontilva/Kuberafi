import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { useState, useEffect } from 'react';
import { 
  Calculator,
  ArrowRight,
  Info
} from 'lucide-react';

interface CurrencyPair {
  id: number;
  symbol: string;
  base_currency: string;
  quote_currency: string;
  current_rate: string;
  min_amount: string;
  max_amount?: string;
}

interface Props {
  currencyPairs: CurrencyPair[];
  platformCommissionRate: number;
}

function CreateOrder({ currencyPairs, platformCommissionRate }: Props) {
  const [selectedPair, setSelectedPair] = useState<CurrencyPair | null>(null);
  const [calculatedQuote, setCalculatedQuote] = useState<number>(0);

  const { data, setData, post, processing, errors } = useForm({
    currency_pair_id: '',
    base_amount: '',
    house_commission_percent: '5.0',
    notes: '',
  });

  // Calcular el monto que recibirá el cliente
  useEffect(() => {
    if (selectedPair && data.base_amount && data.house_commission_percent) {
      const baseAmount = parseFloat(data.base_amount);
      const commissionPercent = parseFloat(data.house_commission_percent);
      const currentRate = parseFloat(selectedPair.current_rate);
      
      if (!isNaN(baseAmount) && !isNaN(commissionPercent) && !isNaN(currentRate)) {
        // Monto neto que recibe el cliente = Monto - Comisión
        const commissionAmount = baseAmount * (commissionPercent / 100);
        const netAmount = baseAmount - commissionAmount;
        const quoteAmount = netAmount * currentRate;
        setCalculatedQuote(quoteAmount);
      }
    } else {
      setCalculatedQuote(0);
    }
  }, [selectedPair, data.base_amount, data.house_commission_percent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/orders');
  };

  const handlePairChange = (pairId: string) => {
    const pair = currencyPairs.find(p => p.id.toString() === pairId);
    setSelectedPair(pair || null);
    setData('currency_pair_id', pairId);
  };

  return (
    <>
      <Head title="Nueva Orden" />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Orden</h1>
          <p className="text-muted-foreground">
            Crea una nueva orden de cambio de divisas
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Formulario */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Orden</CardTitle>
              <CardDescription>
                Completa la información para crear la orden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency_pair_id">Par de Divisas</Label>
                  <Select value={data.currency_pair_id} onValueChange={handlePairChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un par de divisas" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyPairs.map((pair) => (
                        <SelectItem key={pair.id} value={pair.id.toString()}>
                          {pair.symbol} - Tasa: {parseFloat(pair.current_rate).toFixed(4)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.currency_pair_id && (
                    <p className="text-sm text-red-600">{errors.currency_pair_id}</p>
                  )}
                </div>

                {selectedPair && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Info className="h-4 w-4" />
                      <span>
                        Límites: ${selectedPair.min_amount} - ${selectedPair.max_amount || '∞'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="base_amount">
                    Monto ({selectedPair?.base_currency || 'Base'})
                  </Label>
                  <Input
                    id="base_amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={data.base_amount}
                    onChange={(e) => setData('base_amount', e.target.value)}
                    placeholder="Ingresa el monto"
                  />
                  {errors.base_amount && (
                    <p className="text-sm text-red-600">{errors.base_amount}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="house_commission_percent">Comisión (%)</Label>
                  <Input
                    id="house_commission_percent"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={data.house_commission_percent}
                    onChange={(e) => setData('house_commission_percent', e.target.value)}
                    placeholder="Ej: 5.0"
                  />
                  {errors.house_commission_percent && (
                    <p className="text-sm text-red-600">{errors.house_commission_percent}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas (Opcional)</Label>
                  <Textarea
                    id="notes"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Información adicional sobre la orden"
                    rows={3}
                  />
                  {errors.notes && (
                    <p className="text-sm text-red-600">{errors.notes}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={processing} className="flex-1">
                    {processing ? 'Creando...' : 'Crear Orden'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Calculadora */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculadora
              </CardTitle>
              <CardDescription>
                Vista previa de la conversión
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedPair && data.base_amount && data.house_commission_percent ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {data.base_amount} {selectedPair.base_currency}
                    </div>
                    <ArrowRight className="h-6 w-6 mx-auto my-2 text-muted-foreground" />
                    <div className="text-2xl font-bold text-green-600">
                      {calculatedQuote.toFixed(2)} {selectedPair.quote_currency}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monto cliente:</span>
                      <span>${parseFloat(data.base_amount).toFixed(2)}</span>
                    </div>
                    
                    {/* Desglose de Comisión */}
                    <div className="bg-red-50 border border-red-200 rounded p-2 space-y-1">
                      <div className="flex justify-between text-red-600 font-medium">
                        <span>Comisión Total ({data.house_commission_percent}%):</span>
                        <span>-${(parseFloat(data.base_amount) * parseFloat(data.house_commission_percent) / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-red-700 pl-4">
                        <span>↳ KuberaFi ({platformCommissionRate}%):</span>
                        <span>${(parseFloat(data.base_amount) * platformCommissionRate / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-green-700 pl-4">
                        <span>↳ Tu ganancia neta:</span>
                        <span>${((parseFloat(data.base_amount) * parseFloat(data.house_commission_percent) / 100) - (parseFloat(data.base_amount) * platformCommissionRate / 100)).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span className="text-muted-foreground">Monto a cambiar:</span>
                      <span className="font-bold">
                        ${(parseFloat(data.base_amount) - (parseFloat(data.base_amount) * parseFloat(data.house_commission_percent) / 100)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tasa:</span>
                      <span>{parseFloat(selectedPair.current_rate).toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 text-center">
                      <strong>Cliente recibe:</strong><br />
                      <span className="text-2xl font-bold">{calculatedQuote.toFixed(2)} {selectedPair.quote_currency}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Completa los campos para ver la calculadora</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

CreateOrder.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default CreateOrder;