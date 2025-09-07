import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { BotConfig } from "@shared/dashboard-schema";

interface BotConfigCardProps {
  config?: BotConfig;
}

export default function BotConfigCard({ config }: BotConfigCardProps) {
  const [prefix, setPrefix] = useState(config?.prefix || ".k");
  const [enabled, setEnabled] = useState(config?.enabled ?? true);
  const [responseTimeout, setResponseTimeout] = useState(config?.responseTimeout || 30);

  return (
    <Card data-testid="card-bot-config">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Bot Configuration</CardTitle>
          <Badge variant={enabled ? "default" : "secondary"} data-testid="badge-bot-status">
            {enabled ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bot Prefix */}
        <div>
          <Label htmlFor="bot-prefix" className="text-sm font-medium">
            Command Prefix
          </Label>
          <div className="flex items-center space-x-2 mt-2">
            <Input
              id="bot-prefix"
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="w-20"
              data-testid="input-bot-prefix"
            />
            <span className="text-sm text-muted-foreground">(.k help, .k chat, etc.)</span>
          </div>
        </div>
        
        {/* Bot Status */}
        <div className="flex items-center justify-between">
          <Label htmlFor="bot-enabled" className="text-sm font-medium">
            Bot Status
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="bot-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
              data-testid="switch-bot-enabled"
            />
            <span className="text-sm text-muted-foreground">
              {enabled ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        
        {/* Response Timeout */}
        <div>
          <Label htmlFor="response-timeout" className="text-sm font-medium">
            Response Timeout (seconds)
          </Label>
          <Input
            id="response-timeout"
            type="number"
            value={responseTimeout}
            onChange={(e) => setResponseTimeout(Number(e.target.value))}
            min={5}
            max={120}
            className="mt-2"
            data-testid="input-response-timeout"
          />
        </div>
      </CardContent>
    </Card>
  );
}
