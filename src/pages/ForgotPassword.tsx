import React from "react";
import { useNavigate } from "react-router-dom";
import VectorPattern from "../components/atoms/VectorPattern";
import Ki6SvgIcon from "../components/atoms/Ki6SvgIcon";
import Logo from "../components/atoms/Logo";
import ForgotPasswordForm from "../components/organisms/ForgotPasswordForm";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative">
      {/* Logo en la parte superior */}
      <div className="relative z-20 pt-8 flex justify-center">
        <Logo width={212} height={40} />
      </div>

      {/* Contenido principal centrado */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 -mt-8">
        <ForgotPasswordForm onBack={handleBackToLogin} />
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

export default ForgotPassword;


