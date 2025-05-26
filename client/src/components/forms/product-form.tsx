import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  categoryId: z.number().optional(),
  sku: z.string().min(1, "SKU is required"),
  variations: z.array(z.object({
    color: z.string().optional(),
    size: z.string().optional(),
    stock: z.number().min(0, "Stock cannot be negative"),
    minStock: z.number().min(0, "Min stock cannot be negative"),
    price: z.string().optional(),
    sku: z.string().min(1, "Variation SKU is required"),
  })).min(1, "At least one variation is required"),
});

type ProductForm = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { toast } = useToast();
  const isEditing = !!product;

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      categoryId: product?.categoryId || undefined,
      sku: product?.sku || "",
      variations: product?.variations || [
        {
          color: "",
          size: "",
          stock: 0,
          minStock: 10,
          price: "",
          sku: "",
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variations",
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const productData = {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        sku: data.sku,
      };

      let productResponse;
      if (isEditing) {
        productResponse = await apiRequest("PATCH", `/api/products/${product.id}`, productData);
      } else {
        productResponse = await apiRequest("POST", "/api/products", productData);
      }
      
      const createdProduct = await productResponse.json();

      // Create or update variations
      for (const variation of data.variations) {
        const variationData = {
          productId: createdProduct.id,
          color: variation.color || null,
          size: variation.size || null,
          stock: variation.stock,
          minStock: variation.minStock,
          price: variation.price || null,
          sku: variation.sku,
        };

        if (isEditing && variation.id) {
          await apiRequest("PATCH", `/api/variations/${variation.id}`, variationData);
        } else {
          await apiRequest("POST", "/api/variations", variationData);
        }
      }

      return createdProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/variations"] });
      
      toast({
        title: "Success",
        description: `Product ${isEditing ? "updated" : "created"} successfully`,
      });
      
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductForm) => {
    createProductMutation.mutate(data);
  };

  const addVariation = () => {
    append({
      color: "",
      size: "",
      stock: 0,
      minStock: 10,
      price: "",
      sku: `${form.watch("sku")}-VAR-${fields.length + 1}`,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Product Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Produk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nama Produk</Label>
              <Input
                id="name"
                className="mt-2"
                placeholder="Masukkan nama produk"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                className="mt-2"
                placeholder="Masukkan SKU produk"
                {...form.register("sku")}
              />
              {form.formState.errors.sku && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.sku.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="categoryId">Kategori</Label>
            <Select 
              onValueChange={(value) => form.setValue("categoryId", parseInt(value))}
              value={form.watch("categoryId")?.toString()}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              className="mt-2"
              rows={3}
              placeholder="Masukkan deskripsi produk"
              {...form.register("description")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Product Variations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Variasi Produk</CardTitle>
            <Button type="button" onClick={addVariation} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Variasi
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fields.map((field, index) => (
            <div key={field.id}>
              {index > 0 && <Separator className="my-4" />}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Variasi {index + 1}</Badge>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Warna</Label>
                    <Input
                      className="mt-2"
                      placeholder="Misal: Merah, Biru"
                      {...form.register(`variations.${index}.color`)}
                    />
                  </div>

                  <div>
                    <Label>Ukuran</Label>
                    <Input
                      className="mt-2"
                      placeholder="Misal: S, M, L, XL"
                      {...form.register(`variations.${index}.size`)}
                    />
                  </div>

                  <div>
                    <Label>SKU Variasi</Label>
                    <Input
                      className="mt-2"
                      placeholder="SKU unik untuk variasi"
                      {...form.register(`variations.${index}.sku`)}
                    />
                    {form.formState.errors.variations?.[index]?.sku && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.variations[index]?.sku?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Stok</Label>
                    <Input
                      className="mt-2"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...form.register(`variations.${index}.stock`, { valueAsNumber: true })}
                    />
                    {form.formState.errors.variations?.[index]?.stock && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.variations[index]?.stock?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Minimum Stok</Label>
                    <Input
                      className="mt-2"
                      type="number"
                      min="0"
                      placeholder="10"
                      {...form.register(`variations.${index}.minStock`, { valueAsNumber: true })}
                    />
                    {form.formState.errors.variations?.[index]?.minStock && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.variations[index]?.minStock?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Harga (Opsional)</Label>
                    <Input
                      className="mt-2"
                      placeholder="100000"
                      {...form.register(`variations.${index}.price`)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {form.formState.errors.variations && (
            <p className="text-sm text-red-500 mt-2">
              {form.formState.errors.variations.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button 
          type="submit"
          disabled={createProductMutation.isPending}
          className="bg-primary-500 hover:bg-primary-600"
        >
          {createProductMutation.isPending 
            ? "Menyimpan..." 
            : isEditing 
              ? "Update Produk" 
              : "Simpan Produk"
          }
        </Button>
      </div>
    </form>
  );
}
