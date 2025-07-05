import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import type { Category } from "@shared/schema";

export default function FeaturedCategories() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Explore Our Toy Universe
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From cuddly plush friends to educational building blocks, find the perfect toy for every little adventurer.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
      mint: { bg: "bg-mint-200", text: "text-mint-700", iconBg: "bg-mint-300" },
      sky: { bg: "bg-sky-200", text: "text-sky-700", iconBg: "bg-sky-300" },
      sunny: { bg: "bg-sunny-200", text: "text-sunny-700", iconBg: "bg-sunny-300" },
      purple: { bg: "bg-purple-200", text: "text-purple-700", iconBg: "bg-purple-300" },
      lavender: { bg: "bg-purple-200", text: "text-purple-700", iconBg: "bg-purple-300" },
      coral: { bg: "bg-coral/30", text: "text-coral", iconBg: "bg-coral/40" },
      turquoise: { bg: "bg-turquoise/30", text: "text-turquoise", iconBg: "bg-turquoise/40" },
      red: { bg: "bg-red-200", text: "text-red-700", iconBg: "bg-red-300" },
      brown: { bg: "bg-amber-200", text: "text-amber-800", iconBg: "bg-amber-300" },
    };
    return colorMap[color] || { bg: "bg-gray-200", text: "text-gray-700", iconBg: "bg-gray-300" };
  };

  const handleCategoryClick = (categoryId: number) => {
    setLocation(`/retail?category=${categoryId}`);
  };

  return (
    <section id="categories" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Explore Our Toy Universe
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From cuddly plush friends to educational building blocks, find the perfect toy for every little adventurer.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => {
            const colorClasses = getColorClasses(category.color);
            
            return (
              <Card 
                key={category.id} 
                className={`card-hover toy-bounce ${colorClasses.bg} rounded-2xl p-6 text-center cursor-pointer border-none transition-all duration-300 hover:scale-105`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className={`w-16 h-16 mx-auto mb-4 ${colorClasses.iconBg} rounded-full flex items-center justify-center`}>
                  <i className={`${category.icon} text-2xl ${colorClasses.text}`}></i>
                </div>
                <h3 className={`font-semibold mb-2 ${colorClasses.text}`}>{category.name}</h3>
                <p className={`text-sm ${colorClasses.text} opacity-70`}>View Category</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
