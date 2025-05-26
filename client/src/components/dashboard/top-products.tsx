import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { Link } from "wouter";

export function TopProducts() {
  const { data: topProducts, isLoading } = useQuery({
    queryKey: ["/api/dashboard/top-products"],
    queryFn: () => fetch("/api/dashboard/top-products?limit=5").then(res => res.json()),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Produk Terlaris
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded mt-1"></div>
                  </div>
                </div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : !topProducts || topProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p>No sales data available</p>
            <p className="text-sm">Start making transactions to see top products!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topProducts.map((product: any, index: number) => (
              <div key={product.productId} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {product.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {product.totalSold}
                  </p>
                  <p className="text-xs text-gray-500">terjual</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Link href="/products">
          <Button variant="ghost" className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
            Lihat Semua Produk
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
