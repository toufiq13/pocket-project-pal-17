import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const { userId, productId, limit = 6 } = await req.json();

    console.log('Getting recommendations for:', { userId, productId, limit });

    let recommendations: any[] = [];

    // Strategy 1: Collaborative Filtering (if userId provided)
    if (userId) {
      // Get user's past high-rated reviews
      const { data: userReviews } = await supabaseClient
        .from('reviews')
        .select('product_id, rating')
        .eq('user_id', userId)
        .gte('rating', 4)
        .limit(5);

      // Get user's wishlist
      const { data: wishlist } = await supabaseClient
        .from('wishlist')
        .select('product_id')
        .eq('user_id', userId)
        .limit(5);

      // Get user's recent interactions
      const { data: interactions } = await supabaseClient
        .from('user_interactions')
        .select('product_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      const userProductIds = [
        ...(userReviews?.map(r => r.product_id) || []),
        ...(wishlist?.map(w => w.product_id) || []),
        ...(interactions?.map(i => i.product_id) || [])
      ];

      if (userProductIds.length > 0) {
        // Get categories of products user likes
        const { data: likedProducts } = await supabaseClient
          .from('products')
          .select('category_id, material, style')
          .in('id', userProductIds);

        if (likedProducts && likedProducts.length > 0) {
          const categoryIds = [...new Set(likedProducts.map(p => p.category_id).filter(Boolean))];
          const materials = [...new Set(likedProducts.map(p => p.material).filter(Boolean))];
          const styles = [...new Set(likedProducts.map(p => p.style).filter(Boolean))];

          // Find similar products
          let query = supabaseClient
            .from('products')
            .select('id, name, price, images, slug, description')
            .not('id', 'in', `(${[...userProductIds, productId].filter(Boolean).join(',')})`)
            .limit(limit);

          if (categoryIds.length > 0) {
            query = query.in('category_id', categoryIds);
          }

          const { data: similarProducts } = await query;
          
          if (similarProducts && similarProducts.length > 0) {
            recommendations = similarProducts;
          }
        }
      }
    }

    // Strategy 2: Content-Based Filtering (if productId provided and not enough recommendations)
    if (productId && recommendations.length < limit) {
      const { data: currentProduct } = await supabaseClient
        .from('products')
        .select('category_id, material, style, price')
        .eq('id', productId)
        .single();

      if (currentProduct) {
        let query = supabaseClient
          .from('products')
          .select('id, name, price, images, slug, description')
          .neq('id', productId)
          .limit(limit - recommendations.length);

        // Match by category
        if (currentProduct.category_id) {
          query = query.eq('category_id', currentProduct.category_id);
        }

        // Match by price range (±30%)
        if (currentProduct.price) {
          const minPrice = currentProduct.price * 0.7;
          const maxPrice = currentProduct.price * 1.3;
          query = query.gte('price', minPrice).lte('price', maxPrice);
        }

        const { data: contentBasedProducts } = await query;
        
        if (contentBasedProducts) {
          recommendations = [...recommendations, ...contentBasedProducts];
        }
      }
    }

    // Strategy 3: Trending Products (fallback)
    if (recommendations.length < limit) {
      // Get most viewed products in last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: trendingInteractions } = await supabaseClient
        .from('user_interactions')
        .select('product_id')
        .gte('created_at', sevenDaysAgo)
        .in('interaction_type', ['view', 'like', 'add_to_cart']);

      if (trendingInteractions && trendingInteractions.length > 0) {
        // Count occurrences
        const productCounts = trendingInteractions.reduce((acc: any, curr) => {
          acc[curr.product_id] = (acc[curr.product_id] || 0) + 1;
          return acc;
        }, {});

        const trendingProductIds = Object.entries(productCounts)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, limit - recommendations.length)
          .map(([id]) => id);

        if (trendingProductIds.length > 0) {
          const { data: trendingProducts } = await supabaseClient
            .from('products')
            .select('id, name, price, images, slug, description')
            .in('id', trendingProductIds)
            .limit(limit - recommendations.length);

          if (trendingProducts) {
            recommendations = [...recommendations, ...trendingProducts];
          }
        }
      }
    }

    // Strategy 4: Featured Products (final fallback)
    if (recommendations.length < limit) {
      const { data: featuredProducts } = await supabaseClient
        .from('products')
        .select('id, name, price, images, slug, description')
        .eq('is_featured', true)
        .limit(limit - recommendations.length);

      if (featuredProducts) {
        recommendations = [...recommendations, ...featuredProducts];
      }
    }

    // Remove duplicates
    const uniqueRecommendations = Array.from(
      new Map(recommendations.map(item => [item.id, item])).values()
    ).slice(0, limit);

    console.log(`Returning ${uniqueRecommendations.length} recommendations`);

    return new Response(
      JSON.stringify({ recommendations: uniqueRecommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-recommendations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, recommendations: [] }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
