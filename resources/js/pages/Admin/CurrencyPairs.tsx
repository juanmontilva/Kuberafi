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
  Users
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
  exchange_houses_count: number;
  created_at: string;
}

interface Props {
  currencyPairs: CurrencyPair[];
}

function CurrencyPairs({ currencyPairs }: Props) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPair, setEditingPair] = useState<CurrencyPair | null>(null);
  const [formData, setFormData] = useState({
    base_currency: '',
    quote_currency: '',
    current_rate: '',
    min_amount: '',
    max_amount: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/admin/currency-pairs', formData, {
      onSuccess: () => {
        setShowCreateForm(false);
        setFormData({
          base_currency: '',
          quote_currency: '',
          current_rate: '',
          min_amount: '',
          max_amount: '',
        });
      }
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPair) return;
    
    router.put(`/admin/currency-pairs/${editingPair.id}`, {
      current_rate: formData.current_rate,
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
      min_amount: pair.min_amount || '',
      max_amount: pair.max_amount || '',
    });
  };

  return (
    <>
      <Head title="Gestión de Pares de Divisas" />
      
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pares de Divisas</h1>
            <p className="text-muted-foreground">
              Gestiona los pares de divisas disponibles en la plataforma
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Par
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Par</CardTitle>
              <CardDescription>Define un nuevo par de divisas</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Moneda Base</Label>
                    <Input
                      value={formData.base_currency}
                      onChange={(e) => setFormData({...formData, base_currency: e.target.value.toUpperCase()})}
                      placeholder="USD"
                      maxLength={3}
                      required
                    />
                  </div>
                  <div>
                    <Label>Moneda Cotizada</Label>
                    <Input
                      value={formData.quote_currency}
                      onChange={(e) => setFormData({...formData, quote_currency: e.target.value.toUpperCase()})}
                      placeholder="VES"
                      maxLength={3}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Tasa Actual</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.current_rate}
                    onChange={(e) => setFormData({...formData, current_rate: e.target.value})}
                    placeholder="36.50"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Monto Mínimo</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.min_amount}
                      onChange={(e) => setFormData({...formData, min_amount: e.target.value})}
                      placeholder="10.00"
                    />
                  </div>
                  <div>
                    <Label>Monto Máximo</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.max_amount}
                      onChange={(e) => setFormData({...formData, max_amount: e.target.value})}
                      placeholder="100000.00"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Crear Par</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
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
                <div key={pair.id} className="flex items-center justify-between p-4 rounded-lg bg-black border border-gray-800 hover:bg-gray-900">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{pair.symbol}</h3>
                      <Badge className={pair.is_active ? 'bg-green-600' : 'bg-gray-600'}>
                        {pair.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Tasa: {parseFloat(pair.current_rate).toFixed(6)}</span>
                      <span>Min: ${pair.min_amount}</span>
                      {pair.max_amount && <span>Max: ${pair.max_amount}</span>}
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {pair.exchange_houses_count} casas
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(pair)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggle(pair)}
                    >
                      {pair.is_active ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </Button>
                    {pair.exchange_houses_count === 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(pair)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Modal */}
        {editingPair && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Editar {editingPair.symbol}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <Label>Tasa Actual</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      value={formData.current_rate}
                      onChange={(e) => setFormData({...formData, current_rate: e.target.value})}
                      required
                    />
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
