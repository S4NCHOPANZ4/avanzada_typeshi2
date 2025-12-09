import React, { useState, useEffect } from "react";
import body from "../../assets/character/body.svg";
import eyes1 from "../../assets/character/eye/eyes1.svg";
import eyes2 from "../../assets/character/eye/eyes2.svg";
import eyes3 from "../../assets/character/eye/eyes3.svg";
import eyes4 from "../../assets/character/eye/eyes4.svg";
import hair1 from "../../assets/character/hair/hair1.svg";
import hair2 from "../../assets/character/hair/hair2.svg";
import hair3 from "../../assets/character/hair/hair3.svg";
import hair4 from "../../assets/character/hair/hair4.svg";
import mouth1 from "../../assets/character/mouth/mouth1.svg";
import mouth2 from "../../assets/character/mouth/mouth2.svg";
import mouth3 from "../../assets/character/mouth/mouth3.svg";
import mouth4 from "../../assets/character/mouth/mouth4.svg";

// Assets
const assets = {
  body,
  eyes: { eyes1, eyes2, eyes3, eyes4 },
  hair: { hair1, hair2, hair3, hair4 },
  mouth: { mouth1, mouth2, mouth3, mouth4 },
};

// Configuración de capas
const layerConfig = {
  body: { zIndex: 0, x: 40, y: 65, scale: 0.5 },
  hair: { zIndex: 1, x: 28, y: 25, scale: 0.45 },
  eyes: { zIndex: 2, x: 100, y: 145, scale: 0.5 },
  mouth: { zIndex: 3, x: 95, y: 170, scale: 0.45 },
};

// Componente para renderizar SVG
const SVGLayer = ({ src, config, color }) => {
  const [svgContent, setSvgContent] = useState(null);

  useEffect(() => {
    if (!src) return;

    fetch(src)
      .then((res) => res.text())
      .then((text) => {
        let content = text;
        if (color) {
          content = content.replace(/fill="[^"]*"/g, `fill="${color}"`);
          content = content.replace(/currentColor/g, color);
        }
        setSvgContent(content);
      });
  }, [src, color]);

  if (!svgContent) return null;

  return (
    <g transform={`translate(${config.x}, ${config.y}) scale(${config.scale})`}>
      <g
        transform="translate(-50, -50)"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </g>
  );
};

// Canvas
const AvatarCanvas = ({ children, backgroundColor }) => (
  <svg
    viewBox="0 0 200 280"
    className="w-[400px] h-[400px] rounded-full"
    style={{ backgroundColor }}
  >
    {children}
  </svg>
);

export default function CharacterCreator({ onComplete, initialAvatar }) {
  const [avatar, setAvatar] = useState(initialAvatar || {
    bodyColor: "#ffd7ba",
    hairStyle: "hair1",
    hairColor: "#2c1b18",
    eyeStyle: "eyes1",
    mouthStyle: "mouth1",
    backgroundColor: "#4ade80",
  });

  const updateAvatar = (key, value) => {
    const newAvatar = { ...avatar, [key]: value };
    setAvatar(newAvatar);
  };

  const handleContinue = () => {
    // Llama a onComplete con el avatar final
    if (onComplete) {
      onComplete(avatar);
    }
  };

  // Mostramos JSON (solo para debug)
  useEffect(() => {
    console.log("Avatar JSON:", JSON.stringify(avatar, null, 2));
  }, [avatar]);

  const renderLayers = () => {
    const layers = [
      {
        key: "body",
        src: assets.body,
        config: layerConfig.body,
        color: avatar.bodyColor,
      },
      {
        key: "hair",
        src: assets.hair[avatar.hairStyle],
        config: layerConfig.hair,
        color: avatar.hairColor,
      },
      {
        key: "eyes",
        src: assets.eyes[avatar.eyeStyle],
        config: layerConfig.eyes,
        color: null,
      },
      {
        key: "mouth",
        src: assets.mouth[avatar.mouthStyle],
        config: layerConfig.mouth,
        color: null,
      },
    ];

    return layers
      .sort((a, b) => a.config.zIndex - b.config.zIndex)
      .map((layer) => (
        <SVGLayer
          key={layer.key}
          src={layer.src}
          config={layer.config}
          color={layer.color}
        />
      ));
  };

  const colorOptions = {
    body: ["#ffd7ba", "#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#654321"],
    hair: [
      "#2c1b18",
      "#71635a",
      "#b89778",
      "#f2e8c9",
      "#ff6b6b",
      "#4ecdc4",
      "#9b59b6",
    ],
    background: [
      "#4ade80",
      "#60a5fa",
      "#f472b6",
      "#fbbf24",
      "#a78bfa",
      "#fb923c",
      "#22d3ee",
    ],
  };

  return (
    <div className="w-full h-full flex flex-col ">
      <div className="mt-4 mx-10 flex justify-between items-center">
        <p className="font-bold text-2xl text-red-400">CREA TU UDI</p>
        <button
          className={`cursor-pointer w-[130px] bg-red-400 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-full transition-all ease-in-out`}
          onClick={handleContinue}
        >
          Continuar
        </button>
      </div>
      <div className="flex-1 w-full flex flex-center justify-center bg-black-200">
        <div className="justify-center flex flex-1 rounded-full">
          <div className="flex items-center justify-center">
            <AvatarCanvas backgroundColor={avatar.backgroundColor}>
              {renderLayers()}
            </AvatarCanvas>
          </div>
        </div>

        {/* Panel de personalización */}
        <div className="flex items-center mx-10">
          <div className="space-y-6 max-h-180 overflow-y-auto py-3 pr-4 w-full">

            {/* Ojos */}
            <div>
              <label className="block text-sm font-medium mb-3">Ojos</label>
              <div className="space-x-3">
                {Object.keys(assets.eyes).map((style) => (
                  <button
                    key={style}
                    onClick={() => updateAvatar("eyeStyle", style)}
                    className={`rounded-full border-2 p-3 ${
                      avatar.eyeStyle === style
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <img
                      src={assets.eyes[style]}
                      className="w-[70px] h-[70px]"
                      alt={`Ojos ${style}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Boca */}
            <div>
              <label className="block text-sm font-medium mb-3">Boca</label>
              <div className="space-x-3">
                {Object.keys(assets.mouth).map((style) => (
                  <button
                    key={style}
                    onClick={() => updateAvatar("mouthStyle", style)}
                    className={`rounded-full border-2 p-3 ${
                      avatar.mouthStyle === style
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <img
                      src={assets.mouth[style]}
                      className="w-[70px] h-[70px]"
                      alt={`Boca ${style}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Cabello */}
            <div>
              <label className="block text-sm font-medium mb-3">Cabello</label>
              <div className="space-x-3">
                {Object.keys(assets.hair).map((style) => (
                  <button
                    key={style}
                    onClick={() => updateAvatar("hairStyle", style)}
                    className={`rounded-full border-2 p-3 ${
                      avatar.hairStyle === style
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <img
                      src={assets.hair[style]}
                      className="w-[70px] h-[70px]"
                      alt={`Cabello ${style}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Color de Cabello */}


            {/* Color de Fondo */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Color de Fondo
              </label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.background.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateAvatar("backgroundColor", color)}
                    className={`w-12 h-12 rounded-full border-4 ${
                      avatar.backgroundColor === color
                        ? "border-purple-600 scale-110"
                        : "border-gray-200"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}