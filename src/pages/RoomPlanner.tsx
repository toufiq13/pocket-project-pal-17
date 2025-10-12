import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Canvas3DRoom } from "@/components/room-planner/Canvas3DRoom";
import { ProductSelector } from "@/components/room-planner/ProductSelector";
import { SavedDesigns } from "@/components/room-planner/SavedDesigns";
import { RoomTemplates } from "@/components/room-planner/RoomTemplates";
import { FurnitureSets } from "@/components/room-planner/FurnitureSets";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Trash2, ShoppingCart, Layers } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface PlacedItem {
  id: string;
  productId: string;
  productName: string;
  position: [number, number, number];
  rotation: number;
  scale: number;
}

export default function RoomPlanner() {
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [designName, setDesignName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleAddItem = (productId: string, productName: string) => {
    const newItem: PlacedItem = {
      id: crypto.randomUUID(),
      productId,
      productName,
      position: [0, 0, 0],
      rotation: 0,
      scale: 1,
    };
    setPlacedItems([...placedItems, newItem]);
    toast({
      title: "Item added",
      description: `${productName} added to your room`,
    });
  };

  const handleAddMultipleItems = (productIds: string[], productNames: string[]) => {
    const newItems: PlacedItem[] = productIds.map((id, index) => ({
      id: crypto.randomUUID(),
      productId: id,
      productName: productNames[index] || `Product ${index + 1}`,
      position: [Math.random() * 4 - 2, 0, Math.random() * 4 - 2],
      rotation: Math.random() * Math.PI * 2,
      scale: 1,
    }));
    setPlacedItems([...placedItems, ...newItems]);
    toast({
      title: "Items added",
      description: `${newItems.length} items added to your room`,
    });
  };

  const handleLoadTemplate = (items: PlacedItem[]) => {
    setPlacedItems(items);
    toast({
      title: "Template loaded",
      description: "Room template has been applied",
    });
  };

  const handleUpdateItem = (id: string, updates: Partial<PlacedItem>) => {
    setPlacedItems(
      placedItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setPlacedItems(placedItems.filter((item) => item.id !== id));
  };

  const handleSaveDesign = async () => {
    if (!designName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your design",
        variant: "destructive",
      });
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save designs",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("room_designs").insert({
        user_id: session.user.id,
        name: designName,
        design_data: placedItems as any,
      });

      if (error) throw error;

      toast({
        title: "Design saved",
        description: `${designName} has been saved successfully`,
      });
      setDesignName("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save design",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDesign = (items: PlacedItem[]) => {
    setPlacedItems(items);
    toast({
      title: "Design loaded",
      description: "Your saved design has been loaded",
    });
  };

  const handleClearRoom = () => {
    setPlacedItems([]);
    toast({
      title: "Room cleared",
      description: "All items have been removed",
    });
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

    if (placedItems.length === 0) {
      toast({
        title: "No items",
        description: "Add some furniture to your room first",
        variant: "destructive",
      });
      return;
    }

    try {
      const cartItems = placedItems.map((item) => ({
        user_id: session.user.id,
        product_id: item.productId,
        quantity: 1,
      }));

      const { error } = await supabase.from("cart").insert(cartItems);

      if (error) throw error;

      toast({
        title: "Added to cart",
        description: `${placedItems.length} items added to your cart`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add items to cart",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            3D Room Planner
          </h1>
          <p className="text-muted-foreground">
            Design your perfect space with templates, furniture sets, and 3D visualization
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Canvas Area */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-4 mb-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Design
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Your Design</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Enter design name..."
                        value={designName}
                        onChange={(e) => setDesignName(e.target.value)}
                      />
                      <Button
                        onClick={handleSaveDesign}
                        disabled={isSaving}
                        className="w-full"
                      >
                        Save
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <SavedDesigns onLoadDesign={handleLoadDesign} />

                <Button
                  variant="outline"
                  onClick={handleClearRoom}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>

                <Button
                  variant="default"
                  onClick={handleAddToCart}
                  className="gap-2"
                  disabled={placedItems.length === 0}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add All to Cart
                </Button>

                <div className="flex-1" />

                <span className="text-sm text-muted-foreground self-center">
                  {placedItems.length} items placed
                </span>
              </div>

              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <Canvas3DRoom
                  placedItems={placedItems}
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem}
                />
              </div>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Controls:</strong> Left click + drag to rotate | Right click + drag to pan | Scroll to zoom | Click items to select
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar with Tabs */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="products">
                  <Layers className="h-4 w-4 mr-1" />
                  Items
                </TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="sets">Sets</TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="mt-4">
                <ProductSelector onAddItem={handleAddItem} />
              </TabsContent>

              <TabsContent value="templates" className="mt-4">
                <RoomTemplates onSelectTemplate={handleLoadTemplate} />
              </TabsContent>

              <TabsContent value="sets" className="mt-4">
                <FurnitureSets
                  onAddSet={(productIds) => {
                    productIds.forEach((id, index) => {
                      handleAddItem(id, `Product ${index + 1}`);
                    });
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
