import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Canvas3DRoom } from "@/components/room-planner/Canvas3DRoom";
import { ProductSelector } from "@/components/room-planner/ProductSelector";
import { SavedDesigns } from "@/components/room-planner/SavedDesigns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Download, Trash2 } from "lucide-react";
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            3D Room Planner
          </h1>
          <p className="text-muted-foreground">
            Design your perfect space by placing furniture in a 3D environment
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg border border-border p-4 mb-4">
              <div className="flex gap-2 mb-4">
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
                  Clear Room
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
                  <strong>Controls:</strong> Left click + drag to rotate view |
                  Right click + drag to pan | Scroll to zoom | Click items to
                  select and move
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <ProductSelector onAddItem={handleAddItem} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
