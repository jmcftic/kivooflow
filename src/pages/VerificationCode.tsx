import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VectorPattern from "../components/atoms/VectorPattern";
import Ki6SvgIcon from "../components/atoms/Ki6SvgIcon";
import Logo from "../components/atoms/Logo";
import Button from "../components/atoms/Button";
import KivoMainBg from "../components/atoms/KivoMainBg";
import { useForgotPassword } from "../hooks/useForgotPassword";
import { authService } from "../services/auth";
import Spinner from "../components/atoms/Spinner";
import { Alert, AlertDescription, AlertTitle } from "../components/atoms/Alert";

interface LocationState {
  email?: string;
}

const VerificationCode: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const initialEmail = useMemo(() => state.email || "", [state.email]);

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const resendMutation = useForgotPassword();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    setCode(onlyDigits.slice(0, 6));
    if (error) setError("");
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Ingresa el código de 6 dígitos");
      return;
    }
    try {
      setVerifying(true);
      const result = await authService.verifyResetCode({ email: initialEmail, code });
      navigate('/reset-password', { state: { tempToken: result.tempToken, email: initialEmail } });
    } catch (err: any) {
      setError(err?.message || "Código inválido");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!initialEmail) return;
    try {
      await resendMutation.mutateAsync({ email: initialEmail });
    } catch (e) {
      // Silenciar error en UI por ahora; la pantalla no debe mostrar texto rojo
      console.error(e);
    }
  };

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative">
      {/* Nuevo fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />
      
      <div className="relative z-20 pt-8 flex justify-center">
        <Logo width={173} height={48} />
      </div>

      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 -mt-8">
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-[#FFF100] text-center mb-3 uppercase tracking-wide">
            CÓDIGO DE VERIFICACIÓN
          </h2>
          <p className="text-center text-gray-300 mb-6">
            Escríbelo aquí y crear una nueva contraseña. Si no lo ves, revisa también la carpeta de spam.
          </p>

          {error ? (
            <div className="mb-4">
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : null}

          <form onSubmit={handleContinue} className="space-y-6">
            <div className="flex justify-center">
              <input
                value={code}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="------"
                className="text-center tracking-[0.6em] text-lg md:text-2xl px-4 py-3 rounded-xl bg-[#1f1f1f] text-white border border-gray-600 w-64"
              />
            </div>
            {error ? (
              <div className="text-center text-red-400 text-sm">{error}</div>
            ) : null}
            <Button
              type="submit"
              variant="yellow"
              size="lg"
              className="w-full rounded-xl font-semibold text-lg py-4"
              disabled={verifying}
            >
              {verifying ? (
                <div className="flex items-center justify-center space-x-2">
                  <Spinner size="sm" className="text-black" />
                  <span>Verificando...</span>
                </div>
              ) : (
                "Continuar"
              )}
            </Button>
          </form>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleResend}
              className="text-[#FFF100] text-sm hover:text-[#E6D900] transition-colors"
              disabled={resendMutation.isPending || !initialEmail}
            >
              {resendMutation.isPending ? "Reenviando..." : "Reenviar código"}
            </button>
          </div>
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

export default VerificationCode;


