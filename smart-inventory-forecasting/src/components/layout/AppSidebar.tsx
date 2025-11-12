'use client';

import { LayoutDashboard, Package, Users, FileText, AlertTriangle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Package, label: 'Inventory', path: '/dashboard/inventory' },
  { icon: BarChart3, label: 'Forecasting', path: '/dashboard/forecasting' },
  { icon: AlertTriangle, label: 'Data Cleanup', path: '/dashboard/data-cleanup' },
  { icon: Users, label: 'Vendors', path: '/dashboard/vendors' },
  { icon: FileText, label: 'Purchase Orders', path: '/dashboard/purchase-orders' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
          
          return (
            <Button
              key={item.path}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-start gap-3",
                isActive && "bg-violet-50 text-violet-700 hover:bg-violet-100"
              )}
              onClick={() => router.push(item.path)}
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
