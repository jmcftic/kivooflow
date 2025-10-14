import React from "react";
import BgFull from "../components/atoms/BgFull";
import Logo from "../components/atoms/Logo";
import LoginForm from "../components/organisms/LoginForm";
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

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Fondo */}
      <BgFull className="absolute inset-0 w-full h-full" />
      
      {/* Logo en la parte superior */}
      <div className="relative z-10 pt-8 flex justify-center">
        <Logo width={212} height={40} />
      </div>
      
      {/* Contenido principal centrado */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <LoginForm 
          onSubmit={handleEmailSubmit}
          onBiometricAuth={handleBiometricAuth}
        />
      </div>
    </div>
  );
};

export default Login;
