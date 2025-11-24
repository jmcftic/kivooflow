import React, { useState, forwardRef } from "react";
import { FunctionComponent } from "react";
import Input from "./Input";

export type PasswordInputType = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  className?: string;
};

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputType>(({
  value,
  onChange,
  placeholder = "Contraseña",
  error = "",
  className = "",
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const EyeIcon = () => (
    <button
      type="button"
      onClick={togglePasswordVisibility}
      className="text-[#FFF100] hover:text-[#E6D900] transition-colors cursor-pointer"
    >
      {showPassword ? (
        // Ojo abierto
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>
      ) : (
        // Ojo cerrado usando SVG local
        <img src="/icons/ClosedEyeIcon.svg" alt="Ocultar contraseña" width={24} height={24} />
      )}
    </button>
  );

  return (
    <div className={`w-full ${className}`}>
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        variant="kivoo-glass"
        error={error}
        rightIcon={<EyeIcon />}
        className="rounded-xl"
      />
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
