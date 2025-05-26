import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, RotateCcw, XCircle, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const returnSchema = z.object({
  variationId: z.number().min(1, "Variasi produk wajib dipilih"),
  type: z.enum(["return", "cancel"], { required_error: "Tipe wajib dipilih" }),
  quantity: z.number().min(1, "Jumlah minimal 1"),
  reason: z.string().min(1, "Alasan wajib diisi"),
  notes: z.string().optional(),
});

type ReturnForm = z.infer<typeof returnSchema>;

export default function Returns() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isReturnFormOpen, setIsReturnFormOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const { toast } = useToast();

  const { data: variations } = useQuery({
    queryKey: ["/api/variations"],
  });

  const { data: returnTransactions, isLoading } = useQuery({
    queryKey: ["/api/transactions"],
    select: (data: any) => data?.filter((t: any) => t.type === "return" || t.type === "cancel") || [],
  });

  const form = useForm<ReturnForm>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      variationId: 0,
      type: "return",
      quantity: 1,
      reason: "",
      notes: "",
    },
  });

  const createReturnMutation = useMutation({
    mutationFn: async (data: ReturnForm) => {
      const res = await apiRequest("POST", "/api/transactions", {
        ...data,
        quantity: data.type === "return" ? data.quantity : -data.quantity, // Negative for cancel
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/variations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Berhasil",
        description: "Transaksi return/cancel berhasil dicatat",
      });
      setIsReturnFormOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReturnForm) => {
    createReturnMutation.mutate(data);
  };

  const filteredTransactions = returnTransactions?.filter((transaction: any) => {
    const matchesSearch = transaction.variation?.product?.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      transaction.variation?.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Add date filtering logic here if needed
    return matchesSearch;
  }) || [];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "return":
        return "Return";
      case "cancel":
        return "Cancel";
      default:
        return type;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "return":
        return "default";
      case "cancel":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Return & Cancel Produk</h1>
            <p className="text-gray-600">Kelola return dan pembatalan produk</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <RotateCcw className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Return</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {returnTransactions?.filter((t: any) => t.type === "return").length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Cancel</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {returnTransactions?.filter((t: any) => t.type === "cancel").length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Bulan Ini</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {returnTransactions?.filter((t: any) => {
                        const transactionDate = new Date(t.createdAt);
                        const currentDate = new Date();
                        return transactionDate.getMonth() === currentDate.getMonth() &&
                               transactionDate.getFullYear() === currentDate.getFullYear();
                      }).length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions and Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari produk atau SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>
            
            <Button onClick={() => setIsReturnFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Catat Return/Cancel
            </Button>
          </div>

          {/* Returns Table */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Return & Cancel</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-2 text-gray-600">Memuat data...</p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <RotateCcw className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data return/cancel</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? "Tidak ada hasil yang sesuai dengan pencarian" : "Belum ada transaksi return atau cancel"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead>Variasi</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Alasan</TableHead>
                      <TableHead>Staff</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaction.variation?.product?.name || "Produk Tidak Diketahui"}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-gray-600">
                              {transaction.variation?.color && `${transaction.variation.color} `}
                              {transaction.variation?.size && `${transaction.variation.size}`}
                            </span>
                            <br />
                            <span className="font-mono text-xs text-gray-500">
                              {transaction.variation?.sku}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTypeBadgeVariant(transaction.type)}>
                            {getTypeLabel(transaction.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>{Math.abs(transaction.quantity)} unit</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {transaction.notes || "-"}
                        </TableCell>
                        <TableCell>
                          {transaction.user?.username || "System"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Return/Cancel Form Dialog */}
      <Dialog open={isReturnFormOpen} onOpenChange={setIsReturnFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <RotateCcw className="mr-2 h-5 w-5" />
              Catat Return/Cancel Produk
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="variationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variasi Produk</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih variasi produk" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {variations?.map((variation: any) => (
                            <SelectItem key={variation.id} value={variation.id.toString()}>
                              {variation.product?.name} - {variation.color} {variation.size} ({variation.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="return">Return</SelectItem>
                          <SelectItem value="cancel">Cancel</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Masukkan jumlah"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alasan</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan alasan return/cancel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Catatan tambahan..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsReturnFormOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={createReturnMutation.isPending}>
                  {createReturnMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}