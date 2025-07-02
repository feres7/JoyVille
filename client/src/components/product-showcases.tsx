import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import type { ProductWithCategory } from "@shared/schema";

export default function ProductShowcases() {
  const { data: products = [], isLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products"],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-mint-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">✨ New Arrivals</h2>
                <p className="text-gray-600">Fresh toys that just landed in Joyville!</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const newArrivals = products.filter(p => p.isNew).slice(0, 4);
  const bestsellers = products.filter(p => p.isBestseller).slice(0, 4);

  return (
    <section className="py-16 bg-gradient-to-b from-white to-mint-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* New Arrivals */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                ✨ New Arrivals
              </h2>
              <p className="text-gray-600">Fresh toys that just landed in Joyville!</p>
            </div>
            <Button variant="ghost" className="text-sunny-orange hover:text-orange-500 font-semibold">
              View All <i className="fas fa-arrow-right ml-1"></i>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} badge="NEW" />
            ))}
            {newArrivals.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No new arrivals to display</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Bestsellers */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                🏆 Bestsellers
              </h2>
              <p className="text-gray-600">The toys that spark the most joy!</p>
            </div>
            <Button variant="ghost" className="text-sunny-orange hover:text-orange-500 font-semibold">
              View All <i className="fas fa-arrow-right ml-1"></i>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} badge="BESTSELLER" />
            ))}
            {bestsellers.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No bestsellers to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
