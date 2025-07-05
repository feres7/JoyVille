import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from "@/components/ui/carousel";
import { ShoppingCart, Star, Package, Tag } from "lucide-react";
import { ProductWithCategory } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface ProductDetailModalProps {
  product: ProductWithCategory;
  children: React.ReactNode;
}

export default function ProductDetailModal({ product, children }: ProductDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!api) {
      return;
    }
    
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    }
  });

  const handleAddToCart = () => {
    addToCartMutation.mutate();
  };

  const images = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : ["https://images.unsplash.com/photo-1558060370-d644479cb6f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Carousel */}
          <div className="space-y-4">
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {images.map((imageUrl, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex aspect-square items-center justify-center p-6">
                          <img
                            src={imageUrl}
                            alt={`${product.name} - Image ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </>
              )}
            </Carousel>
            
            {/* Image Counter */}
            {images.length > 1 && (
              <div className="text-center text-sm text-gray-500">
                {current} of {count}
              </div>
            )}
            
            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex gap-2 justify-center flex-wrap">
                {images.map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition-colors ${
                      current === index + 1 
                        ? "border-mint-400 ring-2 ring-mint-200" 
                        : "border-gray-200 hover:border-mint-400"
                    }`}
                    onClick={() => api?.scrollTo(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-mint-100 text-mint-800">
                  {product.category?.name || "Uncategorized"}
                </Badge>
                {product.section && (
                  <Badge variant="outline" className={
                    product.section === "retail" 
                      ? "border-mint-300 text-mint-700" 
                      : "border-sky-300 text-sky-700"
                  }>
                    {product.section.charAt(0).toUpperCase() + product.section.slice(1)}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-4 h-4 fill-yellow-400 text-yellow-400" 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8/5 reviews)</span>
              </div>

              <div className="text-4xl font-bold text-gray-900 mb-4">
                ${product.price}
              </div>
            </div>

            {/* Product Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "No description available for this product."}
              </p>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Stock: {product.inventory > 0 ? `${product.inventory} available` : "Out of stock"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {product.isNew ? "New Arrival" : "Popular Item"}
                </span>
              </div>
            </div>

            {/* Special Badges */}
            <div className="flex gap-2">
              {product.isNew && (
                <Badge className="bg-coral-200 text-coral-800 hover:bg-coral-300">
                  NEW
                </Badge>
              )}
              {product.isBestseller && (
                <Badge className="bg-sunny-200 text-sunny-800 hover:bg-sunny-300">
                  BESTSELLER
                </Badge>
              )}
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-4">
              <Button 
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending || product.inventory === 0}
                className="w-full bg-mint-400 hover:bg-mint-500 text-white font-semibold py-3 text-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
              </Button>
              
              {product.inventory === 0 && (
                <p className="text-red-600 text-sm text-center">
                  Sorry, this item is currently out of stock.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}