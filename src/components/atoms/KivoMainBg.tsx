import { FunctionComponent } from "react";

export type KivoMainBgType = {
  className?: string;
};

const KivoMainBg: FunctionComponent<KivoMainBgType> = ({ className = "" }) => {
  return (
    <img
      className={`w-full h-full object-cover object-center leading-[normal] tracking-[normal] ${className}`}
      loading="eager"
      alt=""
      src="/KivoMainBg.svg"
      decoding="async"
      fetchpriority="high"
    />
  );
};

export default KivoMainBg;
