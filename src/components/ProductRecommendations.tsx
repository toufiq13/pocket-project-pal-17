import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  description: string;
  category_id: string;
}

interface ProductRecommendationsProps {
  productId?: string;
  title?: string;
  limit?: number;
}

export function ProductRecommendations({
  productId,
  title = "You May Also Like",
  limit = 4,
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecommendations();
  }, [productId]);

  const fetchRecommendations = async () => {
    try {
      if (productId) {
        const { data: currentProduct } = await supabase
          .from("products")
          .select("category_id")
          .eq("id", productId)
          .single();

        if (currentProduct) {
          const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("category_id", currentProduct.category_id)
            .neq("id", productId)
            .limit(limit);

          if (error) throw error;
          setRecommendations(data || []);
        }
      } else {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_featured", true)
          .limit(limit);

        if (error) throw error;
        setRecommendations(data || []);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-serif font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-serif font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
