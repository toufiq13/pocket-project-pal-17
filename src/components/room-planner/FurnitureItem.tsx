import { useRef, useState } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { PlacedItem } from "@/pages/RoomPlanner";
import * as THREE from "three";

interface FurnitureItemProps {
  item: PlacedItem;
  onUpdate: (updates: Partial<PlacedItem>) => void;
  onDelete: () => void;
}

export function FurnitureItem({ item, onUpdate, onDelete }: FurnitureItemProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging && e.point) {
      onUpdate({
        position: [e.point.x, item.position[1], e.point.z],
      });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const getFurnitureGeometry = () => {
    const name = item.productName.toLowerCase();
    
    if (name.includes("sofa") || name.includes("couch")) {
      return <boxGeometry args={[2, 0.8, 1]} />;
    } else if (name.includes("chair")) {
      return <boxGeometry args={[0.6, 1, 0.6]} />;
    } else if (name.includes("table")) {
      return <boxGeometry args={[1.5, 0.1, 1]} />;
    } else if (name.includes("bed")) {
      return <boxGeometry args={[2, 0.5, 1.8]} />;
    } else if (name.includes("cabinet") || name.includes("wardrobe")) {
      return <boxGeometry args={[1.2, 2, 0.5]} />;
    } else {
      return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={item.position}
      rotation={[0, item.rotation, 0]}
      scale={item.scale}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      castShadow
      receiveShadow
    >
      {getFurnitureGeometry()}
      <meshStandardMaterial
        color={isHovered ? "#fbbf24" : "#8b5cf6"}
        metalness={0.3}
        roughness={0.7}
      />
      {isHovered && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1.1, 1.1, 1.1)]} />
          <lineBasicMaterial color="#f59e0b" linewidth={2} />
        </lineSegments>
      )}
    </mesh>
  );
}
