import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Calendar, DollarSign, User, MapPin, ShoppingCart } from "lucide-react";
import { OrderWithItems } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Orders() {
  const { user, isLoggedIn } = useAuth();
  const isAdmin = user?.role === "superadmin";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
    enabled: isLoggedIn,
  });

  const statusUpdateMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return await apiRequest(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold mb-2">Please Login</h2>
        <p className="text-gray-600">You need to be logged in to view orders.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse">Loading orders...</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    statusUpdateMutation.mutate({ orderId, status: newStatus });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Package className="w-8 h-8 text-mint-400" />
          {isAdmin ? "All Orders" : "My Orders"}
        </h1>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
              <p className="text-gray-600">
                {isAdmin 
                  ? "No customer orders have been placed yet." 
                  : "You haven't placed any orders yet. Start shopping to see your orders here!"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span>Order #{order.id}</span>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${parseFloat(order.totalAmount).toFixed(2)}
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Customer #{order.userId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Customer Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Name:</span> {order.customerName}</p>
                        <p><span className="font-medium">Email:</span> {order.customerEmail}</p>
                        {order.customerPhone && (
                          <p><span className="font-medium">Phone:</span> {order.customerPhone}</p>
                        )}
                      </div>
                    </div>

                    {/* Shipping Information */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Shipping Address
                      </h4>
                      <div className="text-sm">
                        <p>{order.shippingAddress}</p>
                        <p>{order.shippingCity}, {order.shippingState} {order.shippingZipCode}</p>
                        <p>{order.shippingCountry}</p>
                      </div>
                    </div>
                  </div>

                  {/* Billing Address (if different) */}
                  {order.billingAddress && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Billing Address
                        </h4>
                        <div className="text-sm">
                          <p>{order.billingAddress}</p>
                          <p>{order.billingCity}, {order.billingState} {order.billingZipCode}</p>
                          <p>{order.billingCountry}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Order Items */}
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Order Items
                    </h4>
                    <div className="space-y-2">
                      {order.orderItems?.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              {item.product?.imageUrls?.[0] ? (
                                <img 
                                  src={item.product.imageUrls[0]} 
                                  alt={item.product.name || "Product"} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h5 className="font-medium text-sm">{item.product?.name || "Unknown Product"}</h5>
                              <p className="text-xs text-gray-600">
                                {item.product?.category?.name && (
                                  <span className="text-xs bg-gray-200 px-2 py-1 rounded mr-2">
                                    {item.product.category.name}
                                  </span>
                                )}
                                Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">
                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )) || (
                        <p className="text-gray-500 text-sm">No items found</p>
                      )}
                    </div>
                  </div>

                  {/* Order Notes */}
                  {order.orderNotes && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="font-semibold mb-2">Order Notes</h4>
                        <p className="text-sm text-gray-600">{order.orderNotes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}