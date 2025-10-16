import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VectorPattern from "../components/atoms/VectorPattern";
import Ki6SvgIcon from "../components/atoms/Ki6SvgIcon";
import Logo from "../components/atoms/Logo";
import Button from "../components/atoms/Button";

interface LocationState {
  email?: string;
}

const VerificationSent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const initialEmail = useMemo(() => state.email || "", [state.email]);

  const handleContinue = () => {
    navigate('/verification-code', { state: { email: initialEmail } });
  };

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative">
      <div className="relative z-20 pt-8 flex justify-center">
        <Logo width={212} height={40} />
      </div>

      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 -mt-8">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#FFF100] text-center mb-3 uppercase tracking-wide">
            ¡LISTO!, REVISA TU CORREO
          </h1>
          <p className="text-center text-gray-300 mb-8">
            Te enviamos un código de verificación a tu correo electrónico. Si no lo ves, revisa también la carpeta de spam.
          </p>

          <Button
            type="button"
            variant="yellow"
            size="lg"
            className="w-full rounded-xl font-semibold text-lg py-4"
            onClick={handleContinue}
          >
            Continuar
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

export default VerificationSent;


