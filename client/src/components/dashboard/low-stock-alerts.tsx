import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export function LowStockAlerts() {
  const { data: lowStockItems, isLoading } = useQuery({
    queryKey: ["/api/variations/low-stock"],
  });

  const getVariationDisplay = (variation: any) => {
    const parts = [];
    if (variation.color) parts.push(variation.color);
    if (variation.size) parts.push(variation.size);
    return parts.length > 0 ? parts.join(" - ") : "Default";
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Habis", variant: "destructive" as const };
    if (stock <= minStock / 2) return { label: "Kritis", variant: "destructive" as const };
    if (stock <= minStock) return { label: "Menipis", variant: "secondary" as const };
    return { label: "Normal", variant: "default" as const };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            Peringatan Stok Menipis
            {lowStockItems?.length > 0 && (
              <Badge className="ml-2 bg-orange-100 text-orange-800">
                {lowStockItems.length} Item
              </Badge>
            )}
          </CardTitle>
          <Link href="/products">
            <Button variant="outline" size="sm">
              Lihat Laporan Lengkap
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded mt-1"></div>
                  </div>
                </div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : !lowStockItems || lowStockItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p>No low stock alerts</p>
            <p className="text-sm">All products are well stocked!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lowStockItems.slice(0, 5).map((item: any) => {
              const status = getStockStatus(item.stock, item.minStock);
              return (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className={`h-8 w-8 ${item.stock === 0 ? "bg-red-100" : "bg-orange-100"} rounded-full flex items-center justify-center`}>
                      <AlertTriangle className={`h-4 w-4 ${item.stock === 0 ? "text-red-600" : "text-orange-600"}`} />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getVariationDisplay(item)} • Min: {item.minStock}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${item.stock === 0 ? "text-red-600" : item.stock <= item.minStock / 2 ? "text-red-600" : "text-orange-600"}`}>
                      {item.stock} unit
                    </p>
                    <p className="text-xs text-gray-500">tersisa</p>
                  </div>
                </div>
              );
            })}
            {lowStockItems.length > 5 && (
              <div className="text-center pt-2">
                <Link href="/products">
                  <Button variant="outline" size="sm">
                    Lihat {lowStockItems.length - 5} item lainnya
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
