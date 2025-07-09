import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProductDetailModal from "@/components/product-detail-modal";
import type { ProductWithCategory } from "@shared/schema";

interface ProductCardProps {
  product: ProductWithCategory;
  badge?: "NEW" | "BESTSELLER";
}

export default function ProductCard({ product, badge }: ProductCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/cart", {
        method: "POST",
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (product.inventory > 0) {
      addToCartMutation.mutate();
    }
  };

  const isOutOfStock = product.inventory === 0;

  return (
    <ProductDetailModal product={product}>
      <Card className="card-hover toy-bounce bg-white rounded-2xl shadow-lg overflow-hidden relative border-none cursor-pointer">
        {badge && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className={`${badge === "NEW" ? "bg-sunny-orange" : "bg-coral"} text-white px-2 py-1 rounded-full text-xs font-semibold border-none`}>
              {badge}
            </Badge>
          </div>
        )}
        
        <img 
          src={product.imageUrls?.[0] || "https://images.unsplash.com/photo-1558060370-d644479cb6f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
          alt={product.name} 
          className="w-full h-48 object-cover" 
        />
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{product.category?.name}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-sunny-orange">${product.price}</span>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={addToCartMutation.isPending || isOutOfStock}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border-none ${
                isOutOfStock 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : "bg-mint-300 hover:bg-mint-400 text-gray-800"
              }`}
            >
              {addToCartMutation.isPending 
                ? "Adding..." 
                : isOutOfStock 
                  ? "Out of Stock" 
                  : "Add to Cart"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </ProductDetailModal>
  );
}
