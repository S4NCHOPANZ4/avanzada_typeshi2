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

// Assets unificados
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

// Capa SVG
const SVGLayer = ({ src, config }) => {
  const [svgContent, setSvgContent] = useState(null);

  useEffect(() => {
    if (!src) return;

    fetch(src)
      .then((res) => res.text())
      .then((text) => setSvgContent(text));
  }, [src]);

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

// Canvas dinámico
const AvatarCanvas = ({ children, backgroundColor, size }) => (
  <svg
    viewBox="0 0 200 280"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor,
      borderRadius: "9999px",
      overflow: "hidden",
    }}
  >
    {children}
  </svg>
);

export default function CharacterDisplay({ avatar, size = 120 }) {
  if (!avatar) return <p>No hay avatar disponible</p>;

  // Si viene como string JSON → parsearlo
  let parsedAvatar = avatar;
  if (typeof avatar === "string") {
    try {
      parsedAvatar = JSON.parse(avatar);
    } catch (e) {
      return <p>Error: JSON inválido</p>;
    }
  }

  const layers = [
    { key: "body", src: assets.body, config: layerConfig.body },
    { key: "hair", src: assets.hair[parsedAvatar.hairStyle], config: layerConfig.hair },
    { key: "eyes", src: assets.eyes[parsedAvatar.eyeStyle], config: layerConfig.eyes },
    { key: "mouth", src: assets.mouth[parsedAvatar.mouthStyle], config: layerConfig.mouth },
  ];

  return (
    <div className="flex justify-center items-center">
      <AvatarCanvas backgroundColor={parsedAvatar.backgroundColor} size={size}>
        {layers
          .sort((a, b) => a.config.zIndex - b.config.zIndex)
          .map((layer) => (
            <SVGLayer key={layer.key} src={layer.src} config={layer.config} />
          ))}
      </AvatarCanvas>
    </div>
  );
}
