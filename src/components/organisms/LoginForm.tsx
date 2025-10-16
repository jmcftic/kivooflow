import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../atoms/Button";
import EmailInput from "../molecules/EmailInput";
import PasswordInput from "../atoms/PasswordInput";
import BiometricOption from "../molecules/BiometricOption";
import ErrorModal from "../atoms/ErrorModal";
import { useLogin } from "../../hooks/useLogin";

export interface LoginFormProps {
  onSubmit?: (email: string, password?: string) => void;
  onBiometricAuth?: () => void;
  onForgotPassword?: () => void;
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onBiometricAuth,
  onForgotPassword,
  className = ""
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const loginMutation = useLogin();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("El correo electrónico es requerido");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }
    
    setError("");
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError("La contraseña es requerida");
      return;
    }
    
    setError("");
    
    try {
      await loginMutation.mutateAsync({ email, password });
      // Si el login es exitoso, redirigir al dashboard
      navigate('/dashboard');
    } catch (error: any) {
      // Mostrar modal de error
      setErrorMessage(error.message || "Error al iniciar sesión. Verifica tus credenciales.");
      setShowErrorModal(true);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const handleBackToEmail = () => {
    setStep('email');
    setError("");
    setPassword("");
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {step === 'email' ? (
        <>
          {/* Título para email */}
          <h1 className="text-2xl md:text-3xl font-bold text-[#FFF100] text-center mb-8 uppercase tracking-wide">
            INGRESA O REGISTRARSE
          </h1>
          
          {/* Formulario de email */}
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            {/* Campo de email */}
            <EmailInput
              value={email}
              onChange={handleEmailChange}
              error={error}
              placeholder="Correo electrónico"
            />
            
            {/* Botón continuar */}
            <Button
              type="submit"
              variant="yellow"
              size="lg"
              className="w-full rounded-xl font-semibold text-lg py-4"
            >
              Continuar
            </Button>
          </form>
          
          {/* Opción biométrica - OCULTA */}
          {/* <div className="mt-8 flex justify-center">
            <BiometricOption onClick={onBiometricAuth} />
          </div> */}
        </>
      ) : (
        <>
          {/* Título para contraseña */}
          <h1 className="text-2xl md:text-3xl font-bold text-[#FFF100] text-center mb-4 uppercase tracking-wide">
            INGRESA CONTRASEÑA
          </h1>
          
          {/* Descripción */}
          <p className="text-sm text-gray-300 text-center mb-8">
            Por seguridad, introduce la contraseña asociada a tu cuenta. Asegúrate de que sea la correcta.
          </p>
          
          {/* Formulario de contraseña */}
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {/* Campo de contraseña */}
            <PasswordInput
              value={password}
              onChange={handlePasswordChange}
              error={error}
              placeholder="Contraseña"
            />
            
            {/* Botón continuar */}
            <Button
              type="submit"
              variant="yellow"
              size="lg"
              className="w-full rounded-xl font-semibold text-lg py-4"
              loading={loginMutation.isPending}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Iniciando sesión..." : "Continuar"}
            </Button>
          </form>
          
          {/* Enlace "Olvidé mi contraseña" */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[#FFF100] text-sm hover:text-[#E6D900] transition-colors"
            >
              Olvidé mi contraseña
            </button>
          </div>
          
          {/* Botón para volver al email */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleBackToEmail}
              className="text-gray-400 text-sm hover:text-gray-300 transition-colors"
            >
              ← Cambiar email
            </button>
          </div>
        </>
      )}
      
      {/* Modal de error */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
};

export default LoginForm;
