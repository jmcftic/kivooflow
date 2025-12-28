import React, { FunctionComponent, ReactNode, useState, useEffect } from "react";
import ReferredLinkGap from "./ReferredLinkGap";
import ActionButton from "./ActionButton";
import FoldedCard from "./FoldedCard";
import { cn } from "@/lib/utils";

export type FullBannerType = {
  className?: string;
  title: string | ReactNode;
  linkText: string;
  linkHref?: string;
  onLinkClick?: () => void;
  onCopyClick?: () => void;
  onShareClick?: () => void;
};

const FullBanner: FunctionComponent<FullBannerType> = ({ 
  className = "",
  title,
  linkText,
  linkHref,
  onLinkClick,
  onCopyClick,
  onShareClick,
  ...props 
}) => {
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

  const handleCopyClick = () => {
    if (onCopyClick) {
      onCopyClick();
    }
    setShowCopiedTooltip(true);
  };

  useEffect(() => {
    if (showCopiedTooltip) {
      const timer = setTimeout(() => {
        setShowCopiedTooltip(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showCopiedTooltip]);

  return (
    <FoldedCard 
    className={cn("h-[220px] md:h-40", className)}
    gradientColor="#FFF100"
    backgroundColor="#212020"
    variant="xl"
  >
    <div className="w-full flex flex-col h-full">
      {/* Título en la parte superior, alineado a la izquierda */}
      <div className="text-white text-xl mb-1 mt-8">
        {title}
      </div>
      
      {/* Contenido en la parte inferior - Button Group con scroll horizontal en móvil */}
      <div className="flex-1 flex items-center">
        {/* Contenedor con scroll horizontal en pantallas pequeñas */}
        <div className="w-full overflow-x-auto overflow-y-hidden md:overflow-visible">
          {/* Button Group - Elementos pegados con ancho máximo */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center min-w-max md:min-w-0 w-full max-w-[1200px] gap-2 md:gap-0">
            {/* ReferredLinkGap - Elemento principal */}
            <div className="flex-1 md:flex-1 w-full max-w-full min-w-0 md:min-w-0">
              <ReferredLinkGap className="w-full max-w-full">
                <div className="flex items-center space-x-1.5 sm:space-x-2 w-full min-w-0 max-w-full">
                  <div className="flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5">
                      <path d="M15.2673 3.26078C15.9528 2.57526 17.0642 2.57526 17.7497 3.26078L20.7359 6.24693C21.4214 6.93244 21.4214 8.04389 20.7359 8.72941L17.7407 11.7246C17.4148 12.0505 17.0593 12.2228 16.7086 12.264C16.3615 12.3048 15.9573 12.2246 15.5152 11.9379C15.1677 11.7125 14.7033 11.8115 14.4779 12.159C14.2525 12.5065 14.3514 12.9709 14.699 13.1964C15.3973 13.6493 16.1478 13.8403 16.8838 13.7537C17.6164 13.6676 18.2727 13.3139 18.8013 12.7853L21.7965 9.79006C23.0678 8.51876 23.0678 6.45757 21.7965 5.18627L18.8104 2.20012C17.5391 0.928817 15.4779 0.928817 14.2066 2.20012L11.2114 5.19535C10.3172 6.08955 9.75876 7.83119 10.8572 9.3481C11.1001 9.68359 11.5691 9.75861 11.9045 9.51567C12.24 9.27273 12.3151 8.80382 12.0721 8.46833C11.5102 7.69231 11.7624 6.7657 12.2721 6.25601L15.2673 3.26078Z" fill="#FFF000"/>
                      <path d="M6.25617 12.2719C6.76586 11.7623 7.69246 11.51 8.46847 12.072C8.80396 12.3149 9.27287 12.2399 9.51581 11.9044C9.75875 11.5689 9.68373 11.1 9.34824 10.8571C7.83134 9.75862 6.0897 10.3171 5.19551 11.2113L2.2003 14.2065C0.929003 15.4778 0.929002 17.539 2.2003 18.8103L5.18643 21.7965C6.45772 23.0678 8.51891 23.0678 9.79021 21.7965L12.7854 18.8012C13.3141 18.2726 13.6677 17.6163 13.7539 16.8837C13.8404 16.1477 13.6495 15.3972 13.1965 14.6989C12.9711 14.3513 12.5066 14.2524 12.1591 14.4778C11.8116 14.7032 11.7126 15.1676 11.938 15.5151C12.2247 15.9572 12.305 16.3614 12.2641 16.7086C12.2229 17.0592 12.0506 17.4147 11.7248 17.7406L8.72954 20.7358C8.04403 21.4213 6.9326 21.4213 6.24709 20.7358L3.26096 17.7497C2.57545 17.0641 2.57545 15.9527 3.26096 15.2672L6.25617 12.2719Z" fill="#FFF000"/>
                      <path d="M14.9626 10.0516C15.2555 9.75874 15.2555 9.28386 14.9626 8.99097C14.6698 8.69808 14.1949 8.69808 13.902 8.99097L8.98896 13.904C8.69606 14.1969 8.69606 14.6718 8.98896 14.9647C9.28185 15.2576 9.75672 15.2576 10.0496 14.9647L14.9626 10.0516Z" fill="#FFF000"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 max-w-full overflow-hidden">
                    <ActionButton
                      text={linkText}
                      href={linkHref}
                      onClick={onLinkClick}
                      className="truncate block w-full max-w-full"
                    />
                  </div>
                </div>
              </ReferredLinkGap>
            </div>
            
            {/* Iconos pegados al ReferredLinkGap */}
            <div className="flex items-center justify-center md:justify-start gap-2 md:gap-0 flex-shrink-0">
              <div className="relative">
                <button
                  onClick={handleCopyClick}
                  className="flex items-center justify-center hover:opacity-80 transition-opacity md:ml-1"
                >
                  <svg className="w-10 h-10 md:w-[49px] md:h-[49px]" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="0.5" width="48" height="48" rx="12" fill="#FEF100" fillOpacity="0.05"/>
                    <rect x="0.5" y="0.5" width="48" height="48" rx="12" stroke="#FEF100" strokeDasharray="2 2"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M22.0489 13.75H21.9511C20.3488 13.75 19.0795 13.75 18.0753 13.8687C17.0443 13.9905 16.1956 14.2464 15.4866 14.8282C15.2461 15.0256 15.0256 15.2461 14.8282 15.4866C14.2464 16.1956 13.9905 17.0443 13.8687 18.0753C13.75 19.0795 13.75 20.3488 13.75 21.9511V22.0489C13.75 23.6512 13.75 24.9205 13.8687 25.9247C13.9905 26.9557 14.2464 27.8044 14.8282 28.5134C15.0256 28.7539 15.2461 28.9744 15.4866 29.1718C16.1585 29.7232 16.9559 29.9818 17.9154 30.1111C18.6943 30.2161 19.6318 30.2415 20.7607 30.2479C20.7737 30.8699 20.8026 31.4162 20.8665 31.8918C20.9875 32.7919 21.2464 33.5497 21.8484 34.1516C22.4503 34.7536 23.2081 35.0125 24.1082 35.1335C24.9752 35.25 26.0775 35.25 27.4451 35.25H28.5549C29.9225 35.25 31.0248 35.25 31.8918 35.1335C32.7919 35.0125 33.5497 34.7536 34.1517 34.1516C34.7536 33.5497 35.0125 32.7919 35.1335 31.8918C35.25 31.0248 35.25 29.9225 35.25 28.5549V27.4451C35.25 26.0775 35.25 24.9752 35.1335 24.1083C35.0125 23.2081 34.7536 22.4503 34.1517 21.8484C33.5497 21.2464 32.7919 20.9875 31.8918 20.8665C31.4162 20.8026 30.8699 20.7737 30.2479 20.7607C30.2415 19.6318 30.2161 18.6943 30.1111 17.9154C29.9818 16.9559 29.7232 16.1585 29.1718 15.4866C28.9744 15.2461 28.7539 15.0256 28.5134 14.8282C27.8044 14.2464 26.9557 13.9905 25.9248 13.8687C24.9205 13.75 23.6512 13.75 22.0489 13.75ZM28.7477 20.75C28.7411 19.6398 28.7161 18.7948 28.6246 18.1158C28.5157 17.308 28.3216 16.8151 28.0123 16.4382C27.8772 16.2737 27.7263 16.1228 27.5618 15.9877C27.1644 15.6616 26.638 15.4634 25.7487 15.3583C24.8428 15.2512 23.6621 15.25 22 15.25C20.3379 15.25 19.1572 15.2512 18.2513 15.3583C17.362 15.4634 16.8356 15.6616 16.4382 15.9877C16.2737 16.1228 16.1228 16.2737 15.9877 16.4382C15.6616 16.8356 15.4634 17.362 15.3583 18.2513C15.2512 19.1572 15.25 20.3379 15.25 22C15.25 23.6621 15.2512 24.8428 15.3583 25.7487C15.4634 26.638 15.6616 27.1644 15.9877 27.5618C16.1228 27.7263 16.2737 27.8772 16.4382 28.0123C16.8151 28.3216 17.308 28.5157 18.1158 28.6246C18.7948 28.7161 19.6398 28.7411 20.75 28.7477C20.75 28.684 20.75 28.6197 20.75 28.5549V27.4451C20.75 26.0775 20.75 24.9752 20.8665 24.1082C20.9875 23.2081 21.2464 22.4503 21.8484 21.8484C22.4503 21.2464 23.2081 20.9875 24.1083 20.8665C24.9752 20.75 26.0775 20.75 27.4451 20.75H28.5549C28.6197 20.75 28.684 20.75 28.7477 20.75ZM22.909 22.909C23.1858 22.6322 23.5743 22.4518 24.3081 22.3531C25.0635 22.2516 26.0646 22.25 27.5 22.25H28.5C29.9354 22.25 30.9365 22.2516 31.6919 22.3531C32.4257 22.4518 32.8142 22.6322 33.091 22.909C33.3678 23.1858 33.5482 23.5743 33.6469 24.3081C33.7484 25.0635 33.75 26.0646 33.75 27.5V28.5C33.75 29.9354 33.7484 30.9365 33.6469 31.6919C33.5482 32.4257 33.3678 32.8142 33.091 33.091C32.8142 33.3678 32.4257 33.5482 31.6919 33.6469C30.9365 33.7484 29.9354 33.75 28.5 33.75H27.5C26.0646 33.75 25.0635 33.7484 24.3081 33.6469C23.5743 33.5482 23.1858 33.3678 22.909 33.091C22.6322 32.8142 22.4518 32.4257 22.3531 31.6919C22.2516 30.9365 22.25 29.9354 22.25 28.5V27.5C22.25 26.0646 22.2516 25.0635 22.3531 24.3081C22.4518 23.5743 22.6322 23.1858 22.909 22.909Z" fill="#FFF000"/>
                  </svg>
                </button>
                {/* Tooltip minimalista */}
                {showCopiedTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-md whitespace-nowrap transition-opacity duration-200 pointer-events-none z-50">
                    Copiado
                    {/* Flecha del tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="w-2 h-2 bg-black/90 rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={onShareClick}
                className="flex items-center justify-center hover:opacity-80 transition-opacity md:ml-1"
              >
                <svg className="w-10 h-10 md:w-[49px] md:h-[49px]" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0.5" y="0.5" width="48" height="48" rx="12" fill="#FEF100" fillOpacity="0.05"/>
                  <rect x="0.5" y="0.5" width="48" height="48" rx="12" stroke="#FEF100" strokeDasharray="2 2"/>
                  <path d="M24.4983 27.25H24.5002L24.5012 27.249C24.9142 27.249 25.2502 26.915 25.2512 26.501L25.2772 16.04C26.0207 16.8261 26.8207 17.7831 26.9151 17.8961C26.9205 17.9025 26.9236 17.9062 26.9242 17.907C27.1882 18.226 27.6612 18.27 27.9802 18.005C28.2982 17.741 28.3422 17.268 28.0782 16.949C28.0092 16.865 26.3752 14.9 25.4352 14.101C25.1862 13.89 24.8792 13.766 24.5712 13.751H24.5572C24.2062 13.738 23.8662 13.857 23.5752 14.095C23.5722 14.097 23.5682 14.1 23.5652 14.103C22.6262 14.902 20.9922 16.867 20.9233 16.95C20.6583 17.269 20.7022 17.742 21.0212 18.006C21.3402 18.271 21.8122 18.227 22.0772 17.908C22.0892 17.893 22.9762 16.826 23.7762 15.985L23.7502 26.498C23.7492 26.912 24.0843 27.249 24.4983 27.25Z" fill="#FFF000"/>
                  <path d="M25.498 35.25C29.467 35.25 31.459 35.25 32.846 33.927C34.248 32.589 34.248 30.682 34.248 26.88C34.248 23.078 34.248 21.1701 32.845 19.8321C32.286 19.3001 31.589 18.961 30.652 18.765C30.246 18.681 29.849 18.941 29.764 19.346C29.68 19.752 29.94 20.1491 30.345 20.2341C31.007 20.3731 31.459 20.584 31.811 20.919C32.749 21.813 32.749 23.507 32.749 26.8799C32.749 30.2528 32.749 31.947 31.811 32.841C30.859 33.75 29.067 33.75 25.499 33.75H23.499C19.931 33.75 18.14 33.75 17.187 32.841C16.249 31.947 16.249 30.2531 16.249 26.8802C16.249 23.5072 16.249 21.814 17.186 20.92C17.539 20.585 17.992 20.3731 18.653 20.2351C19.059 20.1501 19.319 19.752 19.234 19.347C19.149 18.941 18.752 18.682 18.346 18.766C17.409 18.962 16.712 19.3011 16.152 19.8331C14.75 21.171 14.75 23.0789 14.75 26.8797C14.75 30.6804 14.75 32.5891 16.152 33.927C17.54 35.25 19.532 35.25 23.5 35.25H25.498Z" fill="#FFF000"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </FoldedCard>
  );
};

export default FullBanner;
