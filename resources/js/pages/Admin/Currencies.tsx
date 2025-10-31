import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { useState } from 'react';
import { 
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Coins,
  X
} from 'lucide-react';

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  is_active: boolean;
}

interface Props {
  currencies: Currency[];
}

function AdminCurrencies({ currencies }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

  const { data: addData, setData: setAddData, post, processing: addProcessing, errors: addErrors, reset: resetAdd } = useForm({
    code: '',
    name: '',
    symbol: '',
    decimals: 2,
  });

  const { data: editData, setData: setEditData, put, processing: editProcessing, errors: editErrors } = useForm({
    name: '',
    symbol: '',
    decimals: 2,
    is_active: true,
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/currencies', {
      onSuccess: () => {
        setShowAddForm(false);
        resetAdd();
      }
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCurrency) return;
    
    put(`/admin/currencies/${editingCurrency.id}`, {
      onSuccess: () => setEditingCurrency(null)
    });
  };

  const handleToggle = (currency: Currency) => {
    post(`/admin/currencies/${currency.id}/toggle`, {}, {
      preserveScroll: true,
    });
  };

  const handleDelete = (currency: Currency) => {
    if (confirm(`¿Eliminar la divisa ${currency.code}? Esta acción no se puede deshacer.`)) {
      post(`/admin/currencies/${currency.id}`, {
        _method: 'delete',
      }, {
        preserveScroll: true,
      });
    }
  };

  const startEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    setEditData({
      name: currency.name,
      symbol: currency.symbol,
      decimals: currency.decimals,
      is_active: currency.is_active,
    });
  };

  return (
    <>
      <Head title="Gestión de Divisas" />
      
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Divisas</h1>
            <p className="text-muted-foreground">
              Administra las divisas disponibles en la plataforma
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Divisa
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Divisas</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currencies.length}</div>
              <p className="text-xs text-muted-foreground">
                Registradas en el sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activas</CardTitle>
              <Coins className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {currencies.filter(c => c.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Disponibles para usar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivas</CardTitle>
              <Coins className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {currencies.filter(c => !c.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Deshabilitadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Currencies List */}
        <Card>
          <CardHeader>
            <CardTitle>Divisas Registradas</CardTitle>
            <CardDescription>
              Todas las divisas disponibles en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {currencies.map((currency) => (
                <div key={currency.id} className="p-4 rounded-lg bg-black border border-gray-800 hover:bg-gray-900">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{currency.code}</h3>
                      <Badge className={currency.is_active ? 'bg-green-600' : 'bg-gray-600'}>
                        {currency.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(currency)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleToggle(currency)}>
                        {currency.is_active ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(currency)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">{currency.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Símbolo:</span>
                      <span className="font-semibold">{currency.symbol}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Decimales:</span>
                      <span className="font-semibold">{currency.decimals}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Nueva Divisa</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>Agregar una nueva divisa al sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <Label>Código *</Label>
                    <Input
                      value={addData.code}
                      onChange={(e) => setAddData('code', e.target.value.toUpperCase())}
                      placeholder="USD, EUR, BTC"
                      maxLength={10}
                      required
                    />
                    {addErrors.code && <p className="text-sm text-red-500 mt-1">{addErrors.code}</p>}
                  </div>
                  <div>
                    <Label>Nombre *</Label>
                    <Input
                      value={addData.name}
                      onChange={(e) => setAddData('name', e.target.value)}
                      placeholder="Dólar Estadounidense"
                      required
                    />
                    {addErrors.name && <p className="text-sm text-red-500 mt-1">{addErrors.name}</p>}
                  </div>
                  <div>
                    <Label>Símbolo *</Label>
                    <Input
                      value={addData.symbol}
                      onChange={(e) => setAddData('symbol', e.target.value)}
                      placeholder="$, €, ₿"
                      maxLength={10}
                      required
                    />
                    {addErrors.symbol && <p className="text-sm text-red-500 mt-1">{addErrors.symbol}</p>}
                  </div>
                  <div>
                    <Label>Decimales *</Label>
                    <Input
                      type="number"
                      value={addData.decimals}
                      onChange={(e) => setAddData('decimals', parseInt(e.target.value))}
                      min={0}
                      max={18}
                      required
                    />
                    {addErrors.decimals && <p className="text-sm text-red-500 mt-1">{addErrors.decimals}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={addProcessing}>
                      {addProcessing ? 'Creando...' : 'Crear Divisa'}
                    </Button>
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
        {editingCurrency && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Editar {editingCurrency.code}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setEditingCurrency(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>Modificar información de la divisa</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEdit} className="space-y-4">
                  <div>
                    <Label>Nombre *</Label>
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData('name', e.target.value)}
                      required
                    />
                    {editErrors.name && <p className="text-sm text-red-500 mt-1">{editErrors.name}</p>}
                  </div>
                  <div>
                    <Label>Símbolo *</Label>
                    <Input
                      value={editData.symbol}
                      onChange={(e) => setEditData('symbol', e.target.value)}
                      maxLength={10}
                      required
                    />
                    {editErrors.symbol && <p className="text-sm text-red-500 mt-1">{editErrors.symbol}</p>}
                  </div>
                  <div>
                    <Label>Decimales *</Label>
                    <Input
                      type="number"
                      value={editData.decimals}
                      onChange={(e) => setEditData('decimals', parseInt(e.target.value))}
                      min={0}
                      max={18}
                      required
                    />
                    {editErrors.decimals && <p className="text-sm text-red-500 mt-1">{editErrors.decimals}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={editData.is_active}
                      onChange={(e) => setEditData('is_active', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="is_active">Activa</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={editProcessing}>
                      {editProcessing ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setEditingCurrency(null)}>
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

AdminCurrencies.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default AdminCurrencies;
