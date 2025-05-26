import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { insertVariationSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3 } from "lucide-react";

const variationSchema = insertVariationSchema.extend({
  stock: z.number().min(0, "Stok tidak boleh negatif"),
  minStock: z.number().min(0, "Minimum stok tidak boleh negatif"),
  price: z.string().min(1, "Harga wajib diisi"),
});

type VariationForm = z.infer<typeof variationSchema>;

interface VariationFormProps {
  variation?: any;
  productId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function VariationForm({ variation, productId, isOpen, onClose, onSuccess }: VariationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!variation;

  const form = useForm<VariationForm>({
    resolver: zodResolver(variationSchema),
    defaultValues: {
      productId: productId,
      color: variation?.color || "",
      size: variation?.size || "",
      stock: variation?.stock || 0,
      minStock: variation?.minStock || 10,
      price: variation?.price || "",
      sku: variation?.sku || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: VariationForm) => {
      const res = await apiRequest("POST", "/api/variations", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/variations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Berhasil",
        description: "Variasi produk berhasil ditambahkan",
      });
      onSuccess();
      onClose();
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

  const updateMutation = useMutation({
    mutationFn: async (data: VariationForm) => {
      const res = await apiRequest("PATCH", `/api/variations/${variation.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/variations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Berhasil",
        description: "Variasi produk berhasil diperbarui",
      });
      onSuccess();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/variations/${variation.id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/variations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Berhasil",
        description: "Variasi produk berhasil dihapus",
      });
      onSuccess();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VariationForm) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus variasi ini?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Edit3 className="mr-2 h-5 w-5" />
              {isEdit ? "Edit Variasi Produk" : "Tambah Variasi Produk"}
            </span>
            {isEdit && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Ubah detail variasi produk yang sudah ada" : "Tambah variasi baru dengan warna, ukuran, dan harga"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warna</FormLabel>
                    <FormControl>
                      <Input placeholder="Merah, Biru, dll" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ukuran</FormLabel>
                    <FormControl>
                      <Input placeholder="S, M, L, XL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="SKU001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="150000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok Saat Ini</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
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
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Stok</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) 
                  ? "Menyimpan..." 
                  : isEdit ? "Perbarui" : "Tambah"
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}