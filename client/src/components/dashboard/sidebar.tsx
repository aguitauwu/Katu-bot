import { Bot, Brain, MessageSquare, Settings, AlertTriangle, BarChart3, Activity } from "lucide-react";

export default function Sidebar() {
  const navigation = [
    { name: "Dashboard", icon: Activity, href: "#", current: true },
    { name: "AI Configuration", icon: Brain, href: "#", current: false },
    { name: "Conversation Logs", icon: MessageSquare, href: "#", current: false },
    { name: "Bot Settings", icon: Settings, href: "#", current: false },
    { name: "Error Monitoring", icon: AlertTriangle, href: "#", current: false },
    { name: "Analytics", icon: BarChart3, href: "#", current: false },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow bg-card border-r border-border overflow-y-auto">
        {/* Logo/Brand */}
        <div className="flex items-center flex-shrink-0 px-6 py-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground" data-testid="sidebar-title">
                Katu Bot
              </h1>
              <p className="text-xs text-muted-foreground">AI Dashboard</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                }`}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="mr-3 w-4 h-4" />
                {item.name}
              </a>
            );
          })}
        </nav>
        
        {/* Bot Status */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-green-500 rounded-full" data-testid="status-indicator"></div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground" data-testid="status-text">
                Bot Online
              </p>
              <p className="text-xs text-muted-foreground">Last seen: 2 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
