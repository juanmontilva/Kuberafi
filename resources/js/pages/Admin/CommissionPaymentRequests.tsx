import { Head, Link, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { useState } from 'react';
import { 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  AlertCircle,
  ArrowLeft,
  Plus,
  Eye,
  Building2
} from 'lucide-react';

interface PaymentRequest {
  id: number;
  exchange_house: {
    id: number;
    name: string;
  };
  period_start: string;
  period_end: string;
  total_commissions: string;
  total_orders: number;
  total_volume: string;
  status: string;
  payment_method?: string;
  payment_reference?: string;
  payment_proof?: string;
  payment_sent_at?: string;
  confirmed_at?: string;
  confirmed_by?: {
    name: string;
  };
  rejection_reason?: string;
  created_at: string;
}

interface ExchangeHouse {
  id: number;
  name: string;
}

interface Stats {
  pending: number;
  payment_info_sent: number;
  paid: number;
  total_pending_amount: number;
}

interface Props {
  requests: {
    data: PaymentRequest[];
    current_page: number;
    last_page: number;
  };
  stats: Stats;
  currentStatus: string;
  currentExchangeHouse?: string;
  exchangeHouses?: ExchangeHouse[];
}

function CommissionPaymentRequests({ requests, stats, currentStatus, currentExchangeHouse, exchangeHouses = [] }: Props) {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const { data: generateData, setData: setGenerateData, post: postGenerate, processing: generatingProcessing, errors: generateErrors, reset: resetGenerate } = useForm({
    exchange_house_id: '',
    period_start: '',
    period_end: '',
  });

  const { data: confirmData, setData: setConfirmData, post: postConfirm, processing: confirmProcessing, reset: resetConfirm } = useForm({
    admin_notes: '',
  });

  const { data: rejectData, setData: setRejectData, post: postReject, processing: rejectProcessing, reset: resetReject } = useForm({
    rejection_reason: '',
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    postGenerate('/admin/commission-requests/generate', {
      onSuccess: () => {
        resetGenerate();
        setIsGenerateDialogOpen(false);
      },
    });
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    postConfirm(`/admin/commission-requests/${selectedRequest.id}/confirm`, {
      onSuccess: () => {
        resetConfirm();
        setIsConfirmDialogOpen(false);
        setSelectedRequest(null);
      },
    });
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    postReject(`/admin/commission-requests/${selectedRequest.id}/reject`, {
      onSuccess: () => {
        resetReject();
        setIsRejectDialogOpen(false);
        setSelectedRequest(null);
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'payment_info_sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'payment_info_sent': return 'Info Enviada';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'payment_info_sent': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <>
      <Head title="Solicitudes de Pago de Comisiones" />
      
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-4xl font-bold tracking-tight">
                Solicitudes de Pago de Comisiones
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Gestiona las solicitudes de pago de las casas de cambio
            </p>
          </div>
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generar Solicitud
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Generar Solicitud de Pago</DialogTitle>
                <DialogDescription>
                  Crea una solicitud de pago para una casa de cambio
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exchange_house_id">Casa de Cambio *</Label>
                  <Select 
                    value={generateData.exchange_house_id} 
                    onValueChange={(value) => setGenerateData('exchange_house_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una casa de cambio" />
                    </SelectTrigger>
                    <SelectContent>
                      {exchangeHouses.map((house) => (
                        <SelectItem key={house.id} value={house.id.toString()}>
                          {house.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {generateErrors.exchange_house_id && (
                    <p className="text-sm text-red-600">{generateErrors.exchange_house_id}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="period_start">Fecha Inicio *</Label>
                    <Input
                      id="period_start"
                      type="date"
                      value={generateData.period_start}
                      onChange={(e) => setGenerateData('period_start', e.target.value)}
                    />
                    {generateErrors.period_start && (
                      <p className="text-sm text-red-600">{generateErrors.period_start}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="period_end">Fecha Fin *</Label>
                    <Input
                      id="period_end"
                      type="date"
                      value={generateData.period_end}
                      onChange={(e) => setGenerateData('period_end', e.target.value)}
                    />
                    {generateErrors.period_end && (
                      <p className="text-sm text-red-600">{generateErrors.period_end}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsGenerateDialogOpen(false);
                      resetGenerate();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={generatingProcessing}>
                    {generatingProcessing ? 'Generando...' : 'Generar Solicitud'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Info Enviada</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.payment_info_sent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paid}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monto Pendiente</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(stats.total_pending_amount || 0).toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Filtrar por Estado</Label>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={currentStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href="/admin/commission-requests?status=all">Todas</Link>
              </Button>
              <Button
                variant={currentStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href="/admin/commission-requests?status=pending">Pendientes</Link>
              </Button>
              <Button
                variant={currentStatus === 'payment_info_sent' ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href="/admin/commission-requests?status=payment_info_sent">Info Enviada</Link>
              </Button>
              <Button
                variant={currentStatus === 'paid' ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href="/admin/commission-requests?status=paid">Pagados</Link>
              </Button>
            </div>
          </div>

          {exchangeHouses.length > 0 && (
            <div>
              <Label htmlFor="exchange_house_filter" className="text-sm font-medium mb-2 block">
                Filtrar por Casa de Cambio
              </Label>
              <Select 
                value={currentExchangeHouse || 'all'} 
                onValueChange={(value) => {
                  const url = new URL(window.location.href);
                  if (value === 'all') {
                    url.searchParams.delete('exchange_house');
                  } else {
                    url.searchParams.set('exchange_house', value);
                  }
                  window.location.href = url.toString();
                }}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Todas las casas de cambio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las casas de cambio</SelectItem>
                  {exchangeHouses.map((house) => (
                    <SelectItem key={house.id} value={house.id.toString()}>
                      {house.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Lista de Solicitudes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Solicitudes de Pago
            </CardTitle>
            <CardDescription>
              Todas las solicitudes de pago de comisiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requests.data.length > 0 ? (
              <div className="space-y-4">
                {requests.data.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{getStatusText(request.status)}</span>
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{request.exchange_house.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">${request.total_commissions}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{request.total_orders} órdenes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(request.period_start).toLocaleDateString()} - {new Date(request.period_end).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {request.payment_method && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Método:</span> {request.payment_method}
                          {request.payment_reference && (
                            <span className="ml-2">
                              <span className="text-muted-foreground">Ref:</span> {request.payment_reference}
                            </span>
                          )}
                        </div>
                      )}

                      {request.payment_proof && (
                        <div className="text-sm">
                          {/* Solo mostrar botón si es una URL válida */}
                          {(request.payment_proof.startsWith('http') || request.payment_proof.startsWith('data:image')) ? (
                            <Button
                              size="sm"
                              variant="link"
                              className="h-auto p-0 text-blue-600"
                              onClick={() => {
                                // Si es base64, abrir en nueva ventana
                                if (request.payment_proof.startsWith('data:image')) {
                                  const win = window.open();
                                  if (win) {
                                    win.document.write(`<img src="${request.payment_proof}" style="max-width:100%"/>`);
                                  }
                                } else {
                                  // Si es URL, abrir directamente
                                  window.open(request.payment_proof, '_blank');
                                }
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver comprobante
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              Comprobante: {request.payment_proof}
                            </span>
                          )}
                        </div>
                      )}

                      {request.rejection_reason && (
                        <p className="text-xs text-red-600">
                          Motivo de rechazo: {request.rejection_reason}
                        </p>
                      )}

                      {request.confirmed_at && request.confirmed_by && (
                        <p className="text-xs text-green-600">
                          Confirmado por {request.confirmed_by.name} el {new Date(request.confirmed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <Link href={`/admin/commission-requests/${request.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Operaciones
                        </Link>
                      </Button>
                      {request.status === 'payment_info_sent' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsConfirmDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsRejectDialogOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay solicitudes de pago</h3>
                <p className="text-muted-foreground mb-4">
                  Genera solicitudes de pago para las casas de cambio
                </p>
                <Button onClick={() => setIsGenerateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generar Primera Solicitud
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Confirmación */}
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Confirmar Pago</DialogTitle>
              <DialogDescription>
                Confirma que has recibido el pago de {selectedRequest?.exchange_house.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleConfirm} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin_notes">Notas (Opcional)</Label>
                <Textarea
                  id="admin_notes"
                  placeholder="Notas adicionales sobre el pago..."
                  value={confirmData.admin_notes}
                  onChange={(e) => setConfirmData('admin_notes', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsConfirmDialogOpen(false);
                    setSelectedRequest(null);
                    resetConfirm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={confirmProcessing}>
                  {confirmProcessing ? 'Confirmando...' : 'Confirmar Pago'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Rechazo */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Rechazar Pago</DialogTitle>
              <DialogDescription>
                Indica el motivo del rechazo para {selectedRequest?.exchange_house.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleReject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejection_reason">Motivo del Rechazo *</Label>
                <Textarea
                  id="rejection_reason"
                  placeholder="Explica por qué se rechaza el pago..."
                  value={rejectData.rejection_reason}
                  onChange={(e) => setRejectData('rejection_reason', e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsRejectDialogOpen(false);
                    setSelectedRequest(null);
                    resetReject();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="destructive" disabled={rejectProcessing}>
                  {rejectProcessing ? 'Rechazando...' : 'Rechazar Pago'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

CommissionPaymentRequests.layout = (page: React.ReactElement) => (
  <KuberafiLayout>{page}</KuberafiLayout>
);

export default CommissionPaymentRequests;
