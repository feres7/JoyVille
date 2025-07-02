import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import type { Category } from "@shared/schema";

export default function FeaturedCategories() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

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
    const colorMap: Record<string, string> = {
      mint: "from-mint-100 to-mint-200 bg-mint-300 text-mint-600",
      sky: "from-sky-100 to-sky-200 bg-sky-300 text-sky-600",
      sunny: "from-sunny-100 to-sunny-200 bg-sunny-300 text-sunny-600",
      lavender: "from-lavender-100 to-lavender-200 bg-lavender-300 text-lavender-600",
      coral: "from-coral/20 to-coral/30 bg-coral/40 text-coral",
      turquoise: "from-turquoise/20 to-turquoise/30 bg-turquoise/40 text-turquoise",
    };
    return colorMap[color] || "from-gray-100 to-gray-200 bg-gray-300 text-gray-600";
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
            const [gradientClasses, iconBgClass, iconColorClass] = colorClasses.split(' bg-');
            
            return (
              <Card 
                key={category.id} 
                className={`card-hover toy-bounce bg-gradient-to-br ${gradientClasses} rounded-2xl p-6 text-center cursor-pointer border-none`}
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-${iconBgClass} rounded-full flex items-center justify-center`}>
                  <i className={`${category.icon} text-2xl ${iconColorClass}`}></i>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600">View Category</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
