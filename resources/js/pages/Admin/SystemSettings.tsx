import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { useState, useEffect } from 'react';
import { 
  Settings,
  DollarSign,
  Save,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Setting {
  id: number;
  key: string;
  value: string;
  type: string;
  description: string;
}

interface SettingsGroup {
  [category: string]: Setting[];
}

interface Props {
  settings: SettingsGroup;
}

function SystemSettings({ settings }: Props) {
  const [localSettings, setLocalSettings] = useState<{[key: string]: string}>(() => {
    const initial: {[key: string]: string} = {};
    Object.values(settings).flat().forEach(setting => {
      initial[setting.key] = setting.value;
    });
    return initial;
  });

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Estado de guardado para deshabilitar el botón
  const [saving, setSaving] = useState(false);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification.type) {
      const timer = setTimeout(() => {
        setNotification({ type: null, message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const handleSettingChange = (key: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    const settingsArray = Object.values(settings).flat().map(setting => ({
      key: setting.key,
      value: localSettings[setting.key],
      type: setting.type
    }));

    console.log('Enviando configuraciones:', settingsArray);

    // Usamos router.put y enviamos los datos explícitamente para evitar problemas de estado asíncrono
    setSaving(true);
    router.put('/admin/settings', { settings: settingsArray }, {
      onSuccess: (page) => {
        console.log('Configuraciones guardadas exitosamente');
        showNotification('success', '✅ Configuraciones guardadas exitosamente');
        
        // Recargar después de mostrar la notificación
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
      onError: (errors) => {
        console.error('Error guardando configuraciones:', errors);
        showNotification('error', '❌ Error al guardar configuraciones: ' + JSON.stringify(errors));
      },
      onFinish: () => setSaving(false),
    });
  };

  const handleQuickUpdate = (key: string, newValue: string, type: string) => {
    console.log(`Quick update: ${key} = ${newValue}`);
    
    fetch('/admin/settings/quick-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
      },
      body: JSON.stringify({
        key: key,
        value: newValue,
        type: type
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Respuesta quick update:', data);
      if (data.success) {
        showNotification('success', `✅ ${key} actualizado a ${data.saved_value}`);
        // Actualizar el estado local
        setLocalSettings(prev => ({
          ...prev,
          [key]: data.saved_value
        }));
      } else {
        showNotification('error', '❌ Error en actualización rápida');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showNotification('error', '❌ Error de conexión: ' + error.message);
    });
  };

  const formatLabel = (key: string) => {
    return key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const renderInput = (setting: Setting) => {
    const value = localSettings[setting.key];

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={setting.key}
              checked={value === 'true'}
              onChange={(e) => handleSettingChange(setting.key, e.target.checked.toString())}
              className="rounded border-gray-300"
            />
            <Label htmlFor={setting.key} className="text-sm font-normal">
              {setting.description}
            </Label>
          </div>
        );
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{formatLabel(setting.key)}</Label>
            <Input
              id={setting.key}
              type="number"
              step={setting.key.includes('rate') ? '0.01' : '1'}
              value={value}
              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
              placeholder={setting.description}
            />
            {setting.key.includes('rate') && (
              <p className="text-xs text-muted-foreground">
                Valor en porcentaje (ej: 0.15 para 0.15%)
              </p>
            )}
          </div>
        );
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{formatLabel(setting.key)}</Label>
            <Input
              id={setting.key}
              type="text"
              value={value}
              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
              placeholder={setting.description}
            />
          </div>
        );
    }
  };

  return (
    <>
      <Head title="Configuraciones del Sistema" />
      
      <div className="space-y-6">
        {/* Notification */}
        {notification.type && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification({ type: null, message: '' })}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuraciones del Sistema</h1>
            <p className="text-muted-foreground">
              Gestiona las configuraciones globales de la plataforma Kuberafi
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                const newRate = prompt('Nueva comisión de plataforma:', localSettings['platform_commission_rate']);
                if (newRate && newRate !== localSettings['platform_commission_rate']) {
                  handleQuickUpdate('platform_commission_rate', newRate, 'number');
                }
              }}
              variant="outline"
            >
              Prueba Rápida
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>

        {/* Configuraciones por categoría */}
        {Object.entries(settings).map(([category, categorySettings]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category === 'Platform' && <DollarSign className="h-5 w-5" />}
                {category !== 'Platform' && <Settings className="h-5 w-5" />}
                Configuraciones de {category}
              </CardTitle>
              <CardDescription>
                {category === 'Platform' && 'Configuraciones relacionadas con comisiones y operaciones de la plataforma'}
                {category === 'Max' && 'Límites y restricciones del sistema'}
                {category === 'Maintenance' && 'Configuraciones de mantenimiento'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {categorySettings.map((setting, index) => (
                  <div key={setting.key}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="space-y-2">
                      {renderInput(setting)}
                      {setting.description && setting.type !== 'boolean' && (
                        <p className="text-xs text-muted-foreground">
                          {setting.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Información importante */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-medium text-orange-900">Información Importante</h3>
                <div className="text-sm text-orange-800 space-y-1">
                  <p>• Los cambios en la <strong>tasa de comisión de la plataforma</strong> se aplicarán a todas las nuevas órdenes.</p>
                  <p>• Las órdenes existentes mantendrán la tasa de comisión con la que fueron creadas.</p>
                  <p>• El <strong>modo de mantenimiento</strong> impedirá que las casas de cambio creen nuevas órdenes.</p>
                  <p>• Los cambios se guardan inmediatamente al hacer clic en "Guardar Cambios".</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de configuraciones actuales */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Configuraciones Actuales</CardTitle>
            <CardDescription>
              Vista rápida de las configuraciones más importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Comisión de Plataforma</p>
                <p className="text-2xl font-bold text-green-600">
                  {localSettings['platform_commission_rate']}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Por cada transacción
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Órdenes Máximas Diarias</p>
                <p className="text-2xl font-bold">
                  {localSettings['max_daily_orders']}
                </p>
                <p className="text-xs text-muted-foreground">
                  Por casa de cambio
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Estado del Sistema</p>
                <p className={`text-2xl font-bold ${localSettings['maintenance_mode'] === 'true' ? 'text-red-600' : 'text-green-600'}`}>
                  {localSettings['maintenance_mode'] === 'true' ? 'Mantenimiento' : 'Operativo'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Estado actual
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

SystemSettings.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default SystemSettings;