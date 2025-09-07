import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { PersonalityConfig } from "@shared/dashboard-schema";

interface PersonalityConfigCardProps {
  config?: PersonalityConfig;
}

export default function PersonalityConfigCard({ config }: PersonalityConfigCardProps) {
  const [prompt, setPrompt] = useState(
    config?.prompt || 
    "You are Katu, a friendly and helpful AI assistant with a playful personality. You love to help users with their questions while maintaining a warm and approachable tone. You're knowledgeable but not condescending, and you enjoy making conversations engaging and fun."
  );
  const [style, setStyle] = useState(config?.style || "friendly");
  const [useEmojis, setUseEmojis] = useState(config?.useEmojis ?? true);
  const [rememberContext, setRememberContext] = useState(config?.rememberContext ?? true);
  const [proactive, setProactive] = useState(config?.proactive ?? false);
  const [responseLength, setResponseLength] = useState(config?.responseLength || "medium");

  const handleResetPersonality = () => {
    setPrompt("You are Katu, a friendly and helpful AI assistant with a playful personality. You love to help users with their questions while maintaining a warm and approachable tone. You're knowledgeable but not condescending, and you enjoy making conversations engaging and fun.");
    setStyle("friendly");
    setUseEmojis(true);
    setRememberContext(true);
    setProactive(false);
    setResponseLength("medium");
  };

  return (
    <Card data-testid="card-personality-config">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Katu Personality Settings</CardTitle>
          <Button variant="link" onClick={handleResetPersonality} data-testid="button-reset-personality">
            Reset to Default
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Personality Prompt */}
            <div>
              <Label htmlFor="personality-prompt" className="text-sm font-medium">
                Personality Prompt
              </Label>
              <Textarea
                id="personality-prompt"
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe Katu's personality..."
                className="mt-2 resize-none"
                data-testid="textarea-personality-prompt"
              />
            </div>
            
            {/* Response Style */}
            <div>
              <Label htmlFor="response-style" className="text-sm font-medium">
                Response Style
              </Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="mt-2" data-testid="select-response-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly & Casual</SelectItem>
                  <SelectItem value="professional">Professional & Helpful</SelectItem>
                  <SelectItem value="playful">Playful & Energetic</SelectItem>
                  <SelectItem value="witty">Witty & Humorous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Behavior Settings */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Behavior Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="use-emojis" className="text-sm text-foreground">Use Emojis</Label>
                  <Switch
                    id="use-emojis"
                    checked={useEmojis}
                    onCheckedChange={setUseEmojis}
                    data-testid="switch-use-emojis"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="remember-context" className="text-sm text-foreground">Remember Context</Label>
                  <Switch
                    id="remember-context"
                    checked={rememberContext}
                    onCheckedChange={setRememberContext}
                    data-testid="switch-remember-context"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="proactive" className="text-sm text-foreground">Proactive Responses</Label>
                  <Switch
                    id="proactive"
                    checked={proactive}
                    onCheckedChange={setProactive}
                    data-testid="switch-proactive"
                  />
                </div>
              </div>
            </div>
            
            {/* Response Length */}
            <div>
              <Label htmlFor="response-length" className="text-sm font-medium">
                Preferred Response Length
              </Label>
              <Select value={responseLength} onValueChange={setResponseLength}>
                <SelectTrigger className="mt-2" data-testid="select-response-length">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short & Concise</SelectItem>
                  <SelectItem value="medium">Medium Length</SelectItem>
                  <SelectItem value="detailed">Detailed & Thorough</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
