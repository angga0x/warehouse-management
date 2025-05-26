import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, TrendingDown, AlertTriangle, RefreshCw } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function Analytics() {
  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ["/api/analytics/performance"],
  });

  const { data: restock, isLoading: restockLoading } = useQuery({
    queryKey: ["/api/analytics/restock"],
  });

  const refreshAnalytics = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/analytics/performance"] });
    queryClient.invalidateQueries({ queryKey: ["/api/analytics/restock"] });
  };

  return (
    <div className="min-h-full">
      <Sidebar />
      
      <div className="md:pl-64 pl-0">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate">Analisis AI</h2>
              <p className="text-xs md:text-sm text-gray-500 truncate">Insight dan rekomendasi berbasis AI untuk optimasi gudang</p>
            </div>
            <Button onClick={refreshAnalytics} variant="outline" size="sm" className="ml-4 flex-shrink-0">
              <RefreshCw className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Perbarui Analisis</span>
              <span className="sm:hidden">Perbarui</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <main className="p-3 md:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Product Performance Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-purple-500" />
                  Analisis Performa Produk
                </CardTitle>
              </CardHeader>
              <CardContent>
                {performanceLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Menganalisis performa produk...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Top Performers */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                        Produk Terbaik
                      </h3>
                      {performance?.topPerformers?.length > 0 ? (
                        <div className="space-y-2">
                          {performance.topPerformers.slice(0, 3).map((product: any, index: number) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-green-50 rounded-lg gap-2">
                              <span className="font-medium text-green-900 flex-1 min-w-0 truncate">{product.productName || `Product ${index + 1}`}</span>
                              <Badge className="bg-green-100 text-green-800 self-start sm:self-center">{product.totalSold || 0} terjual</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Data produk terbaik tidak tersedia</p>
                      )}
                    </div>

                    {/* Under Performers */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                        <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                        Produk Kurang Laku
                      </h3>
                      {performance?.underPerformers?.length > 0 ? (
                        <div className="space-y-2">
                          {performance.underPerformers.slice(0, 3).map((product: any, index: number) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-red-50 rounded-lg gap-2">
                              <span className="font-medium text-red-900 flex-1 min-w-0 truncate">{product.productName || `Product ${index + 1}`}</span>
                              <Badge variant="destructive" className="self-start sm:self-center">{product.totalSold || 0} terjual</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Data produk kurang laku tidak tersedia</p>
                      )}
                    </div>

                    {/* Key Insights */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Wawasan Utama</h3>
                      {performance?.insights?.length > 0 ? (
                        <ul className="space-y-2">
                          {performance.insights.map((insight: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              {typeof insight === 'string' ? insight : JSON.stringify(insight)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">Wawasan tidak tersedia saat ini</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Restock Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                  Rekomendasi Restock
                </CardTitle>
              </CardHeader>
              <CardContent>
                {restockLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Menghasilkan rekomendasi restock...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Urgent Items */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                        <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                        Restock Mendesak
                      </h3>
                      {restock?.urgentItems?.length > 0 ? (
                        <div className="space-y-2">
                          {restock.urgentItems.slice(0, 3).map((item: any, index: number) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-red-50 rounded-lg gap-2">
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-red-900 truncate block">{item.product?.name || `Item ${index + 1}`}</span>
                                <p className="text-xs md:text-sm text-red-600">{item.color} {item.size}</p>
                              </div>
                              <Badge variant="destructive" className="self-start sm:self-center">{item.stock} tersisa</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Tidak ada item restock mendesak</p>
                      )}
                    </div>

                    {/* Medium Priority */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                        <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                        Prioritas Sedang
                      </h3>
                      {restock?.mediumPriority?.length > 0 ? (
                        <div className="space-y-2">
                          {restock.mediumPriority.slice(0, 3).map((item: any, index: number) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-orange-50 rounded-lg gap-2">
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-orange-900 truncate block">{item.product?.name || `Item ${index + 1}`}</span>
                                <p className="text-xs md:text-sm text-orange-600">{item.color} {item.size}</p>
                              </div>
                              <Badge className="bg-orange-100 text-orange-800 self-start sm:self-center">{item.stock} tersisa</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Tidak ada item prioritas sedang</p>
                      )}
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Rekomendasi AI</h3>
                      {restock?.recommendations?.length > 0 ? (
                        <ul className="space-y-2">
                          {restock.recommendations.map((recommendation: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              {typeof recommendation === 'string' ? recommendation : JSON.stringify(recommendation)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">Tidak ada rekomendasi tersedia</p>
                      )}
                    </div>

                    {/* Estimated Cost */}
                    {restock?.totalEstimatedCost > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-1">Estimasi Biaya Restock</h4>
                        <p className="text-2xl font-bold text-blue-700">
                          Rp {restock.totalEstimatedCost.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Recommendations */}
          {performance?.recommendations?.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-purple-500" />
                  Rekomendasi Performa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {performance.recommendations.map((recommendation: any, index: number) => (
                    <div key={index} className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-800">
                        {typeof recommendation === 'string' 
                          ? recommendation 
                          : recommendation.recommendation || recommendation.text || JSON.stringify(recommendation)
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
