import React from "react";
import Input from "../atoms/Input";
import MailIcon from "../atoms/MailIcon";

export interface EmailInputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  className?: string;
}

const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  error,
  placeholder = "Correo electrónico",
  className = ""
}) => {
  return (
    <div className={`w-full ${className}`}>
      <Input
        type="email"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        variant="kivoo-glass"
        error={error}
        rightIcon={<MailIcon size={24} />}
        className="rounded-xl"
      />
    </div>
  );
};

export default EmailInput;
