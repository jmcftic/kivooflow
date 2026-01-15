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
  // Detectar si className tiene h-auto para ajustar el comportamiento
  const hasAutoHeight = className?.includes('h-auto') || className?.includes('min-h-');
  
  return (
    <FoldedCard
      className={className}
      gradientColor="#FFFFFF"
      backgroundColor={backgroundColor}
      variant="lg"
    >
      <div className={`w-full ${hasAutoHeight ? 'min-h-full md:h-full' : 'h-full'} flex ${hasAutoHeight ? 'flex-col md:flex-row md:items-center' : 'items-center'}`}>
        {children}
      </div>
    </FoldedCard>
  );
};

export default InfoBanner;
