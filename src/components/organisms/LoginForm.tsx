import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(['forms', 'common']);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const passwordInputRef = useRef<HTMLInputElement>(null);
  
  const loginMutation = useLogin();

  // Enfocar automáticamente el campo de contraseña cuando cambia el step
  useEffect(() => {
    if (step === 'password' && passwordInputRef.current) {
      // Pequeño delay para asegurar que el DOM se haya actualizado
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  }, [step]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError(t('forms:login.emailRequired'));
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('common:validation.email'));
      return;
    }
    
    setError("");
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError(t('forms:login.passwordRequired'));
      return;
    }
    
    setError("");
    
    try {
      await loginMutation.mutateAsync({ email, password });
      // Esperar un momento para que el idioma se establezca correctamente
      // antes de navegar (si el backend devolvió un idioma, ya se estableció en authService.login)
      await new Promise(resolve => setTimeout(resolve, 100));
      // Si el login es exitoso, redirigir al dashboard
      navigate('/dashboard');
    } catch (error: any) {
      // Mostrar modal de error
      setErrorMessage(error.message || t('forms:login.invalidCredentials'));
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
            {t('forms:login.title')}
          </h1>
          
          {/* Formulario de email */}
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            {/* Campo de email */}
            <EmailInput
              value={email}
              onChange={handleEmailChange}
              error={error}
              placeholder={t('forms:login.emailPlaceholder')}
            />
            
            {/* Botón continuar */}
            <Button
              type="submit"
              variant="yellow"
              size="lg"
              className="w-full rounded-xl font-semibold text-lg py-4"
            >
              {t('forms:login.continue')}
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
            {t('forms:login.passwordTitle')}
          </h1>
          
          {/* Descripción */}
          <p className="text-sm text-gray-300 text-center mb-8">
            {t('forms:login.passwordDescription')}
          </p>
          
          {/* Formulario de contraseña */}
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {/* Campo de contraseña */}
            <PasswordInput
              ref={passwordInputRef}
              value={password}
              onChange={handlePasswordChange}
              error={error}
              placeholder={t('forms:login.passwordPlaceholder')}
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
              {loginMutation.isPending ? t('forms:login.loggingIn') : t('forms:login.continue')}
            </Button>
          </form>
          
          {/* Enlace "Olvidé mi contraseña" */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[#FFF100] text-sm hover:text-[#E6D900] transition-colors"
            >
              {t('forms:login.forgotPassword')}
            </button>
          </div>
          
          {/* Botón para volver al email */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleBackToEmail}
              className="text-gray-400 text-sm hover:text-gray-300 transition-colors"
            >
              ← {t('forms:login.changeEmail')}
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
