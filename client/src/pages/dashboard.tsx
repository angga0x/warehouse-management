import { Sidebar } from "@/components/layout/sidebar";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { StockChart } from "@/components/dashboard/stock-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts";
import { TopProducts } from "@/components/dashboard/top-products";
import { TransactionModal } from "@/components/forms/transaction-modal";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  return (
    <div className="min-h-full">
      <Sidebar />
      
      <div className="pl-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-sm text-gray-500">Selamat datang kembali, {user?.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </Button>
              
              {/* Quick Actions */}
              <Button 
                onClick={() => setIsTransactionModalOpen(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Transaksi Baru
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="p-6">
          <StatsOverview />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <StockChart />
            </div>
            <TopProducts />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentTransactions />
            <LowStockAlerts />
          </div>
        </main>
      </div>

      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)} 
      />
    </div>
  );
}
