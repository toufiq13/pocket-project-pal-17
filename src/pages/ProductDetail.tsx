import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Heart, ShoppingCart, Star, ChevronLeft } from "lucide-react";
import { ProductReviews } from "@/components/ProductReviews";
import { ProductRecommendations } from "@/components/ProductRecommendations";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  material: string;
  color: string;
  dimensions: string;
  stock_quantity: number;
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to cart",
      });
      return;
    }

    try {
      const { error } = await supabase.from("cart").insert({
        user_id: session.user.id,
        product_id: product?.id,
        quantity,
      });

      if (error) throw error;

      toast({
        title: "Added to cart",
        description: `${product?.name} has been added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  const handleAddToWishlist = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to wishlist",
      });
      return;
    }

    try {
      const { error } = await supabase.from("wishlist").insert({
        user_id: session.user.id,
        product_id: product?.id,
      });

      if (error) throw error;

      toast({
        title: "Added to wishlist",
        description: `${product?.name} has been added to your wishlist`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to wishlist",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Product not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
              <img
                src={product.images?.[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden ${
                      selectedImage === idx ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-serif font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.8)</span>
              </div>
              <p className="text-3xl font-bold text-primary">₹{product.price.toLocaleString()}</p>
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            <div className="space-y-3">
              {product.material && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Material:</span>
                  <span className="font-medium">{product.material}</span>
                </div>
              )}
              {product.color && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Color:</span>
                  <span className="font-medium">{product.color}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span className="font-medium">{product.dimensions}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stock:</span>
                <span className="font-medium">
                  {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="px-4">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg" onClick={handleAddToWishlist}>
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <ProductReviews productId={product.id} />

        <ProductRecommendations productId={product.id} title="Complete The Look" />
      </main>

      <Footer />
    </div>
  );
}
