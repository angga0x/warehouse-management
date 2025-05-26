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
      
      <div className="lg:pl-64">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex flex-col sm:flex-row h-auto sm:h-16 items-start sm:items-center justify-between px-12 sm:px-6 py-4 sm:py-0 gap-3 sm:gap-0">
            <div className="text-center sm:text-left w-full sm:w-auto">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-sm text-gray-500">Selamat datang kembali, {user?.username}!</p>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">
              {/* Notification Bell */}
              <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-gray-500">
                <Bell className="h-4 w-4" />
                <span className="absolute top-0 right-0 block h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </Button>
              
              {/* Quick Actions */}
              <Button 
                onClick={() => setIsTransactionModalOpen(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white flex-1 sm:flex-none"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Transaksi Baru</span>
                <span className="sm:hidden">Transaksi</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="p-3 md:p-6">
          <StatsOverview />
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="xl:col-span-2">
              <StockChart />
            </div>
            <TopProducts />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
