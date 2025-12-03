import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { cn } from '@/lib/utils';

interface LottieLoaderProps {
  className?: string;
  size?: number;
}

function LottieLoader({ className, size }: LottieLoaderProps) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch('/animations/LoaderLottie.json')
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => {
        console.error('Error loading Lottie animation:', err);
      });
  }, []);

  if (!animationData) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div 
          className="animate-spin rounded-full border-2 border-[#FFF100] border-t-transparent w-16 h-16 lg:w-24 lg:h-24"
        />
      </div>
    );
  }

  // Si className contiene w- o h-, usar ese tamaño, sino usar el tamaño por defecto
  const hasCustomSize = className?.includes('w-') || className?.includes('h-');
  const containerClasses = hasCustomSize 
    ? cn("flex items-center justify-center", className)
    : "flex items-center justify-center";
  const innerClasses = hasCustomSize
    ? "w-full h-full"
    : "w-16 h-16 lg:w-24 lg:h-24";

  return (
    <div className={containerClasses}>
      <div className={innerClasses}>
        <Lottie
          animationData={animationData}
          loop={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}

export { LottieLoader };

