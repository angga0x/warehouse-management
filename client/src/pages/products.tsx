import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductForm } from "@/components/forms/product-form";
import { VariationForm } from "@/components/forms/variation-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Package, Settings } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isVariationFormOpen, setIsVariationFormOpen] = useState(false);
  const [editingVariation, setEditingVariation] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: variations } = useQuery({
    queryKey: ["/api/variations"],
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/variations"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getProductVariations = (productId: number) => {
    return variations?.filter(v => v.productId === productId) || [];
  };

  const getTotalStock = (productId: number) => {
    const productVariations = getProductVariations(productId);
    return productVariations.reduce((total, variation) => total + variation.stock, 0);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleCloseForm = () => {
    setIsProductFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-full">
      <Sidebar />
      
      <div className="pl-64">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Produk & Variasi</h2>
              <p className="text-sm text-gray-500">Kelola produk dan variasi stok</p>
            </div>
            <Button 
              onClick={() => setIsProductFormOpen(true)}
              className="bg-primary-500 hover:bg-primary-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Produk
            </Button>
          </div>
        </div>

        {/* Content */}
        <main className="p-6">
          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari produk berdasarkan nama atau SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Daftar Produk ({filteredProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "No products found matching your search." : "No products found. Create your first product!"}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Produk</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Variasi</TableHead>
                      <TableHead>Total Stok</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product: any) => {
                      const productVariations = getProductVariations(product.id);
                      const totalStock = getTotalStock(product.id);
                      const lowStockVariations = productVariations.filter(v => v.stock <= v.minStock);
                      
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                          <TableCell>{product.category?.name || "Uncategorized"}</TableCell>
                          <TableCell>{productVariations.length} variasi</TableCell>
                          <TableCell>{totalStock} unit</TableCell>
                          <TableCell>
                            {lowStockVariations.length > 0 ? (
                              <Badge variant="destructive">
                                {lowStockVariations.length} Stok Menipis
                              </Badge>
                            ) : totalStock === 0 ? (
                              <Badge variant="secondary">Habis</Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Normal
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Product Form Dialog */}
      <Dialog open={isProductFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm 
            product={editingProduct}
            onSuccess={handleCloseForm}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
