import { LayoutDashboard, Package, Users, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { PageType } from './Dashboard';

const navItems: { icon: typeof LayoutDashboard; label: string; page: PageType }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
  { icon: Package, label: 'Inventory', page: 'inventory' },
  { icon: Users, label: 'Vendors', page: 'vendors' },
  { icon: FileText, label: 'Purchase Orders', page: 'purchase-orders' },
];

interface SidebarProps {
  activePage: PageType;
  setActivePage: (page: PageType) => void;
}

export function Sidebar({ activePage, setActivePage }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.label}
              variant={activePage === item.page ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => setActivePage(item.page)}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}