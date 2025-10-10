import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: string;
  name: string;
  images: string[];
  price: number;
}

interface ProductSelectorProps {
  onAddItem: (productId: string, productName: string) => void;
}

export function ProductSelector({ onAddItem }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, images, price")
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProductsByCategory = (category: string) => {
    return filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(category.toLowerCase())
    );
  };

  const renderProductList = (productList: Product[]) => (
    <div className="space-y-2">
      {productList.map((product) => (
        <div
          key={product.id}
          className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary transition-colors"
        >
          <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
            <img
              src={product.images?.[0] || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{product.name}</p>
            <p className="text-xs text-muted-foreground">
              ₹{product.price.toLocaleString()}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onAddItem(product.id, product.name)}
            className="flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {productList.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          No products found
        </p>
      )}
    </div>
  );

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h3 className="font-semibold mb-4">Add Furniture</h3>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="seating">Seating</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="all" className="mt-0">
              {renderProductList(filteredProducts)}
            </TabsContent>

            <TabsContent value="seating" className="mt-0">
              {renderProductList(
                getProductsByCategory("sofa").concat(
                  getProductsByCategory("chair")
                )
              )}
            </TabsContent>

            <TabsContent value="storage" className="mt-0">
              {renderProductList(
                getProductsByCategory("cabinet").concat(
                  getProductsByCategory("wardrobe")
                )
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      )}
    </div>
  );
}
