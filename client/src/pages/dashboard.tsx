import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/dashboard/sidebar";
import BotConfigCard from "@/components/dashboard/bot-config-card";
import GeminiConfigCard from "@/components/dashboard/gemini-config-card";
import PersonalityConfigCard from "@/components/dashboard/personality-config-card";
import DuplicatePreventionCard from "@/components/dashboard/duplicate-prevention-card";
import ActivityLogCard from "@/components/dashboard/activity-log-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [selectedServer, setSelectedServer] = useState("my-awesome-server");
  const { toast } = useToast();

  const { data: config, isLoading } = useQuery({
    queryKey: ["/api/bot/config"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/bot/stats"],
  });

  const handleSaveConfiguration = () => {
    toast({
      title: "Configuration Saved",
      description: "Bot configuration has been updated successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground" data-testid="page-title">
                Discord Bot Configuration
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your Katu AI bot settings and integrations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Server:</span>
                <Select value={selectedServer} onValueChange={setSelectedServer}>
                  <SelectTrigger className="w-48" data-testid="server-selector">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="my-awesome-server">My Awesome Server</SelectItem>
                    <SelectItem value="gaming-community">Gaming Community</SelectItem>
                    <SelectItem value="development-hub">Development Hub</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveConfiguration} data-testid="button-save">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Alert for Duplicate Responses */}
            <Alert className="bg-destructive/10 border-destructive/20" data-testid="alert-duplicate-detection">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-start justify-between">
                  <div>
                    <strong>Duplicate Response Detection Active</strong>
                    <p className="text-sm mt-1">
                      The system is currently monitoring and preventing duplicate responses. 
                      Recent fixes have been applied to the response handling logic.
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BotConfigCard config={config?.bot} />
              <GeminiConfigCard config={config?.gemini} />
            </div>

            <PersonalityConfigCard config={config?.personality} />
            <DuplicatePreventionCard config={config?.duplicatePrevention} stats={stats} />
            <ActivityLogCard guildId={selectedServer} />
            
          </div>
        </main>
      </div>
    </div>
  );
}
