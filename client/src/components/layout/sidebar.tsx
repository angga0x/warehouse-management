import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { 
  Warehouse, 
  BarChart3, 
  Package, 
  ArrowRightLeft, 
  FileSpreadsheet, 
  Brain, 
  Settings, 
  LogOut,
  User,
  RotateCcw,
  Menu
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Produk & Variasi", href: "/products", icon: Package },
  { name: "Transaksi", href: "/transactions", icon: ArrowRightLeft },
  { name: "Return & Cancel", href: "/returns", icon: RotateCcw },
  { name: "Laporan Excel", href: "/reports", icon: FileSpreadsheet },
  { name: "Analisis AI", href: "/analytics", icon: Brain },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

// Mobile menu trigger component
export function MobileMenuTrigger() {
  return (
    <Button variant="ghost" size="sm" className="md:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  );
}

// Sidebar content component (shared between desktop and mobile)
function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
    onItemClick?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center">
          <Warehouse className="h-8 w-8 text-primary-500 mr-3" />
          <h1 className="text-xl font-bold text-gray-900">StockFlow</h1>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="h-5 w-5 text-primary-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  onClick={onItemClick}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer
                    ${isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon 
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} 
                  />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:bg-gray-50"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-3 h-4 w-4 text-gray-400" />
              Logout
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}

export function Sidebar() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="fixed top-2 left-2 z-50 md:hidden p-2 h-8 w-8">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent onItemClick={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200">
      <SidebarContent />
    </div>
  );
}
