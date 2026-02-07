"use client";

import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, useScroll, useTexture, useVideoTexture } from "@react-three/drei";
import { easing } from "maath";

function VideoCard({
  url,
  baseHeight = 2.8,
  fallbackAspect = 1.618,
  ...props
}) {
  const texture = useVideoTexture(url, {
    muted: true,
    loop: true,
    start: true,
    crossOrigin: "anonymous",
  });
  const videoWidth = texture?.image?.videoWidth || 0;
  const videoHeight = texture?.image?.videoHeight || 0;
  const aspect =
    videoWidth > 0 && videoHeight > 0
      ? videoWidth / videoHeight
      : fallbackAspect;
  const height = baseHeight;
  const width = baseHeight * aspect;

  return (
    <mesh {...props}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function ImageCard({
  url,
  baseHeight = 2.8,
  fallbackAspect = 1.618,
  ...props
}) {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  const imgWidth = texture?.image?.width || 0;
  const imgHeight = texture?.image?.height || 0;
  const aspect =
    imgWidth > 0 && imgHeight > 0 ? imgWidth / imgHeight : fallbackAspect;
  const height = baseHeight;
  const width = baseHeight * aspect;

  return (
    <mesh {...props}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Card({ item, active, hovered, baseHeight = 2.8, ...props }) {
  const groupRef = useRef(null);
  const lookAtTarget = useMemo(() => new THREE.Vector3(), []);
  const fallbackAspect =
    item?.width && item?.height ? item.width / item.height : 1.618;

  useFrame((state, delta) => {
    const target = hovered ? 1.2 : active ? 1.05 : 1;
    if (!groupRef.current) return;
    easing.damp3(groupRef.current.scale, [target, target, 1], 0.2, delta);
    // Keep the card facing forward (toward the camera) as the carousel rotates.
    lookAtTarget.set(
      state.camera.position.x,
      groupRef.current.position.y,
      state.camera.position.z
    );
    groupRef.current.lookAt(lookAtTarget);
  });

  return (
    <group ref={groupRef} {...props}>
      {item.type === "video" ? (
        <VideoCard
          url={item.src}
          baseHeight={baseHeight}
          fallbackAspect={fallbackAspect}
        />
      ) : (
        <ImageCard
          url={item.src}
          baseHeight={baseHeight}
          fallbackAspect={fallbackAspect}
        />
      )}
    </group>
  );
}

function Scene({ items, ...props }) {
  const ref = useRef(null);
  const scroll = useScroll();
  const [hovered, setHovered] = useState(null);

  const count = Math.max(items.length, 1);
  const step = (Math.PI * 2) / count;
  const baseHeight = 2.8;
  const maxAspect = items.reduce((acc, item) => {
    if (item?.width && item?.height) {
      return Math.max(acc, item.width / item.height);
    }
    return acc;
  }, 1.618);
  const cardWidth = baseHeight * maxAspect;
  const gap = 1.0;
  const circumference = count * (cardWidth + gap);
  const finalRadius = Math.max(14, circumference / (2 * Math.PI));
  const targetCameraZ = finalRadius + 12;

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y = -scroll.offset * Math.PI * 2;
    state.events.update();

    // Smoothly damp to target
    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 2, state.pointer.y * 2, targetCameraZ],
      0.35,
      delta
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={ref} {...props}>
      {items.map((item, index) => {
        const angle = index * step;
        return (
          <Card
            key={item.id || index}
            item={item}
            position={[
              Math.sin(angle) * finalRadius,
              0,
              Math.cos(angle) * finalRadius,
            ]}
            baseHeight={baseHeight}
            active={hovered !== null}
            hovered={hovered === index}
            onPointerOver={(event) => {
              event.stopPropagation();
              setHovered(index);
            }}
            onPointerOut={() => setHovered(null)}
          />
        );
      })}
    </group>
  );
}

export default function CircularCarousel({ items = [] }) {
  const cleanItems = useMemo(() => items.filter((item) => item?.src), [items]);
  const displayItems = useMemo(() => cleanItems.slice(0, 12), [cleanItems]);

  if (!displayItems.length) {
    return null;
  }

  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 35], fov: 50 }}>
      <color attach="background" args={["#ffffff"]} />
      <ambientLight intensity={0.9} />
      <ScrollControls pages={3} infinite>
        <Scene position={[0, 0, 0]} items={displayItems} />
      </ScrollControls>
    </Canvas>
  );
}
