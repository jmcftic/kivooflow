import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import BackButtonPath from '../atoms/BackButtonPath';
import Logo from '../atoms/Logo';
import AdmirationCircleIcon from '../atoms/AdmirationCircleIcon';
import Button from '../atoms/Button';
import KryptoAnimation from '../atoms/KryptoAnimation';
import { requestAllClaims } from '@/services/network';
import { RequestAllClaimsResponse } from '@/types/network';
import { formatCurrencyWithThreeDecimals } from '@/lib/utils';
import '../../styles/krypto-animation.css';

interface ClaimAllScreenProps {
  onBack: () => void;
  totalInUSDT?: number;
  onError?: (message: string) => void;
  onRequestStarted?: () => void;
  onFinalContinue?: (shouldShowModal: boolean) => void;
  claimType?: 'mlm_transactions' | 'b2c_commissions';
  isPollingActive?: boolean;
}

// Componente para el fondo optimizado (se carga una sola vez)
const ClaimAllScreenBackground: React.FC = () => {
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    // Precargar la imagen
    const img = new Image();
    img.src = '/icons/Dashboard/ClaimAllScreenFull.svg';
    img.onload = () => setBgLoaded(true);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full">
      {bgLoaded && (
        <img 
          src="/icons/Dashboard/ClaimAllScreenFull.svg" 
          alt="Claim All Screen Background"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

const ClaimAllScreen: React.FC<ClaimAllScreenProps> = ({ 
  onBack, 
  totalInUSDT = 0,
  onError,
  onRequestStarted,
  onFinalContinue,
  claimType,
  isPollingActive = false
}) => {
  const { t } = useTranslation(['commissions', 'common']);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showCircleAnimation, setShowCircleAnimation] = useState(false);
  const [circleSize, setCircleSize] = useState(0);
  const [showFinalScreen, setShowFinalScreen] = useState(false);
  const [responseData, setResponseData] = useState<RequestAllClaimsResponse | null>(null);
  const hasTimedOutRef = useRef(false);

  const handleContinue = async () => {
    if (isRequesting) return;
    
    setIsRequesting(true);
    hasTimedOutRef.current = false;
    
    // Iniciar polling de notificaciones inmediatamente
    if (onRequestStarted) {
      onRequestStarted();
    }
    
    // Mostrar animación del círculo inmediatamente sin esperar la respuesta
    setShowCircleAnimation(true);
    setCircleSize(0);
    
    // Animar el círculo para que crezca
    const maxSize = Math.max(window.innerWidth, window.innerHeight) * 2;
    const duration = 800;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 2);
      setCircleSize(maxSize * easeOut);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Cuando termine la animación, mostrar la imagen final inmediatamente
        setShowFinalScreen(true);
        setShowCircleAnimation(false);
        setIsRequesting(false);
      }
    };
    
    requestAnimationFrame(animate);
    
    // Ejecutar la petición en segundo plano (sin esperar)
    requestAllClaims(claimType)
      .then((response) => {
        // Guardar la respuesta cuando llegue
        setResponseData(response);
      })
      .catch((error: any) => {
        // Los errores se manejarán a través de notificaciones del polling
        console.error('Error al reclamar todas las comisiones:', error);
      });
  };

  const handleFinalContinue = () => {
    // Cerrar la pantalla
    onBack();
    // Ejecutar el callback para mostrar el modal solo si el polling aún está activo
    if (onFinalContinue) {
      onFinalContinue(isPollingActive);
    }
  };

  const handleBack = () => {
    // Si el usuario sale por el botón de retroceso, también verificar si debe mostrar el modal
    if (onFinalContinue && showFinalScreen) {
      onFinalContinue(isPollingActive);
    }
    onBack();
  };

  return (
    <div className="fixed overflow-hidden" style={{ 
      margin: 0, 
      padding: 0, 
      backgroundColor: showFinalScreen ? 'transparent' : '#2a2a2a',
      zIndex: 9999,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      minWidth: '100vw',
      minHeight: '100vh'
    }}>
      {/* SVG Final - se muestra cuando termina la animación */}
      {showFinalScreen ? (
        <>
          <img 
            src="/icons/Dashboard/FinalFull.png" 
            alt="Final Screen"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              minWidth: '100vw',
              minHeight: '100vh',
              objectFit: 'fill',
              display: 'block',
              margin: 0,
              padding: 0,
              zIndex: 1,
            }}
          />
          
          {/* Animación de Krypto centrada */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50" style={{ zIndex: 2 }}>
            <KryptoAnimation />
          </div>

          {/* Contenido en la parte inferior */}
          <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 flex flex-col items-center gap-4" style={{ zIndex: 2 }}>
            {/* Texto "Se está procesando tu solicitud" */}
            <h2 
              className="text-black text-2xl sm:text-3xl font-bold text-center"
              style={{ fontFamily: 'Archivo, sans-serif' }}
            >
              {t('commissions:claimAllScreen.processingRequest')}
            </h2>
            
            {/* Mensaje del resumen - solo mostrar si ya llegó la respuesta */}
            {responseData?.data?.message && (
              <p 
                className="text-black text-sm sm:text-base text-center max-w-md"
                style={{ 
                  fontFamily: 'Archivo, sans-serif',
                  fontWeight: 'normal'
                }}
              >
                {responseData.data.message}
              </p>
            )}
            
            {/* Botón negro con texto amarillo */}
            <div className="w-full max-w-md mt-2">
              <button
                onClick={handleFinalContinue}
                className="w-full bg-black text-[#FFF100] py-3 px-6 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
                style={{ fontFamily: 'Archivo, sans-serif' }}
              >
                {t('commissions:claimAllScreen.continue')}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Fondo optimizado - se carga una sola vez */}
          <ClaimAllScreenBackground />

          {/* Animación del círculo amarillo */}
          {showCircleAnimation && (
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFF100]"
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                zIndex: 100,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Contenido principal */}
          <div className="relative z-10 h-full flex flex-col items-center px-6">
        {/* Botón de retroceso en la parte superior izquierda */}
        <button
          onClick={showFinalScreen ? handleBack : onBack}
          className="absolute top-4 left-4 z-50 cursor-pointer hover:opacity-80 transition-opacity"
          aria-label={t('commissions:claimAllScreen.back')}
        >
          <BackButtonPath width={64} height={64} />
        </button>

        {/* Contenido centrado */}
        <div className="flex flex-col items-center w-full max-w-md h-full relative">
          {/* Logo Kivo Flow - casi a la altura del botón de back */}
          <div className="absolute top-4">
            <Logo width={173} height={48} />
          </div>

          {/* Texto "solicitar pago" o "Se está procesando tu solicitud" en amarillo - 80px debajo del logo */}
          <h1 
            className="absolute text-[#FFF100] text-center text-2xl sm:text-3xl font-bold"
            style={{ 
              fontFamily: 'Archivo, sans-serif',
              top: '80px'
            }}
          >
            {isRequesting ? t('commissions:claimAllScreen.processingRequest') : t('commissions:claimAllScreen.requestPayment')}
          </h1>

          {/* Monto total con símbolo $ - totalmente centrado horizontal y verticalmente */}
          <div 
            className="absolute text-center" 
            style={{ 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              width: '100%'
            }}
          >
            <div className="flex flex-col items-center">
              <div>
                <span className="text-white text-4xl sm:text-5xl font-bold" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  USDT {formatCurrencyWithThreeDecimals(totalInUSDT)}
                </span>
                <span className="text-gray-400 text-4xl sm:text-5xl font-bold ml-2" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  USDT
                </span>
              </div>
              {/* Texto "Se usará el máximo disponible" debajo del valor */}
              <p className="text-white/60 text-sm mt-4 text-center">
                {t('commissions:claimAllScreen.willUseMaxAvailable')}
              </p>
            </div>
          </div>

          {/* Botón Continuar - 80px del fondo */}
          <div className="absolute bottom-[80px] w-full max-w-md">
            <Button
              variant="yellow"
              size="lg"
              className="w-full rounded-xl font-semibold text-lg"
              onClick={handleContinue}
              disabled={isRequesting || showCircleAnimation}
            >
              {isRequesting ? t('commissions:claimAllScreen.requestInProcess') : t('commissions:claimAllScreen.continue')}
            </Button>
          </div>

          {/* Div con texto sobre tarjeta predeterminada e icono - 50px arriba del botón (40px + 10px), texto gris, icono a la izquierda */}
          <div className="absolute flex items-start gap-3 w-full max-w-md" style={{ bottom: '150px' }}>
            <div className="flex-shrink-0 mt-1">
              <AdmirationCircleIcon width={40} height={40} />
            </div>
            <p className="text-gray-400 text-sm flex-1">
              {t('commissions:claimAllScreen.defaultCardInfo')}
            </p>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default ClaimAllScreen;

