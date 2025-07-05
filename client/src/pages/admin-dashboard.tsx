import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AdminProductFormEnhanced from "@/components/admin-product-form-enhanced";
import type { ProductWithCategory } from "@shared/schema";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!isLoggedIn || user?.role !== "superadmin") {
    setLocation("/");
    return null;
  }

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: retailProducts = [] } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products", "retail"],
    queryFn: () => fetch("/api/products?section=retail").then(res => res.json()),
  });

  const { data: wholesaleProducts = [] } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products", "wholesale"],
    queryFn: () => fetch("/api/products?section=wholesale").then(res => res.json()),
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
      setLocation("/");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the admin dashboard.",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const ProductList = ({ products, section }: { products: ProductWithCategory[], section: string }) => (
    <div className="space-y-4">
      {products.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No products found in {section} section</p>
          </CardContent>
        </Card>
      ) : (
        products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={product.imageUrls?.[0] || "https://images.unsplash.com/photo-1558060370-d644479cb6f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category?.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-lg font-bold text-sunny-orange">${product.price}</span>
                      {product.isNew && <Badge className="bg-sunny-orange text-white text-xs">NEW</Badge>}
                      {product.isBestseller && <Badge className="bg-coral text-white text-xs">BESTSELLER</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <AdminProductFormEnhanced product={product} />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteProductMutation.mutate(product.id)}
                    disabled={deleteProductMutation.isPending}
                  >
                    <i className="fas fa-trash mr-1"></i>
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              <i className="fas fa-user-shield text-lavender-500 mr-2"></i>
              Admin Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome back, <span className="font-semibold">{user?.username}</span></span>
              <Button
                variant="outline"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <i className="fas fa-sign-out-alt mr-1"></i>
                Logout
              </Button>
            </div>
          </div>
          
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-mint-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-mint-600 font-medium">Retail Items</p>
                    <p className="text-2xl font-bold text-gray-800">{stats?.retailItems || 0}</p>
                  </div>
                  <i className="fas fa-shopping-bag text-mint-500 text-2xl"></i>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-sky-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sky-600 font-medium">Wholesale Items</p>
                    <p className="text-2xl font-bold text-gray-800">{stats?.wholesaleItems || 0}</p>
                  </div>
                  <i className="fas fa-store text-sky-500 text-2xl"></i>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-sunny-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sunny-600 font-medium">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-800">{stats?.totalOrders || 0}</p>
                  </div>
                  <i className="fas fa-chart-line text-sunny-500 text-2xl"></i>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 font-medium">Revenue</p>
                    <p className="text-2xl font-bold text-gray-800">${stats?.revenue || "0"}</p>
                  </div>
                  <i className="fas fa-dollar-sign text-purple-500 text-2xl"></i>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-mint-300 hover:bg-mint-400 text-gray-800">
                  <i className="fas fa-plus mr-2"></i>Add Retail Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <AdminProductFormEnhanced defaultSection="retail" />
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-sky-300 hover:bg-sky-400 text-gray-800">
                  <i className="fas fa-plus mr-2"></i>Add Wholesale Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <AdminProductFormEnhanced defaultSection="wholesale" />
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Product Management */}
          <Tabs defaultValue="retail" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="retail">Retail Products ({retailProducts.length})</TabsTrigger>
              <TabsTrigger value="wholesale">Wholesale Products ({wholesaleProducts.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="retail">
              <Card>
                <CardHeader>
                  <CardTitle>Retail Products</CardTitle>
                  <CardDescription>Manage your retail toy inventory</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductList products={retailProducts} section="retail" />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="wholesale">
              <Card>
                <CardHeader>
                  <CardTitle>Wholesale Products</CardTitle>
                  <CardDescription>Manage your wholesale toy inventory</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductList products={wholesaleProducts} section="wholesale" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
