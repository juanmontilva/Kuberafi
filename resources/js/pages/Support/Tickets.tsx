import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { useAuth } from '@/hooks/use-auth';
import { 
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  ChevronRight,
  Home,
  AlertTriangle
} from 'lucide-react';

interface User {
  id: number;
  name: string;
}

interface ExchangeHouse {
  id: number;
  name: string;
}

interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  type: string;
  priority: string;
  status: string;
  messages_count: number;
  created_by: User;
  assigned_to?: User;
  exchange_house?: ExchangeHouse;
  created_at: string;
}

interface PaginatedTickets {
  data: Ticket[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Stats {
  open: number;
  resolved: number;
  closed: number;
  urgent: number;
}

interface Props {
  tickets: PaginatedTickets;
  stats: Stats;
  currentStatus: string;
}

function Tickets({ tickets, stats, currentStatus }: Props) {
  const { user: auth } = useAuth();
  
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

  const filterByStatus = (status: string) => {
    router.get('/tickets', { status }, { preserveState: true });
  };

  return (
    <>
      <Head title="Soporte - Tickets" />
      
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
          <span className="px-2 py-1 bg-black border border-gray-800 text-gray-300 rounded-md font-medium">
            Soporte
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              {auth.user?.role === 'super_admin' ? 'Gestión de Soporte' : 'Centro de Soporte'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {auth.user?.role === 'super_admin' 
                ? 'Responde y gestiona tickets de soporte' 
                : 'Comunícate con el administrador'}
            </p>
          </div>
          
          {auth.user?.role !== 'super_admin' && (
            <Button asChild>
              <Link href="/tickets/create">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Ticket
              </Link>
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card 
            className="bg-black border-yellow-800 cursor-pointer hover:bg-gray-900/50 transition-colors"
            onClick={() => filterByStatus('open')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Abiertos
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {stats.open}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Tickets activos
              </p>
            </CardContent>
          </Card>

          <Card 
            className="bg-black border-red-800 cursor-pointer hover:bg-gray-900/50 transition-colors"
            onClick={() => filterByStatus('open')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Urgentes
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {stats.urgent}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Requieren atención
              </p>
            </CardContent>
          </Card>

          <Card 
            className="bg-black border-green-800 cursor-pointer hover:bg-gray-900/50 transition-colors"
            onClick={() => filterByStatus('resolved')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Resueltos
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {stats.resolved}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Problemas solucionados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {tickets.total}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Todos los tickets
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={currentStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => filterByStatus('all')}
          >
            Todos
          </Button>
          <Button 
            variant={currentStatus === 'open' ? 'default' : 'outline'}
            size="sm"
            onClick={() => filterByStatus('open')}
          >
            Abiertos
          </Button>
          <Button 
            variant={currentStatus === 'in_progress' ? 'default' : 'outline'}
            size="sm"
            onClick={() => filterByStatus('in_progress')}
          >
            En Progreso
          </Button>
          <Button 
            variant={currentStatus === 'resolved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => filterByStatus('resolved')}
          >
            Resueltos
          </Button>
          <Button 
            variant={currentStatus === 'closed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => filterByStatus('closed')}
          >
            Cerrados
          </Button>
        </div>

        {/* Tickets List */}
        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle>
              {auth.user?.role === 'super_admin' ? 'Todos los Tickets' : 'Mis Tickets'}
            </CardTitle>
            <CardDescription>
              {auth.user?.role === 'super_admin' 
                ? 'Tickets de todas las casas de cambio' 
                : 'Historial de solicitudes de soporte'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.data.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">
                    {auth.user?.role === 'super_admin' 
                      ? 'No hay tickets de soporte aún' 
                      : 'No tienes tickets de soporte'}
                  </p>
                  {auth.user?.role !== 'super_admin' && (
                    <Button asChild>
                      <Link href="/tickets/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Primer Ticket
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                tickets.data.map((ticket) => (
                  <div 
                    key={ticket.id}
                    className="p-4 border border-gray-800 rounded-lg hover:bg-gray-900/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
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
                        
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {ticket.subject}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{getTypeText(ticket.type)}</span>
                          <span>•</span>
                          <span>{ticket.messages_count} mensajes</span>
                          <span>•</span>
                          <span>
                            {new Date(ticket.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/tickets/${ticket.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {tickets.last_page > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800">
                <div className="text-sm text-gray-400">
                  Mostrando {tickets.data.length} de {tickets.total} tickets
                </div>
                <div className="flex gap-2">
                  {tickets.current_page > 1 && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/tickets?page=${tickets.current_page - 1}&status=${currentStatus}`}>
                        Anterior
                      </Link>
                    </Button>
                  )}
                  {tickets.current_page < tickets.last_page && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/tickets?page=${tickets.current_page + 1}&status=${currentStatus}`}>
                        Siguiente
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

Tickets.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default Tickets;
