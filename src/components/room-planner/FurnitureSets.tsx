import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FurnitureSet {
  id: string;
  name: string;
  description: string;
  products: {
    id: string;
    name: string;
    price: number;
  }[];
  totalPrice: number;
  discount: number;
  category: string;
}

interface FurnitureSetsProps {
  onAddSet: (productIds: string[]) => void;
}

export function FurnitureSets({ onAddSet }: FurnitureSetsProps) {
  const [sets, setSets] = useState<FurnitureSet[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFurnitureSets();
  }, []);

  const fetchFurnitureSets = async () => {
    try {
      // Fetch products by category to create sets
      const { data: products, error } = await supabase
        .from("products")
        .select("id, name, price, category_id, categories(name)")
        .limit(50);

      if (error) throw error;

      // Group products by category and create sets
      const categorizedSets: FurnitureSet[] = [];

      // Living Room Set
      const livingRoomProducts = products?.filter((p: any) =>
        p.categories?.name?.toLowerCase().includes("living") ||
        p.name.toLowerCase().includes("sofa") ||
        p.name.toLowerCase().includes("coffee table")
      ).slice(0, 4) || [];

      if (livingRoomProducts.length > 0) {
        const totalPrice = livingRoomProducts.reduce((sum, p) => sum + p.price, 0);
        categorizedSets.push({
          id: "living-room-set",
          name: "Complete Living Room Set",
          description: "Everything you need for a stylish living room",
          products: livingRoomProducts,
          totalPrice,
          discount: 15,
          category: "Living Room",
        });
      }

      // Office Set
      const officeProducts = products?.filter((p: any) =>
        p.name.toLowerCase().includes("desk") ||
        p.name.toLowerCase().includes("chair") ||
        p.name.toLowerCase().includes("shelf")
      ).slice(0, 3) || [];

      if (officeProducts.length > 0) {
        const totalPrice = officeProducts.reduce((sum, p) => sum + p.price, 0);
        categorizedSets.push({
          id: "office-set",
          name: "Home Office Essentials",
          description: "Create your perfect workspace",
          products: officeProducts,
          totalPrice,
          discount: 12,
          category: "Office",
        });
      }

      // Bedroom Set
      const bedroomProducts = products?.filter((p: any) =>
        p.name.toLowerCase().includes("bed") ||
        p.name.toLowerCase().includes("nightstand") ||
        p.name.toLowerCase().includes("wardrobe")
      ).slice(0, 4) || [];

      if (bedroomProducts.length > 0) {
        const totalPrice = bedroomProducts.reduce((sum, p) => sum + p.price, 0);
        categorizedSets.push({
          id: "bedroom-set",
          name: "Bedroom Suite",
          description: "Complete bedroom furniture collection",
          products: bedroomProducts,
          totalPrice,
          discount: 18,
          category: "Bedroom",
        });
      }

      // Dining Set
      const diningProducts = products?.filter((p: any) =>
        p.name.toLowerCase().includes("dining") ||
        p.name.toLowerCase().includes("table") ||
        p.name.toLowerCase().includes("chair")
      ).slice(0, 5) || [];

      if (diningProducts.length > 0) {
        const totalPrice = diningProducts.reduce((sum, p) => sum + p.price, 0);
        categorizedSets.push({
          id: "dining-set",
          name: "Dining Room Collection",
          description: "Perfect for family gatherings",
          products: diningProducts,
          totalPrice,
          discount: 20,
          category: "Dining",
        });
      }

      setSets(categorizedSets);
    } catch (error) {
      console.error("Error fetching furniture sets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (set: FurnitureSet) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to cart",
      });
      return;
    }

    try {
      // Add all products from the set to cart
      const cartItems = set.products.map((product) => ({
        user_id: session.user.id,
        product_id: product.id,
        quantity: 1,
      }));

      const { error } = await supabase.from("cart").insert(cartItems);

      if (error) throw error;

      toast({
        title: "Set added to cart",
        description: `${set.name} has been added to your cart with ${set.discount}% discount`,
      });
    } catch (error) {
      console.error("Error adding set to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add set to cart",
        variant: "destructive",
      });
    }
  };

  const handleAddToRoom = (set: FurnitureSet) => {
    const productIds = set.products.map((p) => p.id);
    onAddSet(productIds);
    toast({
      title: "Set added to room",
      description: `${set.name} has been added to your 3D room`,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Furniture Sets
        </CardTitle>
        <CardDescription>
          Curated furniture combinations with special discounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {sets.map((set) => (
              <Card key={set.id} className="hover:border-primary transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold mb-1">{set.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {set.description}
                      </p>
                      <Badge variant="secondary">{set.category}</Badge>
                    </div>
                    <Badge variant="destructive" className="ml-2">
                      {set.discount}% OFF
                    </Badge>
                  </div>

                  <div className="space-y-1 mb-3">
                    {set.products.map((product, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground flex justify-between">
                        <span>• {product.name}</span>
                        <span>₹{product.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground line-through">
                        ₹{set.totalPrice.toLocaleString()}
                      </p>
                      <p className="font-bold text-lg text-primary">
                        ₹{Math.round(set.totalPrice * (1 - set.discount / 100)).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddToRoom(set)}
                      >
                        Add to Room
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(set)}
                        className="gap-1"
                      >
                        <ShoppingCart className="h-3 w-3" />
                        Buy Set
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {sets.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No furniture sets available
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}