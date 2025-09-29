import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calculator
} from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  base_amount: string;
  quote_amount: string;
  market_rate: string;
  applied_rate: string;
  expected_margin_percent: string;
  currency_pair: {
    symbol: string;
    base_currency: string;
    quote_currency: string;
    current_rate: string;
  };
}

interface Props {
  order: Order;
  onClose: () => void;
}

export function CompleteOrderModal({ order, onClose }: Props) {
  const [actualRate, setActualRate] = useState('');
  const [actualMargin, setActualMargin] = useState(0);
  const [marginDifference, setMarginDifference] = useState(0);
  const [actualQuoteAmount, setActualQuoteAmount] = useState(0);
  const [profit, setProfit] = useState(0);
  const [notes, setNotes] = useState('');

  // Calcular margen real basado en la tasa real obtenida
  useEffect(() => {
    if (actualRate && order.market_rate) {
      const marketRate = parseFloat(order.market_rate);
      const actualRateNum = parseFloat(actualRate);
      const baseAmount = parseFloat(order.base_amount);
      
      // Calcular margen real
      const margin = ((actualRateNum - marketRate) / marketRate) * 100;
      setActualMargin(margin);
      
      // Diferencia con el esperado
      const expectedMargin = parseFloat(order.expected_margin_percent);
      setMarginDifference(margin - expectedMargin);
      
      // Monto real en quote currency
      const quoteAmt = baseAmount * actualRateNum;
      setActualQuoteAmount(quoteAmt);
      
      // Ganancia neta (margen sobre el monto base)
      const profitAmt = (baseAmount * margin) / 100;
      setProfit(profitAmt);
    }
  }, [actualRate, order.market_rate, order.base_amount, order.expected_margin_percent]);

  const handleComplete = () => {
    router.post(`/orders/${order.id}/complete`, {
      actual_rate: actualRate,
      actual_margin_percent: actualMargin.toFixed(2),
      notes: notes
    }, {
      onSuccess: () => onClose()
    });
  };

  const getMarginStatus = () => {
    if (marginDifference >= 0) {
      return {
        icon: <TrendingUp className="h-5 w-5 text-green-600" />,
        color: 'text-green-600',
        bg: 'bg-green-50 border-green-200',
        message: '¡Ganancia superior a la esperada!'
      };
    } else if (marginDifference > -1) {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50 border-yellow-200',
        message: 'Margen ligeramente menor'
      };
    } else {
      return {
        icon: <TrendingDown className="h-5 w-5 text-red-600" />,
        color: 'text-red-600',
        bg: 'bg-red-50 border-red-200',
        message: 'Margen significativamente menor'
      };
    }
  };

  const status = getMarginStatus();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Completar Orden {order.order_number}
          </CardTitle>
          <CardDescription>
            Registra la tasa real obtenida para calcular tu ganancia efectiva
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Resumen de la Orden */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-3">Resumen de la Orden</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Par</p>
                <p className="font-semibold">{order.currency_pair.symbol}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Monto Base</p>
                <p className="font-semibold">{order.base_amount} {order.currency_pair.base_currency}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tasa de Mercado</p>
                <p className="font-semibold">{parseFloat(order.market_rate).toFixed(6)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Margen Esperado</p>
                <p className="font-semibold text-blue-600">{order.expected_margin_percent}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tasa Aplicada al Cliente</p>
                <p className="font-semibold">{parseFloat(order.applied_rate).toFixed(6)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Monto Prometido</p>
                <p className="font-semibold">{parseFloat(order.quote_amount).toFixed(2)} {order.currency_pair.quote_currency}</p>
              </div>
            </div>
          </div>

          {/* Tasa Real Obtenida */}
          <div className="space-y-2">
            <Label htmlFor="actual_rate" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Tasa Real que Conseguiste *
            </Label>
            <Input
              id="actual_rate"
              type="number"
              step="0.000001"
              value={actualRate}
              onChange={(e) => setActualRate(e.target.value)}
              placeholder={`Ej: ${parseFloat(order.currency_pair.current_rate).toFixed(6)}`}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Ingresa la tasa a la que realmente conseguiste el dinero en el mercado
            </p>
          </div>

          {/* Cálculo en Tiempo Real */}
          {actualRate && (
            <div className={`p-4 rounded-lg border-2 ${status.bg}`}>
              <div className="flex items-center gap-2 mb-4">
                {status.icon}
                <h3 className="font-semibold">{status.message}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Margen Real</p>
                  <p className={`text-2xl font-bold ${status.color}`}>
                    {actualMargin.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diferencia</p>
                  <p className={`text-2xl font-bold ${status.color}`}>
                    {marginDifference > 0 ? '+' : ''}{marginDifference.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monto Real Obtenido</p>
                  <p className="text-lg font-semibold">
                    {actualQuoteAmount.toFixed(2)} {order.currency_pair.quote_currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tu Ganancia Neta</p>
                  <p className={`text-lg font-semibold ${status.color}`}>
                    {profit.toFixed(2)} {order.currency_pair.base_currency}
                  </p>
                </div>
              </div>

              {/* Análisis */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">Análisis:</p>
                <ul className="text-sm space-y-1">
                  <li>• Prometiste: {parseFloat(order.quote_amount).toFixed(2)} {order.currency_pair.quote_currency}</li>
                  <li>• Conseguiste: {actualQuoteAmount.toFixed(2)} {order.currency_pair.quote_currency}</li>
                  <li className={status.color}>
                    • Diferencia: {(actualQuoteAmount - parseFloat(order.quote_amount)).toFixed(2)} {order.currency_pair.quote_currency}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Conseguí mejor tasa de lo esperado con proveedor B"
              rows={3}
            />
          </div>

          {/* Advertencia si es necesario */}
          {marginDifference < -2 && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-red-900 mb-1">Margen Bajo Detectado</p>
                  <p className="text-red-700">
                    El margen real es significativamente menor al esperado. Considera ajustar tus márgenes futuros o buscar mejores proveedores de liquidez.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <Button 
              onClick={handleComplete} 
              disabled={!actualRate}
              className="flex-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Completar Orden
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
