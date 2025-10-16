import React from "react";
import Button from "../atoms/Button";

export interface SuccessMessageProps {
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
  className?: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  title,
  message,
  buttonText,
  onButtonClick,
  className = ""
}) => {
  return (
    <div className={`text-center space-y-6 ${className}`}>
      <h1 className="text-2xl md:text-3xl font-bold text-[#FFF100] uppercase tracking-wide">
        {title}
      </h1>
      
      <p className="text-gray-300">
        {message}
      </p>
      
      <Button
        onClick={onButtonClick}
        variant="yellow"
        size="lg"
        className="w-full rounded-xl font-semibold text-lg py-4"
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default SuccessMessage;
