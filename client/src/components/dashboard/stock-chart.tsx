import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function StockChart() {
  const [viewType, setViewType] = useState<"in" | "out" | "both">("both");
  
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/chart"],
  });

  const getBarHeight = (value: number, max: number) => {
    return Math.max(20, (value / max) * 180);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Pergerakan Stok (7 Hari Terakhir)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Memuat data chart...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = chartData && chartData.length > 0 
    ? Math.max(...chartData.flatMap((d: any) => [d.stockIn, d.stockOut]))
    : 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Pergerakan Stok (7 Hari Terakhir)
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant={viewType === "in" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("in")}
              className="text-xs bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
            >
              Stok Masuk
            </Button>
            <Button
              variant={viewType === "out" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("out")}
              className="text-xs bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
            >
              Stok Keluar
            </Button>
            <Button
              variant={viewType === "both" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("both")}
              className="text-xs"
            >
              Keduanya
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!chartData || chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Data Transaksi</h3>
              <p className="text-sm text-gray-500">Mulai tambahkan transaksi stok untuk melihat grafik pergerakan</p>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-end justify-between space-x-3 px-4">
            {chartData.map((data: any, index: number) => (
              <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                <div className="flex flex-col items-center space-y-1 w-full relative">
                  {(viewType === "in" || viewType === "both") && (
                    <div className="relative group">
                      <div
                        className="w-10 bg-green-500 rounded-t-lg transition-all duration-300 hover:bg-green-600 shadow-sm"
                        style={{ height: `${getBarHeight(data.stockIn, maxValue)}px` }}
                      />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Masuk: {data.stockIn}
                      </div>
                    </div>
                  )}
                  {(viewType === "out" || viewType === "both") && (
                    <div className="relative group">
                      <div
                        className="w-10 bg-red-400 rounded-t-lg transition-all duration-300 hover:bg-red-500 shadow-sm"
                        style={{ height: `${getBarHeight(data.stockOut, maxValue)}px` }}
                      />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Keluar: {data.stockOut}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-600 font-medium">{data.date}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Legend */}
        <div className="flex justify-center mt-4 space-x-6">
          {(viewType === "in" || viewType === "both") && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Stok Masuk</span>
            </div>
          )}
          {(viewType === "out" || viewType === "both") && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-400 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Stok Keluar</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
