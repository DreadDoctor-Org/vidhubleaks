import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Video,
  FolderOpen,
  Users,
  Tags,
  MessageSquare,
  Settings,
  BarChart3,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/videos', label: 'Videos', icon: Video },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/tags', label: 'Tags', icon: Tags },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar-background">
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link to="/admin" className="flex items-center gap-2">
          <span className="text-xl font-bold text-gradient">Admin</span>
        </Link>
        <Button asChild variant="ghost" size="icon">
          <Link to="/">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
