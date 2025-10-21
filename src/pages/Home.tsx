import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import VectorPattern from '../components/atoms/VectorPattern';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import Logo from '../components/atoms/Logo';
import Button from '../components/atoms/Button';
import LoginForm from '../components/organisms/LoginForm';
import KivoMainBg from '../components/atoms/KivoMainBg';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const handleLoginSubmit = (email: string, password?: string) => {
    if (password) {
      console.log("Login completed:", { email, password });
      // Aquí iría la lógica para autenticar al usuario
    } else {
      console.log("Email submitted:", email);
      // El formulario maneja internamente el paso a contraseña
    }
  };

  const handleBiometricAuth = () => {
    console.log("Biometric authentication requested");
    // Aquí iría la lógica para autenticación biométrica
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative">
      {/* Nuevo fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />
      
      {/* Header con logo y botón de iniciar sesión */}
      <div className="relative z-20 pt-8 px-8 flex justify-between items-center">
        <div className="flex-1"></div> {/* Espaciador izquierdo */}
        <Logo width={212} height={29} />
        <div className="flex-1 flex justify-end"> {/* Espaciador derecho */}
          {/* Botón oculto para todos los dispositivos */}
          <Link to="/login" className="hidden">
            <Button
              variant="yellow"
              size="md"
              className="rounded-xl font-semibold w-[226px] h-[35px] text-lg"
            >
              Iniciar sesión
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Contenido principal centrado */}
      <div className="flex flex-col items-center justify-center h-full relative z-20 -mt-8">
        {/* Formulario de login - Visible en todos los dispositivos */}
        <div className="px-4 w-full max-w-md">
          <LoginForm 
            onSubmit={handleLoginSubmit}
            onBiometricAuth={handleBiometricAuth}
            onForgotPassword={handleForgotPassword}
          />
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

export default Home;