import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-luxury bg-clip-text text-transparent">
              LuxInnovate Interiors
            </h3>
            <p className="text-sm text-muted-foreground">
              Where luxury meets innovation in interior design and furniture.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LuxInnovate Interiors. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
