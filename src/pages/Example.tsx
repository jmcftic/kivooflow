import React from "react";
import BgFull from "../components/atoms/BgFull";
import Logo from "../components/atoms/Logo";

const Example: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <BgFull className="absolute inset-0 w-full h-full" />
      
      {/* Logo en la parte superior */}
      <div className="relative z-10 pt-8 flex justify-center">
        <Logo width={212} height={40} />
      </div>
      
      {/* Contenido principal centrado */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 text-center">
          KIVOO
        </h1>
      </div>
    </div>
  );
};

export default Example;
