import { Head, Link, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { useAuth } from '@/hooks/use-auth';
import { 
  ArrowLeft,
  Send,
  MessageSquare,
  ChevronRight,
  Home,
  User,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { FormEventHandler } from 'react';

interface User {
  id: number;
  name: string;
  role: string;
}

interface ExchangeHouse {
  id: number;
  name: string;
}

interface Message {
  id: number;
  user: User;
  message: string;
  created_at: string;
  is_internal: boolean;
}

interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  created_by: User;
  assigned_to?: User;
  exchange_house?: ExchangeHouse;
  messages: Message[];
  created_at: string;
}

interface Props {
  ticket: Ticket;
}

function TicketDetail({ ticket }: Props) {
  const { user, isSuperAdmin } = useAuth();
  const { data, setData, post, processing, reset } = useForm({
    message: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(`/tickets/${ticket.id}/messages`, {
      onSuccess: () => reset(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-black text-yellow-400 border border-yellow-700';
      case 'in_progress': return 'bg-black text-blue-400 border border-blue-700';
      case 'waiting_response': return 'bg-black text-orange-400 border border-orange-700';
      case 'resolved': return 'bg-black text-green-400 border border-green-700';
      case 'closed': return 'bg-black text-gray-400 border border-gray-700';
      default: return 'bg-black text-gray-300 border border-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Abierto';
      case 'in_progress': return 'En Progreso';
      case 'waiting_response': return 'Esperando Respuesta';
      case 'resolved': return 'Resuelto';
      case 'closed': return 'Cerrado';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-900/50 text-red-400 border border-red-700';
      case 'high': return 'bg-orange-900/50 text-orange-400 border border-orange-700';
      case 'normal': return 'bg-blue-900/50 text-blue-400 border border-blue-700';
      case 'low': return 'bg-gray-900/50 text-gray-400 border border-gray-700';
      default: return 'bg-black text-gray-300 border border-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'normal': return 'Normal';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'technical': return 'Técnico';
      case 'billing': return 'Facturación';
      case 'general': return 'General';
      case 'feature_request': return 'Solicitud de Función';
      default: return type;
    }
  };

  return (
    <>
      <Head title={`Ticket ${ticket.ticket_number}`} />
      
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
            {ticket.ticket_number}
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="h-10 w-10 p-0">
                <Link href="/tickets">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-gray-400">
                    {ticket.ticket_number}
                  </span>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {getPriorityText(ticket.priority)}
                  </Badge>
                  <Badge className={getStatusColor(ticket.status)}>
                    {getStatusText(ticket.status)}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {ticket.subject}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {ticket.created_by.name}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(ticket.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <span>•</span>
                  <span>{getTypeText(ticket.type)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {ticket.status === 'open' && (
          <Alert className="bg-black border-green-800">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-200">
              Tu ticket ha sido creado exitosamente. Nuestro equipo lo revisará pronto.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Conversación */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descripción Original */}
            <Card className="bg-black border-gray-800">
              <CardHeader>
                <CardTitle>Descripción del Problema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Mensajes */}
            {ticket.messages && ticket.messages.length > 0 && (
              <Card className="bg-black border-gray-800">
                <CardHeader>
                  <CardTitle>Conversación</CardTitle>
                  <CardDescription>
                    {ticket.messages.length} mensajes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ticket.messages.map((message) => (
                      <div 
                        key={message.id}
                        className={`p-4 rounded-lg border ${
                          message.user.role === 'super_admin'
                            ? 'bg-blue-900/20 border-blue-800'
                            : 'bg-gray-900/50 border-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-white">
                            {message.user.name}
                          </span>
                          {message.user.role === 'super_admin' && (
                            <Badge className="bg-blue-900/50 text-blue-400 border border-blue-700">
                              Administrador
                            </Badge>
                          )}
                          <span className="text-xs text-gray-400 ml-auto">
                            {new Date(message.created_at).toLocaleString('es-ES')}
                          </span>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap">
                          {message.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Formulario de Respuesta */}
            {ticket.status !== 'closed' && (
              <Card className="bg-black border-gray-800">
                <CardHeader>
                  <CardTitle>Agregar Mensaje</CardTitle>
                  <CardDescription>
                    Responde o agrega información adicional
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submit} className="space-y-4">
                    <Textarea
                      value={data.message}
                      onChange={(e) => setData('message', e.target.value)}
                      placeholder="Escribe tu mensaje aquí..."
                      className="min-h-[120px]"
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={processing || !data.message.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        {processing ? 'Enviando...' : 'Enviar Mensaje'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Información del Ticket */}
          <div className="space-y-6">
            {/* Acciones del Admin */}
            {isSuperAdmin && ticket.status !== 'closed' && (
              <Card className="bg-black border-blue-800">
                <CardHeader>
                  <CardTitle>Acciones de Administrador</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ticket.status === 'open' && (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        if (confirm('¿Marcar este ticket como "En Progreso"?')) {
                          router.post(`/tickets/${ticket.id}/status`, { status: 'in_progress' });
                        }
                      }}
                    >
                      Marcar En Progreso
                    </Button>
                  )}
                  
                  {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        if (confirm('¿Marcar este ticket como "Resuelto"?')) {
                          router.post(`/tickets/${ticket.id}/status`, { status: 'resolved' });
                        }
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Resuelto
                    </Button>
                  )}
                  
                  {ticket.status === 'resolved' && (
                    <Button 
                      className="w-full bg-gray-600 hover:bg-gray-700"
                      onClick={() => {
                        if (confirm('¿Cerrar este ticket definitivamente?')) {
                          router.post(`/tickets/${ticket.id}/close`);
                        }
                      }}
                    >
                      Cerrar Ticket
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Acciones del Usuario */}
            {!isSuperAdmin && ticket.status === 'resolved' && (
              <Card className="bg-black border-green-800">
                <CardHeader>
                  <CardTitle>¿Problema Resuelto?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-300">
                    El administrador ha marcado este ticket como resuelto. 
                    Si tu problema está solucionado, puedes cerrar el ticket.
                  </p>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      if (confirm('¿Confirmas que tu problema está resuelto?')) {
                        router.post(`/tickets/${ticket.id}/close`);
                      }
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Sí, Cerrar Ticket
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (confirm('¿Reabrir el ticket?')) {
                        router.post(`/tickets/${ticket.id}/status`, { status: 'open' });
                      }
                    }}
                  >
                    No, Aún Tengo Problemas
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="bg-black border-gray-800">
              <CardHeader>
                <CardTitle>Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Estado</p>
                  <Badge className={getStatusColor(ticket.status)}>
                    {getStatusText(ticket.status)}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Prioridad</p>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {getPriorityText(ticket.priority)}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Tipo</p>
                  <p className="text-white">{getTypeText(ticket.type)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Creado por</p>
                  <p className="text-white">{ticket.created_by.name}</p>
                </div>

                {ticket.exchange_house && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Casa de Cambio</p>
                    <p className="text-white">{ticket.exchange_house.name}</p>
                  </div>
                )}

                {ticket.assigned_to && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Asignado a</p>
                    <p className="text-white">{ticket.assigned_to.name}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-400 mb-1">Creado</p>
                  <p className="text-white">
                    {new Date(ticket.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {ticket.status === 'open' && !isSuperAdmin && (
              <Alert className="bg-black border-yellow-800">
                <Clock className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-200">
                  Tu ticket está en cola. Te responderemos lo antes posible.
                </AlertDescription>
              </Alert>
            )}
            
            {ticket.status === 'resolved' && !isSuperAdmin && (
              <Alert className="bg-black border-green-800">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200">
                  Este ticket ha sido marcado como resuelto. Si tu problema persiste, puedes reabrirlo.
                </AlertDescription>
              </Alert>
            )}
            
            {ticket.status === 'closed' && (
              <Alert className="bg-black border-gray-800">
                <CheckCircle className="h-4 w-4 text-gray-400" />
                <AlertDescription className="text-gray-300">
                  Este ticket está cerrado. Si necesitas ayuda adicional, crea un nuevo ticket.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

TicketDetail.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default TicketDetail;
