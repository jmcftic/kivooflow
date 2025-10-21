import { FunctionComponent } from "react";
import FoldedCard from "./FoldedCard";

export type InfoBannerType = {
  className?: string;
  children?: React.ReactNode;
};

const InfoBanner: FunctionComponent<InfoBannerType> = ({ 
  className = "",
  children 
}) => {
  return (
    <FoldedCard
      className={className}
      gradientColor="#FFFFFF"
      backgroundColor="#ffff79"
      variant="lg"
    >
      <div className="w-full flex items-center justify-center">
        {children}
      </div>
    </FoldedCard>
  );
};

export default InfoBanner;
