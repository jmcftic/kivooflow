import React from 'react';
import VectorPattern from '../components/atoms/VectorPattern';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import KivoMainBg from '../components/atoms/KivoMainBg';

const Home3: React.FC = () => {
  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative">
      {/* Nuevo fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />
      
      {/* Contenedor principal centrado */}
      <div className="flex flex-col items-center justify-center h-full relative z-20">
        {/* Texto de ejemplo */}
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">
            Home3 - Patrón de Vectores
          </h1>
          <p className="text-gray-300 text-lg">
            Esta página usa un patrón de vectores SVG repetidos
          </p>
        </div>
      </div>
      {/* SVG de esquina en inferior derecha (debajo del patrón) */}
      <div className="absolute bottom-0 right-0 pointer-events-none overflow-hidden z-0">
        <Ki6SvgIcon 
          width={2850.92} 
          height={940.08} 
          rotation={0}
          className="w-[80vw] h-auto border-0 outline-none" 
        />
      </div>

      {/* Patrón de vectores SVG (encima de la esquina) */}
      <VectorPattern className="z-10" />
    </div>
  );
};

export default Home3;
