import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderOpen, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PlacedItem } from "@/pages/RoomPlanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SavedDesign {
  id: string;
  name: string;
  design_data: PlacedItem[];
  created_at: string;
}

interface SavedDesignsProps {
  onLoadDesign: (items: PlacedItem[]) => void;
}

export function SavedDesigns({ onLoadDesign }: SavedDesignsProps) {
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchDesigns();
    }
  }, [open]);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: "Sign in required",
          description: "Please sign in to view saved designs",
        });
        return;
      }

      const { data, error } = await supabase
        .from("room_designs")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDesigns((data as any) || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load designs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDesign = (design: SavedDesign) => {
    onLoadDesign(design.design_data);
    setOpen(false);
  };

  const handleDeleteDesign = async (id: string) => {
    try {
      const { error } = await supabase.from("room_designs").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Design deleted",
        description: "The design has been removed",
      });
      fetchDesigns();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete design",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FolderOpen className="h-4 w-4" />
          Load Design
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Your Saved Designs</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : designs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No saved designs yet
            </p>
          ) : (
            <div className="space-y-3">
              {designs.map((design) => (
                <div
                  key={design.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary transition-colors"
                >
                  <div>
                    <h4 className="font-medium">{design.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {design.design_data.length} items •{" "}
                      {new Date(design.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleLoadDesign(design)}
                    >
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteDesign(design.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
