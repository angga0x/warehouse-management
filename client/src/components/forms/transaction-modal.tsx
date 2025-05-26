import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const transactionSchema = z.object({
  type: z.enum(["in", "out"], {
    required_error: "Please select transaction type",
  }),
  variationId: z.number({
    required_error: "Please select a product variation",
  }),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  notes: z.string().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionModal({ isOpen, onClose }: TransactionModalProps) {
  const { toast } = useToast();
  
  const { data: variations } = useQuery({
    queryKey: ["/api/variations"],
    enabled: isOpen,
  });

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: undefined,
      variationId: undefined,
      quantity: 1,
      notes: "",
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionForm) => {
      const res = await apiRequest("POST", "/api/transactions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/variations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/variations/low-stock"] });
      
      toast({
        title: "Success",
        description: "Transaction created successfully",
      });
      
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: TransactionForm) => {
    createTransactionMutation.mutate(data);
  };

  const getVariationDisplay = (variation: any) => {
    const parts = [variation.product?.name];
    if (variation.color) parts.push(variation.color);
    if (variation.size) parts.push(variation.size);
    return parts.join(" - ");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Transaksi Stok Baru</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="type">Jenis Transaksi</Label>
            <Select 
              onValueChange={(value) => form.setValue("type", value as "in" | "out")}
              value={form.watch("type")}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Pilih Jenis Transaksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Stok Masuk</SelectItem>
                <SelectItem value="out">Stok Keluar</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="variationId">Produk</Label>
            <Select 
              onValueChange={(value) => form.setValue("variationId", parseInt(value))}
              value={form.watch("variationId")?.toString()}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Pilih Produk" />
              </SelectTrigger>
              <SelectContent>
                {variations?.map((variation: any) => (
                  <SelectItem key={variation.id} value={variation.id.toString()}>
                    {getVariationDisplay(variation)} (Stock: {variation.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.variationId && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.variationId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="quantity">Jumlah</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              className="mt-2"
              placeholder="Masukkan jumlah"
              {...form.register("quantity", { valueAsNumber: true })}
            />
            {form.formState.errors.quantity && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.quantity.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              className="mt-2"
              rows={3}
              placeholder="Tambahkan catatan..."
              {...form.register("notes")}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleClose}
            >
              Batal
            </Button>
            <Button 
              type="submit"
              disabled={createTransactionMutation.isPending}
              className="bg-primary-500 hover:bg-primary-600"
            >
              {createTransactionMutation.isPending ? "Menyimpan..." : "Simpan Transaksi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
