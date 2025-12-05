/**
 * Cache singleton para la animación Lottie
 * Carga el JSON una sola vez y lo comparte entre todas las instancias
 */

let animationDataCache: any = null;
let loadingPromise: Promise<any> | null = null;

export const loadLottieAnimation = async (): Promise<any> => {
  // Si ya está cargado, retornar inmediatamente
  if (animationDataCache) {
    return animationDataCache;
  }

  // Si ya hay una carga en progreso, esperar a que termine
  if (loadingPromise) {
    return loadingPromise;
  }

  // Iniciar la carga
  loadingPromise = fetch('/animations/LoaderLottie.json')
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load Lottie animation: ${res.statusText}`);
      }
      return res.json();
    })
    .then((data) => {
      animationDataCache = data;
      loadingPromise = null; // Limpiar la promesa después de cargar
      return data;
    })
    .catch((err) => {
      loadingPromise = null; // Limpiar la promesa en caso de error
      console.error('Error loading Lottie animation:', err);
      throw err;
    });

  return loadingPromise;
};

/**
 * Precargar la animación (opcional, puede llamarse al inicio de la app)
 */
export const preloadLottieAnimation = (): void => {
  if (!animationDataCache && !loadingPromise) {
    loadLottieAnimation().catch(() => {
      // Silenciar errores en precarga
    });
  }
};

