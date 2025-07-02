import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductCard from "@/components/product-card";
import type { ProductWithCategory, Category } from "@shared/schema";

export default function Retail() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products = [], isLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products", "retail", selectedCategory, searchQuery],
    queryFn: () => {
      let url = "/api/products?section=retail";
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      return fetch(url).then(res => res.json());
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🛍️ Retail Toy Shop
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover magical toys perfect for every child! Our retail collection features the latest and greatest toys at amazing prices.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search toys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3 text-lg rounded-full border-2 focus:ring-2 focus:ring-mint-300"
              />
              <i className="fas fa-search absolute left-3 top-4 text-gray-400"></i>
            </div>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
              variant="outline"
              className="px-6 py-3 rounded-full"
            >
              Clear Filters
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setSelectedCategory(null)}
              variant={selectedCategory === null ? "default" : "outline"}
              className={`rounded-full ${selectedCategory === null ? "bg-mint-400 text-white" : ""}`}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`rounded-full ${selectedCategory === category.id ? "bg-mint-400 text-white" : ""}`}
              >
                <i className={`${category.icon} mr-1`}></i>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            {isLoading ? "Loading..." : `${products.length} toys found`}
            {selectedCategory && (
              <span className="ml-2">
                in <strong>{categories.find(c => c.id === selectedCategory)?.name}</strong>
              </span>
            )}
            {searchQuery && (
              <span className="ml-2">
                for "<strong>{searchQuery}</strong>"
              </span>
            )}
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🧸</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No toys found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any toys matching your search criteria.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
                className="bg-mint-400 hover:bg-mint-500 text-white"
              >
                Browse All Toys
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                badge={product.isNew ? "NEW" : product.isBestseller ? "BESTSELLER" : undefined}
              />
            ))}
          </div>
        )}

        {/* Featured Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-mint-100 to-sky-100 border-none">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">
                Can't find what you're looking for?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Check out our wholesale section for bulk orders and special deals!
              </p>
              <Button 
                onClick={() => window.location.href = "/wholesale"}
                className="bg-turquoise hover:bg-cyan-600 text-white px-8 py-3 rounded-full font-semibold"
              >
                Browse Wholesale
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
