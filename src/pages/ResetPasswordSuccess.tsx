import React from "react";
import { useNavigate } from "react-router-dom";
import VectorPattern from "../components/atoms/VectorPattern";
import Ki6SvgIcon from "../components/atoms/Ki6SvgIcon";
import Logo from "../components/atoms/Logo";
import Button from "../components/atoms/Button";
import KivoMainBg from "../components/atoms/KivoMainBg";

const ResetPasswordSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative">
      {/* Nuevo fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />
      
      <div className="relative z-20 pt-8 flex justify-center">
        <Logo width={173} height={48} />
      </div>

      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 -mt-8">
        <div className="w-full max-w-md mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[#FFF100] mb-4 uppercase tracking-wide">
            ¡Contraseña actualizada!
          </h1>
          <p className="text-gray-300 mb-8">
            Tu contraseña fue actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
          </p>
          <Button
            type="button"
            variant="yellow"
            size="lg"
            className="w-full rounded-xl font-semibold text-lg py-4"
            onClick={() => navigate('/')}
          >
            Volver al inicio
          </Button>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 pointer-events-none overflow-hidden z-0">
        <Ki6SvgIcon 
          width={2850.92} 
          height={940.08} 
          rotation={0}
          className="w-[80vw] h-auto border-0 outline-none" 
        />
      </div>

      <VectorPattern className="z-10" />
    </div>
  );
};

export default ResetPasswordSuccess;


