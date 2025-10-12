import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[] | null;
  description: string | null;
}

interface ProductRecommendationsProps {
  currentProductId?: string;
  userId?: string;
  title?: string;
  limit?: number;
}

export function ProductRecommendations({
  currentProductId,
  userId,
  title = "You May Also Like",
  limit = 6,
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecommendations();
  }, [currentProductId, userId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);

      if (userId) {
        // Collaborative filtering: Get products based on user's past reviews and wishlist
        const { data: userReviews } = await supabase
          .from("reviews")
          .select("product_id, rating")
          .eq("user_id", userId)
          .gte("rating", 4)
          .limit(5);

        const { data: wishlist } = await supabase
          .from("wishlist")
          .select("product_id")
          .eq("user_id", userId)
          .limit(5);

        const productIds = [
          ...(userReviews?.map(r => r.product_id) || []),
          ...(wishlist?.map(w => w.product_id) || [])
        ];

        if (productIds.length > 0 && currentProductId) {
          productIds.push(currentProductId);
        }

        if (productIds.length > 0) {
          // Get similar products based on category
          const { data: relatedProducts } = await supabase
            .from("products")
            .select("id, name, price, images, slug, description")
            .not("id", "in", `(${productIds.join(",")})`)
            .limit(limit);

          if (relatedProducts && relatedProducts.length > 0) {
            setRecommendations(relatedProducts);
            return;
          }
        }
      }

      if (currentProductId) {
        // Content-based filtering: Get similar products from same category
        const { data: currentProduct } = await supabase
          .from("products")
          .select("category_id")
          .eq("id", currentProductId)
          .single();

        if (currentProduct?.category_id) {
          const { data: similarProducts } = await supabase
            .from("products")
            .select("id, name, price, images, slug, description")
            .eq("category_id", currentProduct.category_id)
            .neq("id", currentProductId)
            .limit(limit);

          if (similarProducts && similarProducts.length > 0) {
            setRecommendations(similarProducts);
            return;
          }
        }
      }

      // Fallback: Get featured products
      const { data: featuredProducts } = await supabase
        .from("products")
        .select("id, name, price, images, slug, description")
        .eq("is_featured", true)
        .limit(limit);

      if (featuredProducts) {
        setRecommendations(featuredProducts);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to load recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-64 rounded-lg mb-4"></div>
                <div className="bg-muted h-4 w-3/4 rounded mb-2"></div>
                <div className="bg-muted h-4 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-muted/50">
      <div className="container">
        <h2 className="text-3xl font-bold mb-8">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
