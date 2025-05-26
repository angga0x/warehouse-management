import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export function RecentTransactions() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions/recent"],
    queryFn: () => fetch("/api/transactions/recent?limit=5").then(res => res.json()),
  });

  const getVariationDisplay = (variation: any) => {
    const parts = [];
    if (variation?.color) parts.push(variation.color);
    if (variation?.size) parts.push(variation.size);
    return parts.length > 0 ? ` - ${parts.join(" ")}` : "";
  };

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: id 
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Transaksi Terbaru
          </CardTitle>
          <Link href="/transactions">
            <Button variant="outline" size="sm">
              Lihat Semua
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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
        ) : transactions?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent transactions found
          </div>
        ) : (
          <div className="space-y-4">
            {transactions?.map((transaction: any) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className={`h-8 w-8 ${transaction.type === "in" ? "bg-green-100" : "bg-red-100"} rounded-full flex items-center justify-center`}>
                    {transaction.type === "in" ? (
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.variation?.product?.name}
                      {getVariationDisplay(transaction.variation)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${transaction.type === "in" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "in" ? "+" : "-"}{transaction.quantity}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.type === "in" ? "Stok Masuk" : "Stok Keluar"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
