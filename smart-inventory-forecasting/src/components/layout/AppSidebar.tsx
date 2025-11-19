'use client';

import { LayoutDashboard, Package, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Package, label: 'Inventory', path: '/dashboard/inventory' },
  { icon: Users, label: 'Vendors', path: '/dashboard/vendors' },
  { icon: FileText, label: 'Purchase Orders', path: '/dashboard/purchase-orders' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-11 px-4 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors",
                isActive && "bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800"
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
