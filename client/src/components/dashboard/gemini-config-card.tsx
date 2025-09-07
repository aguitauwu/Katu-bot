import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import type { GeminiConfig } from "@shared/dashboard-schema";

interface GeminiConfigCardProps {
  config?: GeminiConfig;
}

export default function GeminiConfigCard({ config }: GeminiConfigCardProps) {
  const [model, setModel] = useState(config?.model || "gemini-2.5-flash");
  const [temperature, setTemperature] = useState([config?.temperature || 0.7]);
  const [maxTokens, setMaxTokens] = useState(config?.maxTokens || 1000);

  return (
    <Card data-testid="card-gemini-config">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Google Gemini AI</CardTitle>
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Status */}
        <div className="flex items-center space-x-3 p-3 bg-muted rounded-md">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <div>
            <p className="text-sm font-medium text-foreground" data-testid="text-api-status">
              API Connection Active
            </p>
            <p className="text-xs text-muted-foreground">Last verified: 5 minutes ago</p>
          </div>
        </div>
        
        {/* Model Selection */}
        <div>
          <Label htmlFor="gemini-model" className="text-sm font-medium">
            AI Model
          </Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="mt-2" data-testid="select-gemini-model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
              <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Temperature */}
        <div>
          <Label className="text-sm font-medium">
            Creativity Level: <span className="text-primary font-semibold" data-testid="text-temperature-value">{temperature[0]}</span>
          </Label>
          <Slider
            value={temperature}
            onValueChange={setTemperature}
            max={1}
            min={0}
            step={0.1}
            className="mt-2"
            data-testid="slider-temperature"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Conservative</span>
            <span>Creative</span>
          </div>
        </div>
        
        {/* Max Tokens */}
        <div>
          <Label htmlFor="max-tokens" className="text-sm font-medium">
            Max Response Length
          </Label>
          <Input
            id="max-tokens"
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
            min={100}
            max={4000}
            className="mt-2"
            data-testid="input-max-tokens"
          />
        </div>
      </CardContent>
    </Card>
  );
}
