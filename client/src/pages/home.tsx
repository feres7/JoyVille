import HeroCarousel from "@/components/hero-carousel";
import FeaturedCategories from "@/components/featured-categories";
import ProductShowcases from "@/components/product-showcases";
import BrandStory from "@/components/brand-story";

export default function Home() {
  return (
    <main>
      <HeroCarousel />
      <FeaturedCategories />
      <ProductShowcases />
      <BrandStory />
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-mint-300 to-sky-300 rounded-full flex items-center justify-center">
                  <i className="fas fa-heart text-white text-sm"></i>
                </div>
                <h3 className="text-xl font-bold">Joyville</h3>
              </div>
              <p className="text-gray-300 mb-4">Sparking joy in every child's playtime with carefully curated, safe, and educational toys.</p>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-300 hover:text-mint-300 transition-colors">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-mint-300 transition-colors">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-mint-300 transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-mint-300 transition-colors">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-300 hover:text-mint-300 transition-colors">Home</a></li>
                <li><a href="/retail" className="text-gray-300 hover:text-mint-300 transition-colors">Retail Shop</a></li>
                <li><a href="/wholesale" className="text-gray-300 hover:text-mint-300 transition-colors">Wholesale</a></li>
                <li><a href="#" className="text-gray-300 hover:text-mint-300 transition-colors">Categories</a></li>
                <li><a href="#" className="text-gray-300 hover:text-mint-300 transition-colors">About Us</a></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Customer Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-mint-300 transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-mint-300 transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-300 hover:text-mint-300 transition-colors">Shipping & Returns</a></li>
                <li><a href="#" className="text-gray-300 hover:text-mint-300 transition-colors">Size Guide</a></li>
                <li><a href="#" className="text-gray-300 hover:text-mint-300 transition-colors">Track Order</a></li>
              </ul>
            </div>
            
            {/* Newsletter */}
            <div>
              <h4 className="font-semibold mb-4">Stay Updated</h4>
              <p className="text-gray-300 mb-4">Get the latest toys and special offers!</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-lg focus:ring-2 focus:ring-mint-300 focus:border-transparent text-white placeholder-gray-400" 
                />
                <button className="bg-mint-500 hover:bg-mint-600 text-white px-4 py-2 rounded-r-lg transition-colors">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-300 text-sm">
                © 2024 Joyville. All rights reserved. Making childhood magical, one toy at a time.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-300 hover:text-mint-300 text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-300 hover:text-mint-300 text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-300 hover:text-mint-300 text-sm transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
