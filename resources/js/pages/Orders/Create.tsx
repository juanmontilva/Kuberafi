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
  Info,
  Search,
  X
} from 'lucide-react';

interface CurrencyPair {
  id: number;
  symbol: string;
  base_currency: string;
  quote_currency: string;
  current_rate: string;
  calculation_type: 'multiply' | 'divide';
  min_amount: string;
  max_amount?: string;
}

interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
}

interface OperatorBalance {
  payment_method_id: number;
  payment_method_name: string;
  currency: string;
  balance: number;
}

interface PaymentMethodOption {
  id: number;
  name: string;
  currency: string;
  balance: number;
  account_info?: string;
}

interface Props {
  currencyPairs: CurrencyPair[];
  platformCommissionRate: number;
  customers: Customer[];
  operatorBalances: Record<string, OperatorBalance>;
  paymentMethods: Record<string, PaymentMethodOption[]>;
}

function CreateOrder({ currencyPairs, platformCommissionRate, customers, operatorBalances, paymentMethods }: Props) {
  const [selectedPair, setSelectedPair] = useState<CurrencyPair | null>(null);
  const [calculatedQuote, setCalculatedQuote] = useState<number>(0);
  const [customerSearch, setCustomerSearch] = useState('');
  const [pairSearch, setPairSearch] = useState('');
  const [selectionMode, setSelectionMode] = useState<'auto' | 'manual'>('auto');
  
  // Obtener saldos para las monedas del par seleccionado
  const getBalanceForCurrency = (currency: string) => {
    // Buscar el saldo en operatorBalances
    const balanceEntry = Object.values(operatorBalances).find(
      (b) => b.currency === currency
    );
    return balanceEntry?.balance || 0;
  };

  const { data, setData, post, processing, errors } = useForm({
    currency_pair_id: '',
    base_amount: '',
    house_commission_percent: '5.0',
    customer_id: undefined as string | undefined,
    notes: '',
    payment_method_selection_mode: 'auto' as 'auto' | 'manual',
    payment_method_in_id: undefined as number | undefined,
    payment_method_out_id: undefined as number | undefined,
  });

  // Filtrar clientes por búsqueda
  const filteredCustomers = customerSearch.trim() === '' 
    ? customers 
    : customers.filter(customer => {
        const searchLower = customerSearch.toLowerCase().trim();
        // Solo filtrar si hay al menos 2 caracteres
        if (searchLower.length < 2) {
          return true; // Mostrar todos si hay menos de 2 caracteres
        }
        return (
          customer.name.toLowerCase().includes(searchLower) ||
          customer.phone?.toLowerCase().includes(searchLower) ||
          customer.email?.toLowerCase().includes(searchLower)
        );
      });

  // Filtrar pares de divisas por búsqueda
  const filteredPairs = pairSearch.trim() === '' 
    ? currencyPairs 
    : currencyPairs.filter(pair => {
        const searchLower = pairSearch.toLowerCase().trim();
        // Solo filtrar si hay al menos 2 caracteres
        if (searchLower.length < 2) {
          return true; // Mostrar todos si hay menos de 2 caracteres
        }
        return (
          pair.symbol.toLowerCase().includes(searchLower) ||
          pair.base_currency.toLowerCase().includes(searchLower) ||
          pair.quote_currency.toLowerCase().includes(searchLower)
        );
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
        
        // Calcular según el tipo de operación del par
        const quoteAmount = selectedPair.calculation_type === 'divide'
          ? netAmount / currentRate
          : netAmount * currentRate;
          
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
                  <Label htmlFor="customer_id">Cliente (Opcional)</Label>
                  <Select 
                    value={data.customer_id || 'none'} 
                    onValueChange={(value) => {
                      setData('customer_id', value === 'none' ? undefined : value);
                      setCustomerSearch('');
                    }}
                  >
                    <SelectTrigger className="h-auto min-h-[40px]">
                      <SelectValue placeholder="Selecciona un cliente (opcional)">
                        {data.customer_id && data.customer_id !== 'none' ? (
                          <div className="flex flex-col items-start py-1">
                            <span className="font-medium">
                              {customers.find(c => c.id.toString() === data.customer_id)?.name}
                            </span>
                            {customers.find(c => c.id.toString() === data.customer_id)?.phone && (
                              <span className="text-xs text-muted-foreground">
                                {customers.find(c => c.id.toString() === data.customer_id)?.phone}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sin cliente</span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <div className="flex items-center border-b px-3 pb-2 mb-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                          placeholder="Buscar cliente..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                          }}
                          autoFocus
                        />
                        {customerSearch && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomerSearch('');
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="max-h-[200px] overflow-y-auto">
                        <SelectItem value="none" className="py-3">
                          <span className="text-muted-foreground">Sin cliente</span>
                        </SelectItem>
                        {customerSearch.trim().length > 0 && customerSearch.trim().length < 2 ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            Escribe al menos 2 caracteres para buscar...
                          </div>
                        ) : filteredCustomers.length > 0 ? (
                          filteredCustomers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id.toString()} className="py-3">
                              <div className="flex flex-col gap-1">
                                <span className="font-medium text-base">{customer.name}</span>
                                {customer.phone && (
                                  <span className="text-xs text-muted-foreground">📱 {customer.phone}</span>
                                )}
                                {customer.email && (
                                  <span className="text-xs text-muted-foreground">📧 {customer.email}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            No se encontraron clientes
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                  {errors.customer_id && (
                    <p className="text-sm text-red-600">{errors.customer_id}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Asocia esta orden a un cliente para llevar un registro de operaciones pendientes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency_pair_id">Par de Divisas</Label>
                  <Select 
                    value={data.currency_pair_id} 
                    onValueChange={(value) => {
                      handlePairChange(value);
                      setPairSearch('');
                    }}
                  >
                    <SelectTrigger className="h-auto min-h-[40px]">
                      <SelectValue placeholder="Selecciona un par de divisas">
                        {selectedPair && (
                          <div className="flex flex-col items-start py-1">
                            <span className="font-semibold">{selectedPair.symbol}</span>
                            <span className="text-xs text-muted-foreground">
                              Tasa: {parseFloat(selectedPair.current_rate).toLocaleString('en-US', { minimumFractionDigits: 4 })}
                            </span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <div className="flex items-center border-b px-3 pb-2 mb-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                          placeholder="Buscar par de divisas..."
                          value={pairSearch}
                          onChange={(e) => setPairSearch(e.target.value)}
                          className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                          }}
                          autoFocus
                        />
                        {pairSearch && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPairSearch('');
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="max-h-[200px] overflow-y-auto">
                        {pairSearch.trim().length > 0 && pairSearch.trim().length < 2 ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            Escribe al menos 2 caracteres para buscar...
                          </div>
                        ) : filteredPairs.length > 0 ? (
                          filteredPairs.map((pair) => (
                            <SelectItem key={pair.id} value={pair.id.toString()} className="py-3">
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-base">{pair.symbol}</span>
                                <span className="text-xs text-muted-foreground">
                                  💱 Tasa: {parseFloat(pair.current_rate).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {pair.base_currency} → {pair.quote_currency}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            No se encontraron pares de divisas
                          </div>
                        )}
                      </div>
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

                {/* Selección de Métodos de Pago - Estilo OKX Dark Premium */}
                {selectedPair && (
                  <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black p-6 shadow-xl">
                    {/* Header con título e iconos */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Gestión de Fondos</h3>
                          <p className="text-sm text-gray-400">Selecciona cómo gestionar las cuentas</p>
                        </div>
                      </div>

                      {/* Toggle Buttons - Estilo OKX Dark */}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectionMode('auto');
                            setData('payment_method_selection_mode', 'auto');
                            setData('payment_method_in_id', undefined);
                            setData('payment_method_out_id', undefined);
                          }}
                          className={`group relative flex-1 overflow-hidden rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                            selectionMode === 'auto'
                              ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                              : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 hover:bg-gray-750'
                          }`}
                        >
                          <div className="relative z-10 flex items-center justify-center gap-2">
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                              selectionMode === 'auto' ? 'bg-white/20' : 'bg-blue-500/20'
                            }`}>
                              <svg className={`h-4 w-4 ${selectionMode === 'auto' ? 'text-white' : 'text-blue-400'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span>Automático</span>
                          </div>
                          {selectionMode === 'auto' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-100" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectionMode('manual');
                            setData('payment_method_selection_mode', 'manual');
                          }}
                          className={`group relative flex-1 overflow-hidden rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                            selectionMode === 'manual'
                              ? 'border-purple-500 bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                              : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 hover:bg-gray-750'
                          }`}
                        >
                          <div className="relative z-10 flex items-center justify-center gap-2">
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                              selectionMode === 'manual' ? 'bg-white/20' : 'bg-purple-500/20'
                            }`}>
                              <svg className={`h-4 w-4 ${selectionMode === 'manual' ? 'text-white' : 'text-purple-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                              </svg>
                            </div>
                            <span>Manual</span>
                          </div>
                          {selectionMode === 'manual' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-500 opacity-100" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Content Area */}
                    {selectionMode === 'auto' ? (
                      <div className="rounded-lg border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-blue-300">Modo Automático Activado</p>
                            <p className="mt-1 text-sm text-gray-400">
                              El sistema seleccionará automáticamente las cuentas con mayor saldo disponible para optimizar esta operación.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Info Banner */}
                        <div className="rounded-lg border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg shadow-purple-500/30">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold text-purple-300">Modo Manual Activado</p>
                              <p className="mt-1 text-sm text-gray-400">
                                Selecciona las cuentas específicas que deseas usar para esta operación.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Account Selectors */}
                        <div className="space-y-4">
                          {/* Cuenta que RECIBE */}
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                              <div className="flex h-5 w-5 items-center justify-center rounded bg-green-500/20 text-green-400">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </div>
                              Cuenta que Recibe ({selectedPair.base_currency})
                            </Label>
                            <Select
                              value={data.payment_method_in_id?.toString() || ''}
                              onValueChange={(value) => setData('payment_method_in_id', parseInt(value))}
                            >
                              <SelectTrigger className="h-12 border-gray-700 bg-gray-800 text-white hover:border-gray-600">
                                <SelectValue placeholder={`Selecciona cuenta ${selectedPair.base_currency}`} />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                {paymentMethods[selectedPair.base_currency]?.map((method) => (
                                  <SelectItem key={method.id} value={method.id.toString()} className="text-white hover:bg-gray-700">
                                    <div className="flex items-center gap-3 py-1">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-400 font-bold text-xs">
                                        {method.currency}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="font-semibold text-white">{method.name}</span>
                                        <span className="text-xs text-gray-400">
                                          💰 {method.balance.toLocaleString()} {method.currency}
                                          {method.account_info && ` • ${method.account_info}`}
                                        </span>
                                      </div>
                                    </div>
                                  </SelectItem>
                                )) || (
                                  <SelectItem value="none" disabled>
                                    No hay cuentas disponibles
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Cuenta que ENTREGA */}
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                              <div className="flex h-5 w-5 items-center justify-center rounded bg-red-500/20 text-red-400">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </div>
                              Cuenta que Entrega ({selectedPair.quote_currency})
                            </Label>
                            <Select
                              value={data.payment_method_out_id?.toString() || ''}
                              onValueChange={(value) => setData('payment_method_out_id', parseInt(value))}
                            >
                              <SelectTrigger className="h-12 border-gray-700 bg-gray-800 text-white hover:border-gray-600">
                                <SelectValue placeholder={`Selecciona cuenta ${selectedPair.quote_currency}`} />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                {paymentMethods[selectedPair.quote_currency]?.map((method) => (
                                  <SelectItem key={method.id} value={method.id.toString()} className="text-white hover:bg-gray-700">
                                    <div className="flex items-center gap-3 py-1">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-400 font-bold text-xs">
                                        {method.currency}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="font-semibold text-white">{method.name}</span>
                                        <span className="text-xs text-gray-400">
                                          💰 {method.balance.toLocaleString()} {method.currency}
                                          {method.account_info && ` • ${method.account_info}`}
                                        </span>
                                      </div>
                                    </div>
                                  </SelectItem>
                                )) || (
                                  <SelectItem value="none" disabled>
                                    No hay cuentas disponibles
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {errors.payment_method_selection_mode && (
                      <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                        <p className="text-sm font-medium text-red-400">{errors.payment_method_selection_mode}</p>
                      </div>
                    )}
                  </div>
                )}

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

          {/* Calculadora - Estilo OKX Dark Premium */}
          <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black shadow-xl">
            {/* Header */}
            <div className="border-b border-gray-800 bg-gray-900/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Calculadora</h3>
                  <p className="text-sm text-gray-400">Vista previa de la conversión</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {selectedPair && data.base_amount && data.house_commission_percent ? (
                <div className="space-y-6">
                  {/* Conversion Display */}
                  <div className="relative">
                    <div className="text-center space-y-4">
                      {/* From Amount */}
                      <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                        <p className="text-sm text-gray-400 mb-2">Envías</p>
                        <div className="text-3xl font-black text-white">
                          {parseFloat(data.base_amount).toLocaleString()} {selectedPair.base_currency}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                          <ArrowRight className="h-5 w-5 text-white" />
                        </div>
                      </div>

                      {/* To Amount */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30">
                        <p className="text-sm text-gray-400 mb-2">Recibes</p>
                        <div className="text-3xl font-black text-green-400">
                          {calculatedQuote.toFixed(2)} {selectedPair.quote_currency}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Monto cliente:</span>
                      <span className="font-semibold text-white">${parseFloat(data.base_amount).toLocaleString()}</span>
                    </div>
                    
                    {/* Commission Breakdown */}
                    <div className="rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-green-400 font-semibold">Comisión Total ({data.house_commission_percent}%):</span>
                        <span className="text-green-400 font-bold">+${(parseFloat(data.base_amount) * parseFloat(data.house_commission_percent) / 100).toFixed(2)}</span>
                      </div>
                      
                      {platformCommissionRate === 0 ? (
                        <div className="flex justify-between items-center text-xs pl-4 p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                          <span className="text-purple-300">↳ KuberaFi (0% - 🎉 Promoción):</span>
                          <span className="text-purple-300 font-semibold">$0.00</span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-xs pl-4">
                          <span className="text-red-400">↳ KuberaFi ({platformCommissionRate}%):</span>
                          <span className="text-red-400">-${(parseFloat(data.base_amount) * platformCommissionRate / 100).toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className={`flex justify-between items-center text-xs pl-4 ${platformCommissionRate === 0 ? 'text-purple-300 font-bold' : 'text-green-300'}`}>
                        <span>↳ Tu ganancia neta:</span>
                        <span className="font-bold">${((parseFloat(data.base_amount) * parseFloat(data.house_commission_percent) / 100) - (parseFloat(data.base_amount) * platformCommissionRate / 100)).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-800">
                      <span className="text-gray-400">Monto a cambiar:</span>
                      <span className="font-bold text-white">
                        ${(parseFloat(data.base_amount) - (parseFloat(data.base_amount) * parseFloat(data.house_commission_percent) / 100)).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Tasa:</span>
                      <span className="font-mono text-white">{parseFloat(selectedPair.current_rate).toFixed(4)}</span>
                    </div>
                  </div>

                  {/* Client Receives Highlight */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 border-2 border-green-500/50">
                    <p className="text-center">
                      <span className="text-sm text-green-300 block mb-2">Cliente recibe:</span>
                      <span className="text-3xl font-black text-green-400">{calculatedQuote.toFixed(2)} {selectedPair.quote_currency}</span>
                    </p>
                  </div>

                  {/* Balance Control Section */}
                  <div className="space-y-3 pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-yellow-500/20">
                        <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-white text-sm">Control de Saldo</h4>
                    </div>
                    
                    {/* Base Currency Balance - LO QUE RECIBES DEL CLIENTE */}
                    <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-300">Saldo Inicial ({selectedPair.base_currency}):</span>
                          <span className="font-bold text-blue-200">
                            {getBalanceForCurrency(selectedPair.base_currency).toLocaleString('en-US', { 
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2 
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-300">Recibes del cliente:</span>
                          <span className="font-bold text-green-400">
                            +{parseFloat(data.base_amount).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-blue-500/30 pt-2">
                          <span className="text-blue-200 font-semibold">Saldo Final:</span>
                          <span className={`font-black text-lg ${
                            (Number(getBalanceForCurrency(selectedPair.base_currency)) + Number(data.base_amount)) < 0 
                              ? 'text-red-400' 
                              : 'text-green-400'
                          }`}>
                            {(Number(getBalanceForCurrency(selectedPair.base_currency)) + Number(data.base_amount)).toLocaleString('en-US', { 
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quote Currency Balance - LO QUE ENTREGAS AL CLIENTE */}
                    <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-purple-300">Saldo Inicial ({selectedPair.quote_currency}):</span>
                          <span className="font-bold text-purple-200">
                            {getBalanceForCurrency(selectedPair.quote_currency).toLocaleString('en-US', { 
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2 
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-purple-300">Entregas al cliente:</span>
                          <span className="font-bold text-red-400">
                            -{calculatedQuote.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-purple-500/30 pt-2">
                          <span className="text-purple-200 font-semibold">Saldo Final:</span>
                          <span className={`font-black text-lg ${
                            (Number(getBalanceForCurrency(selectedPair.quote_currency)) - Number(calculatedQuote)) < 0 
                              ? 'text-red-400' 
                              : 'text-green-400'
                          }`}>
                            {(Number(getBalanceForCurrency(selectedPair.quote_currency)) - Number(calculatedQuote)).toLocaleString('en-US', { 
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 mx-auto mb-4">
                    <Calculator className="h-8 w-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500 text-sm">Completa los campos para ver la calculadora</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

CreateOrder.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default CreateOrder;