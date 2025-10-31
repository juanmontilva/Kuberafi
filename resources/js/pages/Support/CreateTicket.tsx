import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
  ArrowLeft,
  Save,
  MessageSquare,
  ChevronRight,
  Home,
  AlertCircle,
  Info
} from 'lucide-react';
import { FormEventHandler } from 'react';

function CreateTicket() {
  const { data, setData, post, processing, errors } = useForm({
    subject: '',
    description: '',
    type: '',
    priority: 'normal',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/tickets');
  };

  const typeOptions = [
    { value: 'technical', label: 'Técnico', description: 'Problemas con la plataforma' },
    { value: 'billing', label: 'Facturación', description: 'Consultas sobre pagos y comisiones' },
    { value: 'general', label: 'General', description: 'Consultas generales' },
    { value: 'feature_request', label: 'Solicitud de Función', description: 'Sugerencias de mejora' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baja', color: 'text-gray-400' },
    { value: 'normal', label: 'Normal', color: 'text-blue-400' },
    { value: 'high', label: 'Alta', color: 'text-orange-400' },
    { value: 'urgent', label: 'Urgente', color: 'text-red-400' },
  ];

  return (
    <>
      <Head title="Crear Ticket de Soporte" />
      
      <div className="space-y-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm">
          <Link 
            href="/dashboard" 
            className="flex items-center px-2 py-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4 mr-1" />
            Inicio
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Link 
            href="/tickets" 
            className="flex items-center px-2 py-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Soporte
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="px-2 py-1 bg-black border border-gray-800 text-gray-300 rounded-md font-medium">
            Nuevo Ticket
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="h-10 w-10 p-0">
                <Link href="/tickets">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                  Crear Ticket de Soporte
                </h1>
                <p className="text-muted-foreground text-lg">
                  Describe tu problema o consulta
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="bg-black border-blue-800">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            Nuestro equipo de soporte responderá tu ticket lo antes posible. 
            Los tickets urgentes tienen prioridad y son atendidos primero.
          </AlertDescription>
        </Alert>

        {/* Form */}
        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Información del Ticket */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Información del Ticket
                </CardTitle>
                <CardDescription>
                  Proporciona detalles sobre tu problema o consulta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto *</Label>
                  <Input
                    id="subject"
                    value={data.subject}
                    onChange={(e) => setData('subject', e.target.value)}
                    className={errors.subject ? 'border-red-500' : ''}
                    placeholder="Ej: No puedo ver mis comisiones"
                    maxLength={255}
                  />
                  {errors.subject && (
                    <p className="text-sm text-red-500">{errors.subject}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {data.subject.length}/255 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción Detallada *</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className={`min-h-[150px] ${errors.description ? 'border-red-500' : ''}`}
                    placeholder="Describe tu problema con el mayor detalle posible. Incluye pasos para reproducir el error si aplica."
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Sé lo más específico posible para que podamos ayudarte mejor
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tipo de Problema */}
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Problema</CardTitle>
                <CardDescription>
                  Selecciona la categoría que mejor describe tu consulta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <select
                    id="type"
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value)}
                    className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.type ? 'border-red-500' : ''}`}
                  >
                    <option value="">Seleccionar tipo...</option>
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-sm text-red-500">{errors.type}</p>
                  )}
                </div>

                {data.type && (
                  <div className="p-3 bg-black border border-gray-800 rounded-lg">
                    <p className="text-sm text-gray-300">
                      {typeOptions.find(t => t.value === data.type)?.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prioridad */}
            <Card>
              <CardHeader>
                <CardTitle>Prioridad</CardTitle>
                <CardDescription>
                  ¿Qué tan urgente es tu problema?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Nivel de Prioridad *</Label>
                  <select
                    id="priority"
                    value={data.priority}
                    onChange={(e) => setData('priority', e.target.value)}
                    className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.priority ? 'border-red-500' : ''}`}
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.priority && (
                    <p className="text-sm text-red-500">{errors.priority}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-black border border-gray-800 rounded-lg">
                    <p className="text-sm font-medium text-gray-300 mb-2">
                      Guía de Prioridades:
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="text-red-400">●</span>
                        <span><strong>Urgente:</strong> Sistema caído o error crítico</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-orange-400">●</span>
                        <span><strong>Alta:</strong> Problema que afecta operaciones</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-400">●</span>
                        <span><strong>Normal:</strong> Consulta o problema menor</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-gray-400">●</span>
                        <span><strong>Baja:</strong> Sugerencia o pregunta general</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button variant="outline" asChild>
              <Link href="/tickets">
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={processing}>
              <Save className="h-4 w-4 mr-2" />
              {processing ? 'Creando...' : 'Crear Ticket'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

CreateTicket.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default CreateTicket;
