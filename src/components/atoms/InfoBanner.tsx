import { FunctionComponent } from "react";
import FoldedCard from "./FoldedCard";

export type InfoBannerType = {
  className?: string;
  children?: React.ReactNode;
  backgroundColor?: string;
};

const InfoBanner: FunctionComponent<InfoBannerType> = ({ 
  className = "",
  backgroundColor = "#ffff79",
  children 
}) => {
  return (
    <FoldedCard
      className={className}
      gradientColor="#FFFFFF"
      backgroundColor={backgroundColor}
      variant="lg"
    >
      <div className="w-full flex items-center justify-center">
        {children}
      </div>
    </FoldedCard>
  );
};

export default InfoBanner;
