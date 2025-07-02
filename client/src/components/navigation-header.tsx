import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AdminLogin from "@/pages/admin-login";

export default function NavigationHeader() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isLoggedIn } = useAuth();

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: true,
  });

  const cartItemCount = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-mint-300 to-sky-300 rounded-full flex items-center justify-center">
              <i className="fas fa-heart text-white text-lg"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Joyville</h1>
          </Link>
          
          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className={`font-medium transition-colors ${location === "/" ? "text-sunny-orange" : "text-gray-700 hover:text-sunny-orange"}`}>
              Home
            </Link>
            <Link href="/retail" className={`font-medium transition-colors ${location === "/retail" ? "text-sunny-orange" : "text-gray-700 hover:text-sunny-orange"}`}>
              Retail
            </Link>
            <Link href="/wholesale" className={`font-medium transition-colors ${location === "/wholesale" ? "text-sunny-orange" : "text-gray-700 hover:text-sunny-orange"}`}>
              Wholesale
            </Link>
            <a href="#categories" className="text-gray-700 hover:text-sunny-orange font-medium transition-colors">Categories</a>
            <a href="#about" className="text-gray-700 hover:text-sunny-orange font-medium transition-colors">About</a>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden sm:block relative">
              <Input
                type="text"
                placeholder="Search toys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-mint-300 focus:border-transparent"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
            
            {/* Admin Access */}
            {isLoggedIn && user?.role === "superadmin" ? (
              <Link href="/admin/dashboard">
                <Button variant="outline" className="bg-purple-300 hover:bg-purple-400 text-gray-800 border-none">
                  <i className="fas fa-user-shield mr-1"></i>
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-purple-300 hover:bg-purple-400 text-gray-800 border-none">
                    <i className="fas fa-user-shield mr-1"></i>
                    Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <AdminLogin />
                </DialogContent>
              </Dialog>
            )}
            
            {/* Cart */}
            <Button variant="outline" className="relative bg-mint-300 hover:bg-mint-400 text-gray-800 border-none p-2">
              <i className="fas fa-shopping-cart"></i>
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-coral text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
            
            {/* Mobile Menu */}
            <Button variant="ghost" className="md:hidden p-2">
              <i className="fas fa-bars text-gray-700"></i>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-coral to-sunny-orange text-white py-3">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-medium">
            <i className="fas fa-gift mr-2"></i>
            Free shipping on orders over $50! Limited time offer.
            <i className="fas fa-gift ml-2"></i>
          </p>
        </div>
      </div>
    </header>
  );
}
