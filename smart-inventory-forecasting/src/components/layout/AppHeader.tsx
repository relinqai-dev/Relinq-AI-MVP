'use client';

import { Bell, Settings, User, Zap, ChevronDown, Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AppHeaderProps {
  selectedStore?: string;
  onStoreChange?: (storeId: string) => void;
}

const stores = [
  { id: 'store-1', name: 'Main Store', location: 'Primary Location' },
  { id: 'store-2', name: 'Store 2', location: 'Secondary Location' },
];

export function AppHeader({ selectedStore = 'store-1', onStoreChange }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const currentStore = stores.find(s => s.id === selectedStore) || stores[0];

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-900">Astra</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onStoreChange && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <span>{currentStore.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Switch Store</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {stores.map((store) => (
                    <DropdownMenuItem
                      key={store.id}
                      onClick={() => onStoreChange(store.id)}
                    >
                      <div className="flex flex-col">
                        <span>{store.name}</span>
                        <span className="text-xs text-slate-500">{store.location}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-violet-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add a new store
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user?.email || 'My Account'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
