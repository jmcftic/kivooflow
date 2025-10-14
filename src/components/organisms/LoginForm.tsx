import React, { useState } from "react";
import Button from "../atoms/Button";
import EmailInput from "../molecules/EmailInput";
import BiometricOption from "../molecules/BiometricOption";

export interface LoginFormProps {
  onSubmit?: (email: string) => void;
  onBiometricAuth?: () => void;
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onBiometricAuth,
  className = ""
}) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
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
    onSubmit?.(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Título */}
      <h1 className="text-2xl md:text-3xl font-bold text-[#FFF100] text-center mb-8 uppercase tracking-wide">
        INGRESA O REGISTRARSE
      </h1>
      
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
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
      
      {/* Opción biométrica */}
      <div className="mt-8 flex justify-center">
        <BiometricOption onClick={onBiometricAuth} />
      </div>
    </div>
  );
};

export default LoginForm;
