import React, { useState, useEffect } from 'react';
import { Palette, Shirt, Smile, Eye } from 'lucide-react';
import body from '../assets/character/body.svg';
import eyes1 from '../assets/character/eye/eyes1.svg';
import eyes2 from '../assets/character/eye/eyes2.svg';
import eyes3 from '../assets/character/eye/eyes3.svg';
import eyes4 from '../assets/character/eye/eyes4.svg';
import hair1 from '../assets/character/hair/hair1.svg';
import hair2 from '../assets/character/hair/hair2.svg';
import hair3 from '../assets/character/hair/hair3.svg';
import hair4 from '../assets/character/hair/hair4.svg';
import mouth1 from '../assets/character/mouth/mouth1.svg';
import mouth2 from '../assets/character/mouth/mouth2.svg';
import mouth3 from '../assets/character/mouth/mouth3.svg';
import mouth4 from '../assets/character/mouth/mouth4.svg';

// Mapeo de assets importados
const assets = {
  body: body,
  eyes: {
    eyes1: eyes1,
    eyes2: eyes2,
    eyes3: eyes3,
    eyes4: eyes4
  },
  hair: {
    hair1: hair1,
    hair2: hair2,
    hair3: hair3,
    hair4: hair4
  },
  mouth: {
    mouth1: mouth1,
    mouth2: mouth2,
    mouth3: mouth3,
    mouth4: mouth4
  }
};

// Sistema de capas con posición y escala
const layerConfig = {
  body: {
    zIndex: 0,
    x: 40,
    y: 80,
    scale: .4
  },
  hair: {
    zIndex: 1,
    x: 33,
    y: 50,
    scale: .35
  },
  eyes: {
    zIndex: 2,
    x: 80,
    y: 150,
    scale: .4
  },
  mouth: {
    zIndex: 3,
    x: 80,
    y: 170,
    scale: .4
  }
};

// Componente para cargar y renderizar SVG
const SVGLayer = ({ src, config, color }) => {
  const [svgContent, setSvgContent] = useState(null);

  useEffect(() => {
    if (!src) return;

    fetch(src)
      .then(res => res.text())
      .then(text => {
        // Si hay color, reemplazar currentColor o el fill principal
        let content = text;
        if (color) {
          content = content.replace(/fill="[^"]*"/g, `fill="${color}"`);
          content = content.replace(/currentColor/g, color);
        }
        setSvgContent(content);
      })
      .catch(err => console.error('Error loading SVG:', err));
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

// Canvas base del avatar
const AvatarCanvas = ({ children }) => (
  <svg 
    viewBox="0 0 200 280" 
    className="w-full h-full"
    style={{ maxWidth: '300px', maxHeight: '420px' }}
  >
    {children}
  </svg>
);

export default function AvatarCustomizer() {
  const [avatar, setAvatar] = useState({
    bodyColor: '#ffd7ba',
    hairStyle: 'hair1',
    hairColor: '#2c1b18',
    eyeStyle: 'eyes1',
    mouthStyle: 'mouth1'
  });

  const [activeTab, setActiveTab] = useState('body');

  const updateAvatar = (key, value) => {
    setAvatar(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'body', label: 'Cuerpo', icon: Smile },
    { id: 'hair', label: 'Cabello', icon: Palette },
    { id: 'face', label: 'Cara', icon: Eye }
  ];

  // Renderizar capas en orden de z-index
  const renderLayers = () => {
    const layers = [
      {
        key: 'body',
        src: assets.body,
        config: layerConfig.body,
        color: avatar.bodyColor
      },
      {
        key: 'hair',
        src: assets.hair[avatar.hairStyle],
        config: layerConfig.hair,
        color: avatar.hairColor
      },
      {
        key: 'eyes',
        src: assets.eyes[avatar.eyeStyle],
        config: layerConfig.eyes,
        color: null
      },
      {
        key: 'mouth',
        src: assets.mouth[avatar.mouthStyle],
        config: layerConfig.mouth,
        color: null
      }
    ];

    return layers
      .sort((a, b) => a.config.zIndex - b.config.zIndex)
      .map(layer => (
        <SVGLayer
          key={layer.key}
          src={layer.src}
          config={layer.config}
          color={layer.color}
        />
      ));
  };

  const colorOptions = {
    body: ['#ffd7ba', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#654321'],
    hair: ['#2c1b18', '#71635a', '#b89778', '#f2e8c9', '#ff6b6b', '#4ecdc4', '#9b59b6']
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">
            Creador de Avatar
          </h1>
          <p className="text-gray-600">Personaliza tu personaje</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Vista previa del avatar */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="bg-gradient-to-b from-purple-100 to-blue-100 rounded-xl p-8 flex items-center justify-center">
              <AvatarCanvas>
                {renderLayers()}
              </AvatarCanvas>
            </div>

            {/* Info para ajustar SVGs */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
              <h3 className="font-bold text-blue-900 mb-2">💡 Ajustes rápidos:</h3>
              <p className="text-blue-800 text-xs mb-2">
                Si tus SVGs no se ven en la posición correcta, ajusta los valores en <code className="bg-blue-100 px-1 rounded">layerConfig</code>:
              </p>
              <ul className="text-blue-800 space-y-1 text-xs">
                <li>• <strong>x, y</strong>: Posición (100 = centro horizontal)</li>
                <li>• <strong>scale</strong>: Tamaño (1 = normal, 0.5 = mitad)</li>
                <li>• <strong>zIndex</strong>: Orden de capas (menor = atrás)</li>
              </ul>
            </div>
          </div>

          {/* Panel de personalización */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
              {/* Cuerpo */}
              {activeTab === 'body' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color de cuerpo
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.body.map(color => (
                      <button
                        key={color}
                        onClick={() => updateAvatar('bodyColor', color)}
                        className={`w-12 h-12 rounded-full border-4 transition-all ${
                          avatar.bodyColor === color
                            ? 'border-purple-600 scale-110'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Cabello */}
              {activeTab === 'hair' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Estilo de cabello
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(assets.hair).map(style => (
                        <button
                          key={style}
                          onClick={() => updateAvatar('hairStyle', style)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            avatar.hairStyle === style
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <img 
                            src={assets.hair[style]} 
                            alt={style}
                            className="w-full h-16 object-contain"
                          />
                          <p className="text-xs text-center mt-2 font-medium capitalize">
                            {style}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Color de cabello
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {colorOptions.hair.map(color => (
                        <button
                          key={color}
                          onClick={() => updateAvatar('hairColor', color)}
                          className={`w-12 h-12 rounded-full border-4 transition-all ${
                            avatar.hairColor === color
                              ? 'border-purple-600 scale-110'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Cara */}
              {activeTab === 'face' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Ojos
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(assets.eyes).map(style => (
                        <button
                          key={style}
                          onClick={() => updateAvatar('eyeStyle', style)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            avatar.eyeStyle === style
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <img 
                            src={assets.eyes[style]} 
                            alt={style}
                            className="w-full h-12 object-contain"
                          />
                          <p className="text-xs text-center mt-2 font-medium capitalize">
                            {style}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Boca
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(assets.mouth).map(style => (
                        <button
                          key={style}
                          onClick={() => updateAvatar('mouthStyle', style)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            avatar.mouthStyle === style
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <img 
                            src={assets.mouth[style]} 
                            alt={style}
                            className="w-full h-10 object-contain"
                          />
                          <p className="text-xs text-center mt-2 font-medium capitalize">
                            {style}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
              Guardar Avatar
            </button>
          </div>
        </div>

        {/* Guía de ajuste de posiciones */}
        <div className="mt-8 bg-gray-900 text-gray-100 p-6 rounded-xl">
          <h3 className="text-lg font-bold mb-3 text-purple-400">🔧 Cómo ajustar posiciones:</h3>
          <p className="text-sm mb-3">Si tus SVGs no se ven bien, modifica el objeto <code className="bg-gray-800 px-2 py-1 rounded">layerConfig</code>:</p>
          <pre className="text-xs overflow-x-auto bg-gray-800 p-4 rounded">
{`const layerConfig = {
  body: {
    zIndex: 0,      // Orden (0 = atrás)
    x: 100,         // Posición horizontal (100 = centro)
    y: 140,         // Posición vertical (ajusta según tu SVG)
    scale: 1        // Escala (1 = tamaño original, 0.8 = 80%)
  },
  hair: {
    zIndex: 1,
    x: 100,
    y: 50,         // Ajusta más arriba/abajo según necesites
    scale: 1.2     // Ejemplo: hacer el cabello 20% más grande
  },
  // ... resto de capas
};`}
          </pre>
          <p className="text-xs mt-3 text-gray-400">
            💡 <strong>Tip:</strong> Inspecciona tus SVGs para ver su viewBox y ajusta las posiciones en consecuencia. 
            Si un SVG es más grande de lo esperado, reduce el <code className="bg-gray-800 px-1 rounded">scale</code>.
          </p>
        </div>
      </div>
    </div>
  );
}