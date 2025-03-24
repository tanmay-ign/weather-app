import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const Globe = () => {
  const globeRef = useRef();
  const cloudsRef = useRef();

  // Earth texture
  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load('/images/earth.jpg');
  const cloudsTexture = textureLoader.load('/images/clouds.png');
  const bumpMap = textureLoader.load('/images/earth_bump.jpg');

  // Animate the globe
  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <>
      {/* Earth */}
      <Sphere ref={globeRef} args={[1, 64, 64]}>
        <meshPhongMaterial 
          map={earthTexture} 
          bumpMap={bumpMap}
          bumpScale={0.05}
        />
      </Sphere>
      
      {/* Clouds layer */}
      <Sphere ref={cloudsRef} args={[1.01, 64, 64]}>
        <meshPhongMaterial 
          map={cloudsTexture} 
          transparent={true}
          opacity={0.4}
        />
      </Sphere>
    </>
  );
};

const GlobeAnimation = () => {
  return (
    <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <Globe />
      <OrbitControls 
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.5}
        enablePan={false}
      />
    </Canvas>
  );
};

export default GlobeAnimation; 