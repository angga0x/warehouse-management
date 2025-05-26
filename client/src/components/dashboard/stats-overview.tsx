import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";

export function StatsOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Produk",
      value: stats?.totalProducts || 0,
      icon: Package,
      iconBg: "bg-primary-100",
      iconColor: "text-primary-600",
      growth: "+12%",
      growthColor: "text-green-600",
    },
    {
      title: "Stok Menipis",
      value: stats?.lowStockCount || 0,
      icon: AlertTriangle,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      growth: "-5 item",
      growthColor: "text-red-600",
    },
    {
      title: "Stok Masuk Hari Ini",
      value: stats?.todayStockIn || 0,
      icon: ArrowUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      growth: "+28%",
      growthColor: "text-green-600",
    },
    {
      title: "Stok Keluar Hari Ini",
      value: stats?.todayStockOut || 0,
      icon: ArrowDown,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      growth: "-15%",
      growthColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`h-12 w-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`${stat.iconColor} h-6 w-6`} />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  <p className={`text-xs ${stat.growthColor} flex items-center mt-1`}>
                    <ArrowUp className="mr-1 h-3 w-3" />
                    <span>{stat.growth}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
