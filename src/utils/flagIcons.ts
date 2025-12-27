/**
 * Singleton para cargar y almacenar las URLs de los iconos de banderas
 * Los iconos se cargan una vez cuando se inicia sesión
 */
class FlagIconsService {
  private static instance: FlagIconsService;
  private spanishFlagUrl: string;
  private englishFlagUrl: string;
  private isLoaded: boolean = false;

  private constructor() {
    // URLs directas a los archivos PNG
    this.spanishFlagUrl = '/icons/Dashboard/flags_icons/Espanish-Flag.png';
    this.englishFlagUrl = '/icons/Dashboard/flags_icons/English-Flag.png';
  }

  static getInstance(): FlagIconsService {
    if (!FlagIconsService.instance) {
      FlagIconsService.instance = new FlagIconsService();
    }
    return FlagIconsService.instance;
  }

  /**
   * Carga los iconos de las banderas (precarga las imágenes)
   * Solo se ejecuta una vez, incluso si se llama múltiples veces
   */
  async loadIcons(): Promise<void> {
    // Si ya están cargados, retornar inmediatamente
    if (this.isLoaded) {
      return Promise.resolve();
    }

    try {
      // Precargar las imágenes para asegurar que estén disponibles
      const [spanishImg, englishImg] = await Promise.all([
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = this.spanishFlagUrl;
        }),
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = this.englishFlagUrl;
        }),
      ]);

      this.isLoaded = true;
      // console.log('[FlagIcons] Iconos de banderas cargados exitosamente');
    } catch (error) {
      console.error('[FlagIcons] Error al cargar iconos:', error);
      // Continuar aunque haya error, las URLs están disponibles
      this.isLoaded = true;
    }
  }

  /**
   * Obtiene la URL de la bandera española
   */
  getSpanishFlagUrl(): string {
    return this.spanishFlagUrl;
  }

  /**
   * Obtiene la URL de la bandera inglesa
   */
  getEnglishFlagUrl(): string {
    return this.englishFlagUrl;
  }

  /**
   * Obtiene la URL de la bandera según el código de idioma
   */
  getFlagUrl(lang: 'es' | 'en'): string {
    return lang === 'es' ? this.spanishFlagUrl : this.englishFlagUrl;
  }

  /**
   * Verifica si los iconos ya están cargados
   */
  areIconsLoaded(): boolean {
    return this.isLoaded;
  }
}

export const flagIconsService = FlagIconsService.getInstance();
export default flagIconsService;

