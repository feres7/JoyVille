import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import UserAuthDialog from "@/components/user-auth-dialog";
import CartDropdown from "@/components/cart-dropdown";

export default function NavigationHeader() {
  const [location] = useLocation();
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();



  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Goodbye!",
        description: "You have been logged out successfully.",
      });
    },
  });

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

          </nav>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* User Authentication */}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-mint-300 hover:bg-mint-400 text-gray-800 border-none">
                    <i className="fas fa-user mr-2"></i>
                    {user?.username || "User"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem>
                    <i className="fas fa-user mr-2"></i>
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">
                      <i className="fas fa-clipboard-list mr-2"></i>
                      {user?.role === "superadmin" ? "Orders" : "My Orders"}
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === "superadmin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard">
                        <i className="fas fa-user-shield mr-2"></i>
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => logoutMutation.mutate()}
                    className="text-red-600 hover:text-red-800"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <UserAuthDialog>
                <Button variant="outline" className="bg-sky-300 hover:bg-sky-400 text-gray-800 border-none">
                  <i className="fas fa-user mr-2"></i>
                  Login / Sign Up
                </Button>
              </UserAuthDialog>
            )}
            
            {/* Cart */}
            <CartDropdown />
            
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
