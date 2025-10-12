import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "./ProductCard";
import { TrendingUp } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  slug: string;
  description: string | null;
}

export function TrendingProducts() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      setLoading(true);

      // Get products with most reviews in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: reviewCounts } = await supabase
        .from("reviews")
        .select("product_id")
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (reviewCounts) {
        // Count reviews per product
        const productReviewCounts = reviewCounts.reduce((acc, review) => {
          acc[review.product_id] = (acc[review.product_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Sort by review count and get top products
        const topProductIds = Object.entries(productReviewCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6)
          .map(([id]) => id);

        if (topProductIds.length > 0) {
          const { data: products } = await supabase
            .from("products")
            .select("id, name, price, images, slug, description")
            .in("id", topProductIds);

          if (products) {
            // Sort products by review count
            const sortedProducts = products.sort((a, b) => {
              return productReviewCounts[b.id] - productReviewCounts[a.id];
            });
            setTrendingProducts(sortedProducts);
            return;
          }
        }
      }

      // Fallback: Get featured products
      const { data: featuredProducts } = await supabase
        .from("products")
        .select("id, name, price, images, slug, description")
        .eq("is_featured", true)
        .limit(6);

      if (featuredProducts) {
        setTrendingProducts(featuredProducts);
      }
    } catch (error) {
      console.error("Error fetching trending products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="container">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Trending Now</h2>
          </div>
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

  if (trendingProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4">
      <div className="container">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold">Trending Now</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}