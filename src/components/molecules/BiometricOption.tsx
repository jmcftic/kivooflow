import React from "react";
import BiometricIcon from "../atoms/BiometricIcon";

export interface BiometricOptionProps {
  onClick?: () => void;
  className?: string;
  text?: string;
}

const BiometricOption: React.FC<BiometricOptionProps> = ({
  onClick,
  className = "",
  text = ""
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-3 text-gray-400 hover:text-gray-300 transition-colors ${className}`}
    >
      <BiometricIcon size={24} />
      <span className="text-sm font-medium">{text}</span>
    </button>
  );
};

export default BiometricOption;
