import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Sky } from "@react-three/drei";
import { PlacedItem } from "@/pages/RoomPlanner";
import { FurnitureItem } from "./FurnitureItem";

interface Canvas3DRoomProps {
  placedItems: PlacedItem[];
  onUpdateItem: (id: string, updates: Partial<PlacedItem>) => void;
  onDeleteItem: (id: string) => void;
}

export function Canvas3DRoom({
  placedItems,
  onUpdateItem,
  onDeleteItem,
}: Canvas3DRoomProps) {
  return (
    <Canvas
      camera={{ position: [10, 10, 10], fov: 50 }}
      shadows
      style={{ background: "#f0f0f0" }}
    >
      <Sky sunPosition={[100, 20, 100]} />
      
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#374151"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {placedItems.map((item) => (
        <FurnitureItem
          key={item.id}
          item={item}
          onUpdate={(updates) => onUpdateItem(item.id, updates)}
          onDelete={() => onDeleteItem(item.id)}
        />
      ))}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}
