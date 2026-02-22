import { Link, useRouterState } from '@tanstack/react-router';
import { Activity, BarChart3, ClipboardList } from 'lucide-react';

export default function BottomNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const navItems = [
    {
      path: '/body-analysis',
      label: 'Body Analysis',
      icon: Activity,
    },
    {
      path: '/fitness-metrics',
      label: 'Fitness Metrics',
      icon: BarChart3,
    },
    {
      path: '/lifestyle-survey',
      label: 'Lifestyle Survey',
      icon: ClipboardList,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
