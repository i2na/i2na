import React, { useState, useEffect, memo, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Text, Plane } from "@react-three/drei";

function R3Fpc() {
  const [dynamicText, setDynamicText] = useState("");
  const phrases = useMemo(
    () => ["Yena", "Front-End", "Developer", "Hard Coder"],
    []
  );
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const updateText = () => {
      if (!isDeleting) {
        setDynamicText(currentPhrase.substring(0, dynamicText.length + 1));
      } else {
        setDynamicText(currentPhrase.substring(0, dynamicText.length - 1));
      }
    };

    let timeoutId;
    if (!isDeleting && dynamicText === currentPhrase) {
      timeoutId = setTimeout(() => {
        setIsDeleting(true);
      }, 1000);
    } else if (isDeleting && dynamicText === "") {
      setIsDeleting(false);
      setPhraseIndex((phraseIndex + 1) % phrases.length);
    } else {
      timeoutId = setTimeout(updateText, isDeleting ? 100 : 100);
    }

    return () => clearTimeout(timeoutId);
  }, [dynamicText, isDeleting, phraseIndex, phrases]);

  return (
    <Canvas
      shadows
      shadowMap
      camera={{
        fov: 50,
        aspect: window.innerWidth / window.innerHeight,
        near: 0.1,
        far: 1000,
        position: [0, 0, 1.5],
      }}
    >
      <ambientLight intensity={0} />
      <spotLight
        color="#ffc900"
        position={[0.2, -0.05, 0.8]}
        angle={0.5}
        penumbra={1}
        intensity={50}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <spotLight
        color="blue"
        position={[-0.2, 0.05, 0.8]}
        angle={0.5}
        penumbra={1}
        intensity={50}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <Text
        color="black"
        fontSize={0.2}
        textAlign={"center"}
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
        position={[0, 0.3, 0]}
      >
        Hi, there! I&apos;m
      </Text>
      <Text
        color="#E63946"
        fontSize={0.3}
        textAlign={"center"}
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
        position={[0, -0.1, 0]}
        castShadow
      >
        {dynamicText}
      </Text>
      <Plane
        receiveShadow
        rotation={[0, 0, 0]}
        position={[0, -0.5, -1]}
        args={[7, 7]}
      >
        <meshStandardMaterial attach="material" color="white" />
      </Plane>
    </Canvas>
  );
}

export default memo(R3Fpc);
