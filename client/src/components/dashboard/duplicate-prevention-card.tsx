import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { DuplicatePreventionConfig, BotStats } from "@shared/dashboard-schema";

interface DuplicatePreventionCardProps {
  config?: DuplicatePreventionConfig;
  stats?: BotStats;
}

export default function DuplicatePreventionCard({ config, stats }: DuplicatePreventionCardProps) {
  const [enabled, setEnabled] = useState(config?.enabled ?? true);
  const [windowMinutes, setWindowMinutes] = useState(config?.windowMinutes || 5);
  const [threshold, setThreshold] = useState(config?.threshold || 85);

  const recentActivity = [
    { time: "14:23", action: "Prevented duplicate", status: "Blocked" },
    { time: "14:18", action: "Prevented duplicate", status: "Blocked" },
    { time: "14:12", action: "Prevented duplicate", status: "Blocked" },
  ];

  return (
    <Card data-testid="card-duplicate-prevention">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Duplicate Response Prevention</CardTitle>
          <Badge variant={enabled ? "default" : "secondary"} data-testid="badge-prevention-status">
            {enabled ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Detection Settings */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Detection Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-prevention" className="text-sm text-foreground">
                    Enable Prevention
                  </Label>
                  <Switch
                    id="enable-prevention"
                    checked={enabled}
                    onCheckedChange={setEnabled}
                    data-testid="switch-enable-prevention"
                  />
                </div>
                
                <div>
                  <Label htmlFor="window-minutes" className="text-sm font-medium">
                    Detection Window (minutes)
                  </Label>
                  <Input
                    id="window-minutes"
                    type="number"
                    value={windowMinutes}
                    onChange={(e) => setWindowMinutes(Number(e.target.value))}
                    min={1}
                    max={60}
                    className="mt-2"
                    data-testid="input-window-minutes"
                  />
                </div>
                
                <div>
                  <Label htmlFor="threshold" className="text-sm font-medium">
                    Similarity Threshold (%)
                  </Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    min={50}
                    max={100}
                    className="mt-2"
                    data-testid="input-threshold"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Recent Activity */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Recent Activity</h4>
              <div className="space-y-2">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                    data-testid={`activity-item-${index}`}
                  >
                    <span className="text-foreground">{activity.action} at {activity.time}</span>
                    <span className="text-green-500 text-xs">{activity.status}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded">
                <div className="text-2xl font-bold text-foreground" data-testid="stat-duplicates-blocked">
                  {stats?.duplicatesBlocked || 23}
                </div>
                <div className="text-xs text-muted-foreground">Duplicates Blocked</div>
              </div>
              <div className="text-center p-3 bg-muted rounded">
                <div className="text-2xl font-bold text-foreground" data-testid="stat-success-rate">
                  {stats?.successRate || 99.2}%
                </div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
