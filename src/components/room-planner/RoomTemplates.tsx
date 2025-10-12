import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, Building2, Briefcase, Coffee, Bed, Users } from "lucide-react";
import { PlacedItem } from "@/pages/RoomPlanner";

interface RoomTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  items: Omit<PlacedItem, "id">[];
  roomSize: [number, number];
}

interface RoomTemplatesProps {
  onSelectTemplate: (items: PlacedItem[]) => void;
}

const templates: RoomTemplate[] = [
  {
    id: "living-room-modern",
    name: "Modern Living Room",
    description: "Minimalist living space with contemporary furniture",
    icon: <Home className="h-5 w-5" />,
    roomSize: [15, 12],
    items: [
      {
        productId: "template-sofa-1",
        productName: "Modern Sofa",
        position: [0, 0, -3],
        rotation: 0,
        scale: 1.2,
      },
      {
        productId: "template-coffee-table-1",
        productName: "Coffee Table",
        position: [0, 0, 0],
        rotation: 0,
        scale: 1,
      },
      {
        productId: "template-tv-unit-1",
        productName: "TV Unit",
        position: [0, 0, 4],
        rotation: Math.PI,
        scale: 1.5,
      },
      {
        productId: "template-chair-1",
        productName: "Accent Chair",
        position: [-3, 0, -1],
        rotation: -Math.PI / 4,
        scale: 1,
      },
      {
        productId: "template-chair-2",
        productName: "Accent Chair",
        position: [3, 0, -1],
        rotation: Math.PI / 4,
        scale: 1,
      },
    ],
  },
  {
    id: "office-minimal",
    name: "Minimal Office",
    description: "Clean and productive workspace",
    icon: <Briefcase className="h-5 w-5" />,
    roomSize: [12, 10],
    items: [
      {
        productId: "template-desk-1",
        productName: "Office Desk",
        position: [0, 0, 2],
        rotation: Math.PI,
        scale: 1.3,
      },
      {
        productId: "template-chair-3",
        productName: "Office Chair",
        position: [0, 0, 0],
        rotation: 0,
        scale: 1,
      },
      {
        productId: "template-bookshelf-1",
        productName: "Bookshelf",
        position: [-4, 0, -2],
        rotation: Math.PI / 2,
        scale: 1.2,
      },
      {
        productId: "template-cabinet-1",
        productName: "Storage Cabinet",
        position: [4, 0, 2],
        rotation: -Math.PI / 2,
        scale: 1,
      },
    ],
  },
  {
    id: "bedroom-cozy",
    name: "Cozy Bedroom",
    description: "Comfortable bedroom setup",
    icon: <Bed className="h-5 w-5" />,
    roomSize: [14, 12],
    items: [
      {
        productId: "template-bed-1",
        productName: "Queen Bed",
        position: [0, 0, -2],
        rotation: 0,
        scale: 1.5,
      },
      {
        productId: "template-nightstand-1",
        productName: "Nightstand",
        position: [-2.5, 0, -2],
        rotation: 0,
        scale: 0.8,
      },
      {
        productId: "template-nightstand-2",
        productName: "Nightstand",
        position: [2.5, 0, -2],
        rotation: 0,
        scale: 0.8,
      },
      {
        productId: "template-wardrobe-1",
        productName: "Wardrobe",
        position: [-4, 0, 3],
        rotation: Math.PI / 2,
        scale: 1.3,
      },
      {
        productId: "template-dresser-1",
        productName: "Dresser",
        position: [3, 0, 3],
        rotation: -Math.PI / 2,
        scale: 1,
      },
    ],
  },
  {
    id: "dining-elegant",
    name: "Elegant Dining",
    description: "Formal dining room setup",
    icon: <Users className="h-5 w-5" />,
    roomSize: [14, 14],
    items: [
      {
        productId: "template-dining-table-1",
        productName: "Dining Table",
        position: [0, 0, 0],
        rotation: 0,
        scale: 1.5,
      },
      {
        productId: "template-dining-chair-1",
        productName: "Dining Chair",
        position: [0, 0, 2],
        rotation: Math.PI,
        scale: 1,
      },
      {
        productId: "template-dining-chair-2",
        productName: "Dining Chair",
        position: [0, 0, -2],
        rotation: 0,
        scale: 1,
      },
      {
        productId: "template-dining-chair-3",
        productName: "Dining Chair",
        position: [-2, 0, 0],
        rotation: Math.PI / 2,
        scale: 1,
      },
      {
        productId: "template-dining-chair-4",
        productName: "Dining Chair",
        position: [2, 0, 0],
        rotation: -Math.PI / 2,
        scale: 1,
      },
      {
        productId: "template-buffet-1",
        productName: "Buffet Cabinet",
        position: [0, 0, 5],
        rotation: Math.PI,
        scale: 1.4,
      },
    ],
  },
  {
    id: "studio-apartment",
    name: "Studio Apartment",
    description: "Efficient multi-purpose living space",
    icon: <Building2 className="h-5 w-5" />,
    roomSize: [16, 12],
    items: [
      {
        productId: "template-sofa-bed-1",
        productName: "Sofa Bed",
        position: [-3, 0, -3],
        rotation: Math.PI / 4,
        scale: 1.2,
      },
      {
        productId: "template-desk-2",
        productName: "Compact Desk",
        position: [4, 0, 2],
        rotation: -Math.PI / 2,
        scale: 1,
      },
      {
        productId: "template-dining-table-2",
        productName: "Small Dining Table",
        position: [-3, 0, 3],
        rotation: 0,
        scale: 1,
      },
      {
        productId: "template-storage-1",
        productName: "Storage Unit",
        position: [0, 0, -4],
        rotation: 0,
        scale: 1.2,
      },
    ],
  },
  {
    id: "coffee-lounge",
    name: "Coffee Lounge",
    description: "Relaxed cafe-style seating area",
    icon: <Coffee className="h-5 w-5" />,
    roomSize: [12, 12],
    items: [
      {
        productId: "template-armchair-1",
        productName: "Armchair",
        position: [-2, 0, 0],
        rotation: Math.PI / 6,
        scale: 1,
      },
      {
        productId: "template-armchair-2",
        productName: "Armchair",
        position: [2, 0, 0],
        rotation: -Math.PI / 6,
        scale: 1,
      },
      {
        productId: "template-side-table-1",
        productName: "Side Table",
        position: [0, 0, -1],
        rotation: 0,
        scale: 0.8,
      },
      {
        productId: "template-coffee-bar-1",
        productName: "Coffee Bar",
        position: [0, 0, 4],
        rotation: Math.PI,
        scale: 1.3,
      },
    ],
  },
];

export function RoomTemplates({ onSelectTemplate }: RoomTemplatesProps) {
  const handleSelectTemplate = (template: RoomTemplate) => {
    const itemsWithIds: PlacedItem[] = template.items.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
    }));
    onSelectTemplate(itemsWithIds);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Templates</CardTitle>
        <CardDescription>
          Start with a pre-designed room layout and customize it to your needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:border-primary transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{template.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {template.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {template.items.length} items
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleSelectTemplate(template)}
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}