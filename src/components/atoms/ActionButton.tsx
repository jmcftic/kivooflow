import React, { FunctionComponent } from "react";

export type ActionButtonType = {
  className?: string;
  text: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
};

const ActionButton: FunctionComponent<ActionButtonType> = ({ 
  className = "",
  text,
  onClick,
  href,
  disabled = false,
  ...props 
}) => {
  const baseClasses = `action-text ${className}`.trim();

  // Si tiene href, renderizar como enlace
  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        {...props}
      >
        {text}
      </a>
    );
  }

  // Si no tiene href, renderizar como texto clickeable
  return (
    <span
      onClick={disabled ? undefined : onClick}
      className={baseClasses}
      {...props}
    >
      {text}
    </span>
  );
};

export default ActionButton;
