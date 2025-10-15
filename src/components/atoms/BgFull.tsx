import { FunctionComponent } from "react";

export type BgFullType = {
  className?: string;
};

const BgFull: FunctionComponent<BgFullType> = ({ className = "" }) => {
  return (
    <img
      className={`w-full h-full object-cover object-center leading-[normal] tracking-[normal] ${className}`}
      loading="lazy"
      alt=""
      src="/Bg-full@2x.png"
    />
  );
};

export default BgFull;
