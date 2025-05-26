import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function StockChart() {
  const [viewType, setViewType] = useState<"in" | "out" | "both">("both");
  
  // For demo purposes, we'll use mock data
  // In a real app, this would fetch actual chart data from the API
  const mockChartData = [
    { day: "Sen", stockIn: 120, stockOut: 80 },
    { day: "Sel", stockIn: 150, stockOut: 90 },
    { day: "Rab", stockIn: 100, stockOut: 110 },
    { day: "Kam", stockIn: 180, stockOut: 70 },
    { day: "Jum", stockIn: 140, stockOut: 95 },
    { day: "Sab", stockIn: 110, stockOut: 60 },
    { day: "Min", stockIn: 90, stockOut: 45 },
  ];

  const getBarHeight = (value: number, max: number) => {
    return Math.max(20, (value / max) * 200);
  };

  const maxValue = Math.max(
    ...mockChartData.flatMap(d => [d.stockIn, d.stockOut])
  );

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
        <div className="h-64 flex items-end justify-between space-x-2 px-4">
          {mockChartData.map((data, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 flex-1">
              <div className="flex flex-col items-center space-y-1 w-full">
                {(viewType === "in" || viewType === "both") && (
                  <div
                    className="w-8 bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                    style={{ height: `${getBarHeight(data.stockIn, maxValue)}px` }}
                    title={`Stok Masuk: ${data.stockIn}`}
                  />
                )}
                {(viewType === "out" || viewType === "both") && (
                  <div
                    className="w-8 bg-red-400 rounded-t transition-all duration-300 hover:bg-red-500"
                    style={{ height: `${getBarHeight(data.stockOut, maxValue)}px` }}
                    title={`Stok Keluar: ${data.stockOut}`}
                  />
                )}
              </div>
              <span className="text-xs text-gray-500 font-medium">{data.day}</span>
            </div>
          ))}
        </div>
        
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
