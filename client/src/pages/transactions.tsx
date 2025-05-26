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
      
      <div className="pl-64">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Transaksi</h2>
              <p className="text-sm text-gray-500">Riwayat transaksi stok masuk dan keluar</p>
            </div>
            <Button 
              onClick={() => setIsTransactionModalOpen(true)}
              className="bg-primary-500 hover:bg-primary-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Transaksi Baru
            </Button>
          </div>
        </div>

        {/* Content */}
        <main className="p-6">
          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari transaksi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Start Date */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy") : "Tanggal Mulai"}
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

                {/* End Date */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy") : "Tanggal Akhir"}
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

                {/* Type Filter */}
                <div className="flex space-x-2">
                  <Button
                    variant={typeFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTypeFilter("all")}
                  >
                    Semua
                  </Button>
                  <Button
                    variant={typeFilter === "in" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTypeFilter("in")}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    Masuk
                  </Button>
                  <Button
                    variant={typeFilter === "out" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTypeFilter("out")}
                    className="text-red-600 border-red-600 hover:bg-red-50"
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
