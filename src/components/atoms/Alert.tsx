import React from "react";

type AlertVariant = "default" | "destructive";

function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export interface AlertProps extends React.ComponentProps<"div"> {
  variant?: AlertVariant;
}

export const Alert: React.FC<AlertProps> = ({ className, variant = "default", ...props }) => {
  const base = "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current";
  const styles =
    variant === "destructive"
      ? "text-red-400/90 bg-[#1f1f1f] border-red-500/40"
      : "bg-[#1f1f1f] text-gray-200 border-gray-600";

  return (
    <div data-slot="alert" role="alert" className={classNames(base, styles, className)} {...props} />
  );
};

export const AlertTitle: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => (
  <div
    data-slot="alert-title"
    className={classNames("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className)}
    {...props}
  />
);

export const AlertDescription: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => (
  <div
    data-slot="alert-description"
    className={classNames(
      "text-gray-300 col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
      className,
    )}
    {...props}
  />
);

export default Alert;


