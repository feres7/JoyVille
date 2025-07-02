import { Button } from "@/components/ui/button";

export default function BrandStory() {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              The Magic Behind Joyville
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              At Joyville, we believe every child deserves toys that inspire wonder, creativity, and learning. 
              Since 2010, we've been carefully curating the most delightful, safe, and educational toys 
              from around the world.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Our mission is simple: to spark joy in every child's playtime while giving parents peace of mind 
              with our commitment to quality, safety, and developmental value.
            </p>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-mint-300 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-shield-alt text-mint-600"></i>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Safety First</h3>
                <p className="text-sm text-gray-600">All toys tested & certified</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-sky-300 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-leaf text-sky-600"></i>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Eco-Friendly</h3>
                <p className="text-sm text-gray-600">Sustainable materials</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-sunny-300 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-heart text-sunny-600"></i>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Made with Love</h3>
                <p className="text-sm text-gray-600">Carefully curated selection</p>
              </div>
            </div>
            
            <Button className="bg-gradient-to-r from-sunny-orange to-coral text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg">
              Learn More About Us
            </Button>
          </div>
          
          <div className="relative">
            <img 
              src="https://pixabay.com/get/g08faa7206a90a562790ac062e26803a60386df846fbb8b6c7ce09aa43ee2f3171847463c78263a804fd8ade649f92d6ee9fdcebca662c97a097a9f44088e575e_1280.jpg" 
              alt="Children happily playing with educational toys in a bright, cheerful environment" 
              className="rounded-2xl shadow-2xl w-full h-auto" 
            />
            
            {/* Floating testimonial */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 max-w-xs animate-float">
              <div className="flex items-center mb-2">
                <div className="flex text-sunny-400">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">"My kids absolutely love their Joyville toys! Quality is amazing."</p>
              <p className="text-xs text-gray-500 font-medium">- Sarah M., Happy Parent</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
