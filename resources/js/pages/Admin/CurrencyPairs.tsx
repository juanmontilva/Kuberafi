import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Users,
  X,
  Calculator,
  ArrowRight
} from 'lucide-react';

interface CurrencyPair {
  id: number;
  base_currency: string;
  quote_currency: string;
  symbol: string;
  current_rate: string;
  calculation_type: 'multiply' | 'divide';
  min_amount: string;
  max_amount: string;
  is_active: boolean;
  exchange_houses_count: number;
  base_currency_name?: string;
  quote_currency_name?: string;
}

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

interface Props {
  currencyPairs: CurrencyPair[];
  currencies: Currency[];
}

function CurrencyPairs({ currencyPairs, currencies }: Props) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPair, setEditingPair] = useState<CurrencyPair | null>(null);
  const [formData, setFormData] = useState({
    base_currency: '',
    quote_currency: '',
    current_rate: '',
    calculation_type: 'multiply' as 'multiply' | 'divide',
    min_amount: '',
    max_amount: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Enviando datos:', formData);
    router.post('/admin/currency-pairs', formData, {
      onSuccess: () => {
        console.log('Par creado exitosamente');
        setShowCreateForm(false);
        setFormData({
          base_currency: '',
          quote_currency: '',
          current_rate: '',
          calculation_type: 'multiply',
          min_amount: '',
          max_amount: '',
        });
      },
      onError: (errors) => {
        console.error('Error al crear par:', errors);
        alert('Error al crear el par. Revisa la consola para más detalles.');
      }
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPair) return;
    
    router.put(`/admin/currency-pairs/${editingPair.id}`, {
      current_rate: formData.current_rate,
      calculation_type: formData.calculation_type,
      min_amount: formData.min_amount,
      max_amount: formData.max_amount,
    }, {
      onSuccess: () => setEditingPair(null)
    });
  };

  const handleToggle = (pair: CurrencyPair) => {
    router.post(`/admin/currency-pairs/${pair.id}/toggle`, {}, {
      preserveScroll: true,
    });
  };

  const handleDelete = (pair: CurrencyPair) => {
    if (confirm(`¿Eliminar el par ${pair.symbol}?`)) {
      router.delete(`/admin/currency-pairs/${pair.id}`);
    }
  };

  const startEdit = (pair: CurrencyPair) => {
    setEditingPair(pair);
    setFormData({
      base_currency: pair.base_currency,
      quote_currency: pair.quote_currency,
      current_rate: pair.current_rate,
      calculation_type: pair.calculation_type,
      min_amount: pair.min_amount || '',
      max_amount: pair.max_amount || '',
    });
  };

  const getCalculationLabel = (type: 'multiply' | 'divide') => {
    return type === 'multiply' ? 'Multiplicar (×)' : 'Dividir (÷)';
  };

  const getCalculationColor = (type: 'multiply' | 'divide') => {
    return type === 'multiply' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const getCurrencyName = (code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency?.name || code;
  };

  return (
    <>
      <Head title="Gestión de Pares de Divisas" />
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pares de Divisas</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Gestiona los pares de divisas disponibles en la plataforma
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Crear Par
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pares</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currencyPairs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {currencyPairs.filter(p => p.is_active).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Casas Configuradas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencyPairs.reduce((acc, p) => acc + p.exchange_houses_count, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pairs List */}
        <Card>
          <CardHeader>
            <CardTitle>Pares de Divisas</CardTitle>
            <CardDescription>
              Todos los pares configurados en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currencyPairs.map((pair) => (
                <div key={pair.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg bg-black border border-gray-800 hover:bg-gray-900 gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-semibold">{pair.symbol}</h3>
                        <Badge className={`${pair.is_active ? 'bg-green-600' : 'bg-gray-600'} shrink-0`}>
                          {pair.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Badge className={`${getCalculationColor(pair.calculation_type)} shrink-0`}>
                          <Calculator className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">{getCalculationLabel(pair.calculation_type)}</span>
                          <span className="sm:hidden">{pair.calculation_type === 'multiply' ? '×' : '÷'}</span>
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400">
                        {getCurrencyName(pair.base_currency)} / {getCurrencyName(pair.quote_currency)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span className="truncate">
                        <span className="font-medium">Tasa:</span> {parseFloat(pair.current_rate).toLocaleString('en-US', { maximumFractionDigits: 4 })}
                      </span>
                      <span className="truncate">
                        <span className="font-medium">Min:</span> ${parseFloat(pair.min_amount).toLocaleString('en-US')}
                      </span>
                      {pair.max_amount && (
                        <span className="truncate">
                          <span className="font-medium">Max:</span> ${parseFloat(pair.max_amount).toLocaleString('en-US')}
                        </span>
                      )}
                      <span className="flex items-center gap-1 truncate">
                        <Users className="h-3 w-3 shrink-0" />
                        {pair.exchange_houses_count} casas
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 justify-end sm:justify-start shrink-0">
                    <Button size="sm" variant="outline" onClick={() => startEdit(pair)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleToggle(pair)}>
                      {pair.is_active ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </Button>
                    {pair.exchange_houses_count === 0 && (
                      <Button size="sm" variant="outline" onClick={() => handleDelete(pair)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Crear Nuevo Par de Divisas</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>Define un nuevo par combinando divisas</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Divisa Base *</Label>
                      <Select value={formData.base_currency} onValueChange={(value) => setFormData({...formData, base_currency: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar divisa" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.id} value={currency.code}>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{currency.code}</span>
                                <span className="text-muted-foreground">({currency.symbol})</span>
                                <span className="text-sm">{currency.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Divisa Quote *</Label>
                      <Select value={formData.quote_currency} onValueChange={(value) => setFormData({...formData, quote_currency: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar divisa" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.id} value={currency.code}>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{currency.code}</span>
                                <span className="text-muted-foreground">({currency.symbol})</span>
                                <span className="text-sm">{currency.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.base_currency && formData.quote_currency && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-900">
                        <span className="font-semibold">{formData.base_currency}</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="font-semibold">{formData.quote_currency}</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        Par: {formData.base_currency}/{formData.quote_currency}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label>Tasa Actual *</Label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.current_rate}
                      onChange={(e) => setFormData({...formData, current_rate: e.target.value})}
                      placeholder="38.50"
                      required
                    />
                  </div>

                  <div>
                    <Label>Tipo de Cálculo *</Label>
                    <Select value={formData.calculation_type} onValueChange={(value: 'multiply' | 'divide') => setFormData({...formData, calculation_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiply">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calculator className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold">Multiplicar (×)</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Cliente da base, recibe quote × tasa
                            </p>
                          </div>
                        </SelectItem>
                        <SelectItem value="divide">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calculator className="h-4 w-4 text-purple-600" />
                              <span className="font-semibold">Dividir (÷)</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Cliente da base, recibe quote ÷ tasa
                            </p>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.base_currency && formData.quote_currency && formData.current_rate && (
                    <div className={`p-3 rounded-lg border ${
                      formData.calculation_type === 'multiply' 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-purple-50 border-purple-200'
                    }`}>
                      <p className={`text-sm font-semibold ${
                        formData.calculation_type === 'multiply' ? 'text-blue-900' : 'text-purple-900'
                      }`}>
                        Ejemplo de cálculo:
                      </p>
                      <p className={`text-sm ${
                        formData.calculation_type === 'multiply' ? 'text-blue-700' : 'text-purple-700'
                      }`}>
                        Cliente da 100 {formData.base_currency} →{' '}
                        {formData.calculation_type === 'multiply'
                          ? `100 × ${formData.current_rate} = ${(100 * parseFloat(formData.current_rate || '0')).toFixed(2)}`
                          : `100 ÷ ${formData.current_rate} = ${(100 / parseFloat(formData.current_rate || '1')).toFixed(2)}`
                        } {formData.quote_currency}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Monto Mínimo</Label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.min_amount}
                        onChange={(e) => setFormData({...formData, min_amount: e.target.value})}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label>Monto Máximo</Label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.max_amount}
                        onChange={(e) => setFormData({...formData, max_amount: e.target.value})}
                        placeholder="10000"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      Crear Par
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
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
            <Card className="w-full max-w-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Editar {editingPair.symbol}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setEditingPair(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>Modificar configuración del par</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <Label>Tasa Actual *</Label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.current_rate}
                      onChange={(e) => setFormData({...formData, current_rate: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label>Tipo de Cálculo *</Label>
                    <Select value={formData.calculation_type} onValueChange={(value: 'multiply' | 'divide') => setFormData({...formData, calculation_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiply">
                          <div className="flex items-center gap-2">
                            <Calculator className="h-4 w-4 text-blue-600" />
                            <span>Multiplicar (×)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="divide">
                          <div className="flex items-center gap-2">
                            <Calculator className="h-4 w-4 text-purple-600" />
                            <span>Dividir (÷)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Monto Mínimo</Label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.min_amount}
                        onChange={(e) => setFormData({...formData, min_amount: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Monto Máximo</Label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.max_amount}
                        onChange={(e) => setFormData({...formData, max_amount: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      Guardar Cambios
                    </Button>
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
