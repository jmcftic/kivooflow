import React from "react";
import VectorPattern from "../components/atoms/VectorPattern";
import Ki6SvgIcon from "../components/atoms/Ki6SvgIcon";
import Logo from "../components/atoms/Logo";
import LoginForm from "../components/organisms/LoginForm";
import KivoMainBg from "../components/atoms/KivoMainBg";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleEmailSubmit = (email: string) => {
    console.log("Email submitted:", email);
    // Aquí iría la lógica para enviar el email y continuar al siguiente paso
    // Por ahora, navegamos al home
    navigate("/");
  };

  const handleBiometricAuth = () => {
    console.log("Biometric authentication requested");
    // Aquí iría la lógica para autenticación biométrica
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative">
      {/* Nuevo fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />
      
      {/* Logo en la parte superior */}
      <div className="relative z-20 pt-8 flex justify-center">
        <Logo width={173} height={48} />
      </div>
      
      {/* Contenido principal centrado */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 -mt-8">
        <LoginForm 
          onSubmit={handleEmailSubmit}
          onBiometricAuth={handleBiometricAuth}
          onForgotPassword={handleForgotPassword}
        />
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

export default Login;
