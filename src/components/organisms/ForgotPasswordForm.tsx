import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../atoms/Button";
import Spinner from "../atoms/Spinner";
import EmailInput from "../molecules/EmailInput";
import SuccessMessage from "../molecules/SuccessMessage";
import { useForgotPassword } from "../../hooks/useForgotPassword";
import { Alert, AlertDescription, AlertTitle } from "../atoms/Alert";

export interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
  className?: string;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onBack,
  className = ""
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
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
    
    try {
      await forgotPasswordMutation.mutateAsync({ email });
      // Navegar a la pantalla intermedia de confirmación
      navigate('/verification-sent', { state: { email } });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setError(error.message || "Error al enviar el correo de recuperación");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Comportamiento por defecto - volver al login
      window.history.back();
    }
  };

  // Mostrar estado de éxito
  if (isSuccess) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <SuccessMessage
          title="¡Listo! Revisa tu correo"
          message="Te enviamos un enlace para que puedas crear una nueva contraseña. Si no lo ves, revisa también la carpeta de spam o correo no deseado."
          buttonText="Regresar"
          onButtonClick={handleBack}
        />
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <h1 className="text-2xl md:text-3xl font-bold text-[#FFF100] text-center mb-3 uppercase tracking-wide">
        RESTABLECER CONTRASEÑA
      </h1>
      {error ? (
        <div className="mb-4">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : null}
      
      <p className="text-center text-gray-300 mb-6">
        Le enviaremos un correo electrónico con instrucciones para restablecer la contraseña.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <EmailInput
          value={email}
          onChange={handleEmailChange}
          error={error}
          placeholder="Correo electrónico"
        />
        
        <Button
          type="submit"
          variant="yellow"
          size="lg"
          className="w-full rounded-xl font-semibold text-lg py-4"
          disabled={forgotPasswordMutation.isPending}
        >
          {forgotPasswordMutation.isPending ? (
            <div className="flex items-center justify-center space-x-2">
              <Spinner size="sm" className="text-black" />
              <span>Enviando...</span>
            </div>
          ) : (
            "Enviar"
          )}
        </Button>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
