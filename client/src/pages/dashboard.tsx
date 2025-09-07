import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Separator } from '@/components/ui/separator';
import { Activity, Users, MessageCircle, Crown, Clock, Server, Zap } from 'lucide-react';

interface BotInfo {
  name: string;
  id: string;
  tag: string;
  guilds: number;
  users: number;
  uptime: number;
  status: string;
}

interface BotStats {
  messagesToday: number;
  activeUsers: number;
  peakHour: string;
  servers: number;
  uptime: string;
  totalProcessed: number;
}

function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: botInfo, isLoading } = useQuery<BotInfo>({
    queryKey: ['/api/bot/info'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string): string => {
    return status === 'online' ? 'bg-green-500' : 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando dashboard de Katu Bot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                K
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard de Katu Bot
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Bot contador de mensajes diarios con sistema de ranking
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(botInfo?.status || 'offline')}`}></div>
              <Badge variant={botInfo?.status === 'online' ? 'default' : 'secondary'}>
                {botInfo?.status === 'online' ? 'En línea' : 'Desconectado'}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentTime.toLocaleString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Servidores</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{botInfo?.guilds || 0}</div>
              <p className="text-xs text-muted-foreground">
                Servidores activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{botInfo?.users?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                Usuarios totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{botInfo ? formatUptime(botInfo.uptime) : '0m'}</div>
              <p className="text-xs text-muted-foreground">
                Tiempo activo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Activo</div>
              <p className="text-xs text-muted-foreground">
                Contando mensajes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bot Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Información del Bot
              </CardTitle>
              <CardDescription>
                Detalles y configuración actual del bot Katu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Nombre:</span>
                  <span>{botInfo?.name || 'Katu Bot'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tag:</span>
                  <span className="font-mono text-sm">{botInfo?.tag || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">ID:</span>
                  <span className="font-mono text-sm">{botInfo?.id || 'N/A'}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Prefijo:</span>
                  <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">!</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Reset diario:</span>
                  <span>00:00 UTC</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Comandos Disponibles
              </CardTitle>
              <CardDescription>
                Lista de comandos que los usuarios pueden usar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-2">👥 Para usuarios:</h4>
                  <div className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                    <div><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">!ranking</code> - Top usuarios del día</div>
                    <div><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">!mystats</code> - Tus estadísticas</div>
                    <div><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">!stats @user</code> - Stats de otro usuario</div>
                    <div><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">!help</code> - Mostrar ayuda</div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm mb-2">⚙️ Para admins:</h4>
                  <div className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                    <div><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">!setlog #canal</code> - Configurar logs</div>
                    <div><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">!removelog</code> - Desactivar logs</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Instrucciones de Uso
            </CardTitle>
            <CardDescription>
              Cómo configurar y usar el bot en tu servidor de Discord
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">🚀 Configuración inicial:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>Invita el bot a tu servidor con permisos de lectura de mensajes</li>
                  <li>Configura un canal de logs (opcional): <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">!setlog #bot-logs</code></li>
                  <li>El bot comenzará a contar mensajes automáticamente</li>
                  <li>Los datos se resetean cada día a medianoche UTC</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-3">📊 Características:</h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>Conteo automático de mensajes diarios</li>
                  <li>Ranking de top 100 usuarios más activos</li>
                  <li>Estadísticas personales y de otros usuarios</li>
                  <li>Logs configurables para administradores</li>
                  <li>Reset automático diario a las 00:00 UTC</li>
                  <li>Funciona 24/7 sin interrupciones</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Dashboard de Katu Bot - Powered by Replit • Actualizado cada 30 segundos</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;