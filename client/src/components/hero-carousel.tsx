import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroCarousel() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-mint-100 via-sky-100 to-sunny-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Spark Joy with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sunny-orange to-coral"> Joyville</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Discover magical toys that inspire creativity, learning, and endless fun for children of all ages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/retail">
                <Button className="bg-sunny-orange hover:bg-orange-500 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg">
                  <i className="fas fa-shopping-bag mr-2"></i>
                  Shop Retail
                </Button>
              </Link>
              <Link href="/wholesale">
                <Button className="bg-turquoise hover:bg-cyan-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg">
                  <i className="fas fa-store mr-2"></i>
                  Browse Wholesale
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative">
            {/* Hero toy display */}
            <img 
              src="https://images.unsplash.com/photo-1558060370-d644479cb6f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Colorful collection of children's toys including blocks, dolls, and educational toys" 
              className="rounded-2xl shadow-2xl w-full h-auto animate-float" 
            />
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-sunny-300 rounded-full flex items-center justify-center animate-bounce-gentle">
              <i className="fas fa-star text-sunny-orange text-xl"></i>
            </div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-lavender-300 rounded-full flex items-center justify-center animate-wiggle">
              <i className="fas fa-heart text-lavender-500 text-lg"></i>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
