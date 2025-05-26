import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, Tag, Building2, Save, Brain, Key } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCategorySchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const categorySchema = insertCategorySchema;

type CategoryForm = z.infer<typeof categorySchema>;

const profileSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Password konfirmasi tidak sama",
  path: ["confirmPassword"],
});

const systemSchema = z.object({
  openaiApiKey: z.string().min(1, "API Key OpenAI wajib diisi"),
  openaiModel: z.string().min(1, "Model OpenAI wajib dipilih"),
  stockAlertThreshold: z.number().min(1, "Batas stok minimal 1"),
});

type ProfileForm = z.infer<typeof profileSchema>;
type SystemForm = z.infer<typeof systemSchema>;

export default function Settings() {
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const categoryForm = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { data: systemSettings } = useQuery({
    queryKey: ["/api/settings/system"],
  });

  const systemForm = useForm<SystemForm>({
    resolver: zodResolver(systemSchema),
    defaultValues: {
      openaiApiKey: "",
      openaiModel: "gpt-4o",
      stockAlertThreshold: 10,
    },
  });

  // Update form when data loads
  React.useEffect(() => {
    if (systemSettings) {
      systemForm.reset({
        openaiApiKey: systemSettings.openaiApiKey === "***configured***" ? "***configured***" : "",
        openaiModel: systemSettings.openaiModel || "gpt-4o",
        stockAlertThreshold: parseInt(systemSettings.stockAlertThreshold) || 10,
      });
    }
  }, [systemSettings, systemForm]);

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryForm) => {
      const res = await apiRequest("POST", "/api/categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Berhasil",
        description: "Kategori berhasil ditambahkan",
      });
      setIsCategoryFormOpen(false);
      categoryForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: CategoryForm) => {
      const res = await apiRequest("PATCH", `/api/categories/${editingCategory.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Berhasil",
        description: "Kategori berhasil diperbarui",
      });
      setIsCategoryFormOpen(false);
      setEditingCategory(null);
      categoryForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/categories/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Berhasil",
        description: "Kategori berhasil dihapus",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui",
      });
      profileForm.reset({
        username: user?.username || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSystemMutation = useMutation({
    mutationFn: async (data: SystemForm) => {
      const res = await apiRequest("POST", "/api/settings/system", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/system"] });
      toast({
        title: "Berhasil",
        description: "Pengaturan sistem berhasil diperbarui",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onCategorySubmit = (data: CategoryForm) => {
    if (editingCategory) {
      updateCategoryMutation.mutate(data);
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const onProfileSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const onSystemSubmit = (data: SystemForm) => {
    updateSystemMutation.mutate(data);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      description: category.description || "",
    });
    setIsCategoryFormOpen(true);
  };

  const handleDeleteCategory = (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-full">
      <Sidebar />
      
      <div className="pl-64">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengaturan Sistem</h1>
            <p className="text-gray-600">Kelola pengaturan aplikasi dan profil pengguna</p>
          </div>

          <Tabs defaultValue="categories" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="categories" className="flex items-center">
                <Tag className="mr-2 h-4 w-4" />
                Kategori Produk
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Profil Pengguna
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center">
                <Building2 className="mr-2 h-4 w-4" />
                Sistem
              </TabsTrigger>
            </TabsList>

            {/* Categories Tab */}
            <TabsContent value="categories">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Manajemen Kategori Produk</CardTitle>
                  <Button 
                    onClick={() => {
                      setEditingCategory(null);
                      categoryForm.reset();
                      setIsCategoryFormOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kategori
                  </Button>
                </CardHeader>
                <CardContent>
                  {categoriesLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="mt-2 text-gray-600">Memuat kategori...</p>
                    </div>
                  ) : categories && categories.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Kategori</TableHead>
                          <TableHead>Deskripsi</TableHead>
                          <TableHead>Jumlah Produk</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category: any) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{category.description || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">0 produk</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditCategory(category)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteCategory(category.id)}
                                  disabled={deleteCategoryMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Tag className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada kategori</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Mulai dengan menambahkan kategori produk pertama.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profil Pengguna</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Masukkan username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password Saat Ini</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Password saat ini"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password Baru</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Password baru"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Konfirmasi Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Konfirmasi password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={updateProfileMutation.isPending}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {updateProfileMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* OpenAI Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="mr-2 h-5 w-5" />
                      Konfigurasi AI Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...systemForm}>
                      <form onSubmit={systemForm.handleSubmit(onSystemSubmit)} className="space-y-4">
                        <FormField
                          control={systemForm.control}
                          name="openaiApiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <Key className="mr-2 h-4 w-4" />
                                API Key OpenAI
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder={field.value === "***configured***" ? "API Key sudah dikonfigurasi" : "sk-..."}
                                  {...field}
                                />
                              </FormControl>
                              <div className="text-xs text-gray-500">
                                Dapatkan API key dari{" "}
                                <a 
                                  href="https://platform.openai.com/api-keys" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  OpenAI Platform
                                </a>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={systemForm.control}
                          name="openaiModel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model OpenAI</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih model OpenAI" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                                  <SelectItem value="gpt-4o-mini">GPT-4o Mini (Faster)</SelectItem>
                                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Economical)</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="text-xs text-gray-500">
                                GPT-4o memberikan analisis terbaik, GPT-4o Mini lebih cepat dan hemat biaya
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={systemForm.control}
                          name="stockAlertThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Batas Alert Stok Rendah</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="10"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <div className="text-xs text-gray-500">
                                Alert akan muncul ketika stok produk dibawah angka ini
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={updateSystemMutation.isPending}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {updateSystemMutation.isPending ? "Menyimpan..." : "Simpan Konfigurasi"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                {/* System Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Sistem</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Versi Aplikasi:</span>
                      <span className="font-medium">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Database:</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        PostgreSQL
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status AI:</span>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        {systemSettings?.openaiApiKey === "***configured***" ? "Terkonfigurasi" : "Belum Dikonfigurasi"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model Aktif:</span>
                      <span className="font-medium text-sm">
                        {systemSettings?.openaiModel || "Belum dipilih"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Alert Stok:</span>
                      <span className="font-medium text-sm">
                        {"< "}{systemSettings?.stockAlertThreshold || 10} unit
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Category Form Dialog */}
      <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
          </DialogHeader>

          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
              <FormField
                control={categoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kategori</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama kategori" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={categoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Masukkan deskripsi kategori"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCategoryFormOpen(false)}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                >
                  {(createCategoryMutation.isPending || updateCategoryMutation.isPending) 
                    ? "Menyimpan..." 
                    : editingCategory ? "Perbarui" : "Tambah"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}