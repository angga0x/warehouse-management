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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

  const handleCloseVariationForm = () => {
    setIsVariationFormOpen(false);
    setEditingVariation(null);
    setSelectedProductId(null);
  };

  return (
    <div className="min-h-full">
      <Sidebar />
      
      <div className="lg:pl-64">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex flex-col sm:flex-row h-auto sm:h-16 items-start sm:items-center justify-between px-4 sm:px-6 py-4 sm:py-0 gap-3 sm:gap-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Produk & Variasi</h2>
              <p className="text-sm text-gray-500">Kelola produk dan variasi stok</p>
            </div>
            <Button 
              onClick={() => setIsProductFormOpen(true)}
              className="bg-primary-500 hover:bg-primary-600 w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Produk
            </Button>
          </div>
        </div>

        {/* Content */}
        <main className="p-3 sm:p-6">
          {/* Search and Filter */}
          <Card className="mb-4 sm:mb-6">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
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
                <>
                  {/* Mobile View - Cards */}
                  <div className="block lg:hidden space-y-4">
                    {filteredProducts.map((product: any) => {
                      const productVariations = getProductVariations(product.id);
                      const totalStock = getTotalStock(product.id);
                      const lowStockVariations = productVariations.filter((v: any) => v.stock <= v.minStock);
                      
                      return (
                        <Card key={product.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{product.name}</h3>
                                <p className="text-sm text-gray-500 font-mono">{product.sku}</p>
                              </div>
                              <div className="ml-2">
                                {lowStockVariations.length > 0 ? (
                                  <Badge variant="destructive" className="text-xs">
                                    {lowStockVariations.length} Stok Menipis
                                  </Badge>
                                ) : totalStock === 0 ? (
                                  <Badge variant="secondary" className="text-xs">Habis</Badge>
                                ) : (
                                  <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                    Normal
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500">Kategori:</span>
                                <div className="font-medium">{product.category?.name || "Tidak ada"}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">Total Stok:</span>
                                <div className="font-medium">{totalStock} unit</div>
                              </div>
                            </div>
                            
                            {productVariations.length > 0 && (
                              <div>
                                <span className="text-gray-500 text-sm">Variasi:</span>
                                <div className="mt-1 space-y-1">
                                  {productVariations.slice(0, 2).map((variation: any) => (
                                    <div key={variation.id} className="text-xs bg-gray-50 rounded px-2 py-1 flex justify-between">
                                      <span className="font-medium">
                                        {variation.color} {variation.size}
                                      </span>
                                      <span className="text-gray-600">
                                        {variation.stock} unit
                                      </span>
                                    </div>
                                  ))}
                                  {productVariations.length > 2 && (
                                    <div className="text-xs text-gray-500">
                                      +{productVariations.length - 2} variasi lainnya
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex space-x-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedProductId(product.id);
                                  setIsVariationFormOpen(true);
                                }}
                                className="flex-1"
                              >
                                <Settings className="h-4 w-4 mr-1" />
                                Variasi
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(product)}
                                className="flex-1"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
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
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Desktop View - Table */}
                  <div className="hidden lg:block overflow-x-auto">
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
                          const lowStockVariations = productVariations.filter((v: any) => v.stock <= v.minStock);
                          
                          return (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                              <TableCell>{product.category?.name || "Uncategorized"}</TableCell>
                              <TableCell>
                                {productVariations.length > 0 ? (
                                  <div className="space-y-1">
                                    {productVariations.slice(0, 2).map((variation: any) => (
                                      <div key={variation.id} className="text-xs bg-gray-50 rounded px-2 py-1">
                                        <span className="font-medium">
                                          {variation.color} {variation.size}
                                        </span>
                                        <span className="ml-2 text-gray-600">
                                          Stok: {variation.stock}
                                        </span>
                                      </div>
                                    ))}
                                    {productVariations.length > 2 && (
                                      <div className="text-xs text-gray-500">
                                        +{productVariations.length - 2} variasi lainnya
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-sm">Belum ada variasi</span>
                                )}
                              </TableCell>
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
                                    onClick={() => {
                                      setSelectedProductId(product.id);
                                      setIsVariationFormOpen(true);
                                    }}
                                    title="Kelola Variasi"
                                  >
                                    <Settings className="h-4 w-4" />
                                  </Button>
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
                  </div>
                </>
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
            <DialogDescription>
              {editingProduct ? "Ubah informasi produk yang sudah ada" : "Tambah produk baru ke dalam sistem inventori"}
            </DialogDescription>
          </DialogHeader>
          <ProductForm 
            product={editingProduct}
            onSuccess={handleCloseForm}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {/* Variation Form Dialog */}
      {selectedProductId && (
        <VariationForm
          variation={editingVariation}
          productId={selectedProductId}
          isOpen={isVariationFormOpen}
          onClose={handleCloseVariationForm}
          onSuccess={handleCloseVariationForm}
        />
      )}
    </div>
  );
}
