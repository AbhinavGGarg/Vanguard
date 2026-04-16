'use client';

import { useEffect, useState, type ComponentType } from 'react';

type ShaderGradientModule = {
  ShaderGradientCanvas: ComponentType<Record<string, unknown>>;
  ShaderGradient: ComponentType<Record<string, unknown>>;
};

export default function GradientBackground() {
  const [shaderModule, setShaderModule] = useState<ShaderGradientModule | null>(null);

  useEffect(() => {
    let isActive = true;

    import('@shadergradient/react').then((mod) => {
      if (!isActive) {
        return;
      }

      setShaderModule({
        ShaderGradientCanvas: mod.ShaderGradientCanvas as ComponentType<Record<string, unknown>>,
        ShaderGradient: mod.ShaderGradient as ComponentType<Record<string, unknown>>,
      });
    });

    return () => {
      isActive = false;
    };
  }, []);

  const ShaderGradientCanvas = shaderModule?.ShaderGradientCanvas;
  const ShaderGradient = shaderModule?.ShaderGradient;

  return (
    <div className="absolute inset-0 -z-10">
      {ShaderGradientCanvas && ShaderGradient ? (
        <ShaderGradientCanvas style={{ position: 'absolute', inset: 0 }} pixelDensity={1} fov={45}>
          <ShaderGradient
            animate="on"
            brightness={1.1}
            cDistance={3.2}
            cPolarAngle={90}
            cameraZoom={1}
            color1="#3B82F6"
            color2="#8B5CF6"
            color3="#020617"
            envPreset="city"
            grain="on"
            lightType="env"
            positionX={-1}
            positionY={0}
            positionZ={0}
            reflection={0.15}
            rotationY={8}
            rotationZ={40}
            type="plane"
            uAmplitude={0.8}
            uDensity={1.2}
            uFrequency={4.5}
            uSpeed={0.25}
            uStrength={3}
          />
        </ShaderGradientCanvas>
      ) : null}

      {/* overlay for readability */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
    </div>
  );
}
