import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItemWithProduct } from "@shared/schema";

export default function CartDropdown() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems = [] } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    enabled: true,
  });

  const cartItemCount = cartItems.reduce((total: number, item: CartItemWithProduct) => total + (item.quantity || 0), 0);
  const cartTotal = cartItems.reduce((total: number, item: CartItemWithProduct) => {
    const price = typeof item.product?.price === 'string' ? parseFloat(item.product.price) : Number(item.product?.price) || 0;
    return total + price * (item.quantity || 0);
  }, 0);

  const updateCartMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      return await apiRequest("PUT", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartMutation.mutate({ id, quantity: newQuantity });
  };

  const handleRemoveItem = (id: number) => {
    removeFromCartMutation.mutate(id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative bg-mint-300 hover:bg-mint-400 text-gray-800 border-none p-2">
          <i className="fas fa-shopping-cart"></i>
          {cartItemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-coral text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
              {cartItemCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Shopping Cart</h3>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <i className="fas fa-shopping-cart text-4xl mb-2"></i>
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto">
              {cartItems.map((item: CartItemWithProduct) => (
                <div key={item.id} className="p-4 border-b">
                  <div className="flex items-start space-x-3">
                    <img 
                      src={item.product?.imageUrl || "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=80"} 
                      alt={item.product?.name || "Product"} 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product?.name}</h4>
                      <p className="text-xs text-gray-600">{item.product?.category?.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updateCartMutation.isPending}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max="99"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              if (newQuantity > 0 && newQuantity <= 99) {
                                handleUpdateQuantity(item.id, newQuantity);
                              }
                            }}
                            className="w-12 h-6 text-center text-sm p-0 border-gray-300"
                            disabled={updateCartMutation.isPending}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={updateCartMutation.isPending}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-sunny-orange">
                            ${((typeof item.product?.price === 'string' ? parseFloat(item.product.price) : Number(item.product?.price) || 0) * (item.quantity || 0)).toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removeFromCartMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Total:</span>
                <span className="text-lg font-bold text-sunny-orange">${cartTotal.toFixed(2)}</span>
              </div>
              <Button className="w-full bg-mint-300 hover:bg-mint-400 text-gray-800">
                <i className="fas fa-credit-card mr-2"></i>
                Checkout
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}