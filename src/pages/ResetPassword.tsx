import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VectorPattern from "../components/atoms/VectorPattern";
import Ki6SvgIcon from "../components/atoms/Ki6SvgIcon";
import Logo from "../components/atoms/Logo";
import Button from "../components/atoms/Button";
import PasswordInput from "../components/atoms/PasswordInput";
import Spinner from "../components/atoms/Spinner";
import KivoMainBg from "../components/atoms/KivoMainBg";
import { authService } from "../services/auth";
import { Alert, AlertDescription, AlertTitle } from "../components/atoms/Alert";

interface LocationState {
  tempToken?: string;
  email?: string;
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const tempToken = useMemo(() => state.tempToken || "", [state.tempToken]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Completa ambos campos");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!tempToken) {
      setError("Token temporal inválido");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authService.resetPassword({ token: tempToken, newPassword: password });
      navigate('/reset-password/success', { state: { email: state.email } });
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative">
      {/* Nuevo fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />
      
      <div className="relative z-20 pt-8 flex justify-center">
        <Logo width={212} height={40} />
      </div>

      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 -mt-8">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#FFF100] text-center mb-3 uppercase tracking-wide">
            CREAR NUEVA CONTRASEÑA
          </h1>
          <p className="text-center text-gray-300 mb-8">
            Ingresa una nueva contraseña para tu cuenta. Asegúrate de que sea segura y fácil de recordar.
          </p>

          {error ? (
            <div className="mb-4">
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <PasswordInput
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
              error={""}
              placeholder="Nueva Contraseña"
            />
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(""); }}
              error={""}
              placeholder="Confirmar Contraseña"
            />

            {error ? (
              <div className="text-center text-red-400 text-sm">{error}</div>
            ) : null}

            <Button
              type="submit"
              variant="yellow"
              size="lg"
              className="w-full rounded-xl font-semibold text-lg py-4"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Spinner size="sm" className="text-black" />
                  <span>Guardando...</span>
                </div>
              ) : (
                "Guardar y continuar"
              )}
            </Button>
          </form>
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

export default ResetPassword;


