import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductCard from "@/components/product-card";
import type { ProductWithCategory, Category } from "@shared/schema";

export default function Wholesale() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products = [], isLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products", "wholesale", selectedCategory, searchQuery],
    queryFn: () => {
      let url = "/api/products?section=wholesale";
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      return fetch(url).then(res => res.json());
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🏬 Wholesale Toy Center
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Perfect for retailers, schools, and organizations! Our wholesale collection offers bulk quantities at competitive prices.
          </p>
        </div>

        {/* Wholesale Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center bg-sky-100 border-none">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-sky-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-percentage text-sky-600 text-xl"></i>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Bulk Discounts</h3>
              <p className="text-sm text-gray-600">Save more with larger quantities</p>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-turquoise/20 border-none">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-turquoise/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shipping-fast text-turquoise text-xl"></i>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Fast Shipping</h3>
              <p className="text-sm text-gray-600">Quick delivery for business needs</p>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-sunny-100 border-none">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-sunny-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-handshake text-sunny-600 text-xl"></i>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Business Support</h3>
              <p className="text-sm text-gray-600">Dedicated account management</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search wholesale toys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3 text-lg rounded-full border-2 focus:ring-2 focus:ring-sky-300"
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
              className={`rounded-full ${selectedCategory === null ? "bg-sky-400 text-white" : ""}`}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`rounded-full ${selectedCategory === category.id ? "bg-sky-400 text-white" : ""}`}
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
            {isLoading ? "Loading..." : `${products.length} wholesale items found`}
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
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No wholesale items found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any wholesale items matching your search criteria.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
                className="bg-sky-400 hover:bg-sky-500 text-white"
              >
                Browse All Items
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

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-sky-100 to-turquoise/20 border-none">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">
                Need Custom Pricing or Large Orders?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Contact our wholesale team for personalized quotes and special arrangements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-turquoise hover:bg-cyan-600 text-white px-8 py-3 rounded-full font-semibold">
                  <i className="fas fa-phone mr-2"></i>
                  Call Us
                </Button>
                <Button variant="outline" className="px-8 py-3 rounded-full font-semibold">
                  <i className="fas fa-envelope mr-2"></i>
                  Email Quote Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
