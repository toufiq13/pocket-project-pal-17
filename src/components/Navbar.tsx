import { Link } from "react-router-dom";
import { ShoppingCart, Heart, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold bg-gradient-luxury bg-clip-text text-transparent">
              LuxInnovate
            </h1>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search luxury furniture..."
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/products" className="text-sm font-medium hover:text-primary transition-smooth">
              Products
            </Link>
            <Link to="/categories" className="text-sm font-medium hover:text-primary transition-smooth">
              Categories
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-smooth">
              About
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/auth">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
