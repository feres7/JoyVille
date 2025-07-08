import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, DollarSign, User, MapPin } from "lucide-react";
import { OrderWithItems } from "@shared/schema";

export default function Orders() {
  const { user, isLoggedIn } = useAuth();
  const isAdmin = user?.role === "superadmin";

  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
    enabled: isLoggedIn,
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
      default: return "bg-gray-100 text-gray-800";
    }
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