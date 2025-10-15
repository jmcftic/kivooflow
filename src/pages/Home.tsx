import React from "react";
import { Link } from "react-router-dom";
import BgFull from "../components/atoms/BgFull";
import Logo from "../components/atoms/Logo";

const Home: React.FC = () => {
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
        
        {/* Enlaces de navegación temporal */}
        <div className="flex flex-col space-y-4">
          <Link 
            to="/login" 
            className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            Ir a Login
          </Link>
          <Link 
            to="/home2" 
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors"
          >
            Ir a Home2 (PNG)
          </Link>
          <Link 
            to="/home3" 
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-400 transition-colors"
          >
            Ir a Home3 (SVG)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
