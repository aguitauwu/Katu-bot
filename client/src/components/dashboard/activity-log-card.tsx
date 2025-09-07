import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, RefreshCw } from "lucide-react";
import type { ActivityLogEntry } from "@shared/dashboard-schema";

interface ActivityLogCardProps {
  guildId: string;
}

export default function ActivityLogCard({ guildId }: ActivityLogCardProps) {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([
    {
      timestamp: new Date("2024-01-15T14:23:45Z"),
      level: "INFO",
      message: 'User message received: ".k what is the weather today?"'
    },
    {
      timestamp: new Date("2024-01-15T14:23:46Z"),
      level: "AI",
      message: "Gemini API request sent with Katu personality"
    },
    {
      timestamp: new Date("2024-01-15T14:23:47Z"),
      level: "SUCCESS",
      message: "Response sent to Discord channel #general"
    },
    {
      timestamp: new Date("2024-01-15T14:23:48Z"),
      level: "DUPLICATE",
      message: "Duplicate response detected and blocked"
    },
    {
      timestamp: new Date("2024-01-15T14:22:15Z"),
      level: "INFO",
      message: 'Bot prefix changed to ".k"'
    },
    {
      timestamp: new Date("2024-01-15T14:21:33Z"),
      level: "AI",
      message: "Personality settings updated"
    },
    {
      timestamp: new Date("2024-01-15T14:20:12Z"),
      level: "SUCCESS",
      message: "Gemini API connection established"
    },
  ]);

  const { data: activityData, refetch } = useQuery({
    queryKey: ["/api/bot/activity", guildId],
    enabled: !!guildId,
  });

  const getLevelColor = (level: ActivityLogEntry["level"]) => {
    switch (level) {
      case "SUCCESS":
        return "text-green-400";
      case "ERROR":
        return "text-red-400";
      case "WARN":
        return "text-yellow-400";
      case "AI":
        return "text-blue-400";
      case "DUPLICATE":
        return "text-orange-400";
      default:
        return "text-green-400";
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleClearLog = () => {
    setLogs([]);
  };

  const handleRefreshLog = () => {
    refetch();
  };

  return (
    <Card data-testid="card-activity-log">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Real-time Activity Log</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearLog}
              data-testid="button-clear-log"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshLog}
              data-testid="button-refresh-log"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="bg-muted rounded-lg p-4 h-64 font-mono text-sm">
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start space-x-2" data-testid={`log-entry-${index}`}>
                <span className="text-muted-foreground text-xs whitespace-nowrap">
                  {formatTime(log.timestamp)}
                </span>
                <span className={`${getLevelColor(log.level)} font-semibold`}>
                  [{log.level}]
                </span>
                <span className="text-foreground">{log.message}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
