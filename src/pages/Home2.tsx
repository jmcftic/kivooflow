import React from 'react';
import Ki6Icon from '../components/atoms/Ki6Icon';

const Home2: React.FC = () => {
  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative">
      {/* Contenedor principal centrado */}
      <div className="flex flex-col items-center justify-center h-full">
        {/* Texto de ejemplo */}
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">
            Home2 - Recreación con Vectores
          </h1>
          <p className="text-gray-300 text-lg">
            Esta página usa el componente Ki6Icon como átomo
          </p>
        </div>
      </div>
      
      {/* Ondas amarillas decorativas en esquina inferior derecha */}
      <div className="absolute bottom-0 right-0 pointer-events-none overflow-hidden">
        <Ki6Icon 
          width={2850.92} 
          height={940.08} 
          rotation={0}
          className="w-[80vw] h-auto border-0 outline-none" 
        />
      </div>
    </div>
  );
};

export default Home2;
