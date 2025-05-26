import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TransactionModal } from "@/components/forms/transaction-modal";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Search, ArrowUp, ArrowDown, Calendar as CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [typeFilter, setTypeFilter] = useState<"all" | "in" | "out">("all");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions", startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());
      return fetch(`/api/transactions?${params}`).then(res => res.json());
    },
  });

  const filteredTransactions = transactions?.filter((transaction: any) => {
    const matchesSearch = 
      transaction.variation?.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    
    return matchesSearch && matchesType;
  }) || [];

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: id });
  };

  const getVariationDisplay = (variation: any) => {
    const parts = [];
    if (variation.color) parts.push(variation.color);
    if (variation.size) parts.push(variation.size);
    return parts.length > 0 ? parts.join(" - ") : "Default";
  };

  return (
    <div className="min-h-full">
      <Sidebar />
      
      <div className="lg:pl-64">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex flex-col sm:flex-row h-auto sm:h-16 items-start sm:items-center justify-between px-12 sm:px-6 py-4 sm:py-0 gap-3 sm:gap-0">
            <div className="text-center sm:text-left w-full sm:w-auto">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Transaksi</h2>
              <p className="text-sm text-gray-500">Riwayat transaksi stok masuk dan keluar</p>
            </div>
            <Button 
              onClick={() => setIsTransactionModalOpen(true)}
              className="bg-primary-500 hover:bg-primary-600 w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Transaksi Baru
            </Button>
          </div>
        </div>

        {/* Content */}
        <main className="p-3 sm:p-6">
          {/* Search and Filter */}
          <Card className="mb-4 sm:mb-6">
            <CardContent className="pt-4 sm:pt-6">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari transaksi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-0 sm:space-y-2 md:grid-cols-2 md:gap-2 md:space-y-0">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal text-sm">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy") : "Mulai"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal text-sm">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy") : "Akhir"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Type Filter */}
                <div className="flex space-x-1 sm:space-x-2">
                  <Button
                    variant={typeFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTypeFilter("all")}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    Semua
                  </Button>
                  <Button
                    variant={typeFilter === "in" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTypeFilter("in")}
                    className="text-green-600 border-green-600 hover:bg-green-50 flex-1 text-xs sm:text-sm"
                  >
                    Masuk
                  </Button>
                  <Button
                    variant={typeFilter === "out" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTypeFilter("out")}
                    className="text-red-600 border-red-600 hover:bg-red-50 flex-1 text-xs sm:text-sm"
                  >
                    Keluar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Riwayat Transaksi ({filteredTransactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm || startDate || endDate || typeFilter !== "all" 
                    ? "No transactions found matching your filters." 
                    : "No transactions found. Create your first transaction!"
                  }
                </div>
              ) : (
                <>
                  {/* Mobile View - Cards */}
                  <div className="block lg:hidden space-y-3">
                    {filteredTransactions.map((transaction: any) => (
                      <Card key={transaction.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {transaction.type === "in" ? (
                                  <Badge className="bg-green-100 text-green-800 flex items-center w-fit text-xs">
                                    <ArrowUp className="mr-1 h-3 w-3" />
                                    Masuk
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-800 flex items-center w-fit text-xs">
                                    <ArrowDown className="mr-1 h-3 w-3" />
                                    Keluar
                                  </Badge>
                                )}
                                <span className="font-mono text-xs text-gray-500">
                                  {formatDate(transaction.createdAt)}
                                </span>
                              </div>
                              <h3 className="font-medium text-gray-900 mt-1">
                                {transaction.variation?.product?.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {getVariationDisplay(transaction.variation)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`font-mono font-medium ${transaction.type === "in" ? "text-green-600" : "text-red-600"}`}>
                                {transaction.type === "in" ? "+" : "-"}{transaction.quantity}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">User:</span>
                              <div className="font-medium">{transaction.user?.name}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Catatan:</span>
                              <div className="font-medium truncate">{transaction.notes || "-"}</div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop View - Table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Jenis</TableHead>
                          <TableHead>Produk</TableHead>
                          <TableHead>Variasi</TableHead>
                          <TableHead>Jumlah</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Catatan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((transaction: any) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-mono text-sm">
                              {formatDate(transaction.createdAt)}
                            </TableCell>
                            <TableCell>
                              {transaction.type === "in" ? (
                                <Badge className="bg-green-100 text-green-800 flex items-center w-fit">
                                  <ArrowUp className="mr-1 h-3 w-3" />
                                  Stok Masuk
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 flex items-center w-fit">
                                  <ArrowDown className="mr-1 h-3 w-3" />
                                  Stok Keluar
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {transaction.variation?.product?.name}
                            </TableCell>
                            <TableCell>
                              {getVariationDisplay(transaction.variation)}
                            </TableCell>
                            <TableCell className="font-mono">
                              <span className={transaction.type === "in" ? "text-green-600" : "text-red-600"}>
                                {transaction.type === "in" ? "+" : "-"}{transaction.quantity}
                              </span>
                            </TableCell>
                            <TableCell>{transaction.user?.name}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {transaction.notes || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Transaction Modal */}
      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)} 
      />
    </div>
  );
}
