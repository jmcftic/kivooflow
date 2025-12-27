import { apiService } from "./api";
import { API_ENDPOINTS } from "../constants/api";
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  ForgotPasswordRequest,
  User 
} from "../types";
import i18n from "../i18n/config";
import flagIconsService from "../utils/flagIcons";

class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const payload: LoginRequest = {
      ...credentials,
      email: credentials.email.trim().toLowerCase(),
    };

    const response = await apiService.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      payload
    );
    
    // Handle different response structures
    let loginData: LoginResponse;
    const respAny = response as any;
    
    if (respAny?.success && respAny?.data) {
      // Response has wrapper structure: { success: true, data: LoginResponse }
      loginData = respAny.data as LoginResponse;
    } else if (respAny?.access_token) {
      // Response is direct LoginResponse structure
      loginData = respAny as unknown as LoginResponse;
    } else if (respAny?.statusCode === 200 && respAny?.user) {
      // Response has structure: { statusCode, message, user, access_token, refresh_token, expires_in }
      // El lang puede venir en user.lang o en el nivel raíz
      const userLang = respAny.user?.lang || respAny.lang;
      loginData = {
        access_token: respAny.access_token,
        refresh_token: respAny.refresh_token,
        user: respAny.user,
        lang: userLang, // Incluir lang si existe
      } as LoginResponse;
    } else {
      throw new Error(respAny?.message || "Login failed");
    }
    
    // Store tokens
    apiService.setToken(loginData.access_token);
    localStorage.setItem("refresh_token", loginData.refresh_token);
    
    // Store user data with all important information
    localStorage.setItem("user", JSON.stringify(loginData.user));
    
    // Establecer idioma del usuario si viene en la respuesta
    // El backend devuelve el idioma preferido del usuario en user.lang
    // También verificar en loginData.lang por si viene en el nivel raíz
    const langToUse = loginData.user?.lang || loginData.lang || respAny.user?.lang || respAny.lang;
    
    console.log('[Auth] Debug - Extracción de idioma:', {
      'loginData.user?.lang': loginData.user?.lang,
      'loginData.lang': loginData.lang,
      'respAny.user?.lang': respAny.user?.lang,
      'respAny.lang': respAny.lang,
      'langToUse': langToUse,
      'i18n.language actual': i18n.language
    });
    
    if (langToUse && (langToUse === 'es' || langToUse === 'en')) {
      i18n.changeLanguage(langToUse);
      console.log(`[Auth] ✅ Idioma establecido desde backend: ${langToUse}`);
      console.log(`[Auth] ✅ Idioma actual de i18n después del cambio: ${i18n.language}`);
      console.log(`[Auth] ✅ localStorage i18nextLng: ${localStorage.getItem('i18nextLng')}`);
    } else {
      console.warn('[Auth] ⚠️ No se encontró idioma válido en la respuesta del backend', {
        langToUse,
        userHasLang: !!loginData.user?.lang
      });
    }

    // Cargar iconos de banderas después de iniciar sesión (usando singleton)
    flagIconsService.loadIcons().catch((error: any) => {
      console.error('[Auth] Error al cargar iconos de banderas:', error);
    });
    
    return loginData;
  }

  // Register user
  async register(userData: RegisterRequest): Promise<{ message: string }> {
    const endpoint = userData.referred_by_code 
      ? API_ENDPOINTS.AUTH.REGISTER_REFERRAL
      : API_ENDPOINTS.AUTH.REGISTER;
      
    const response = await apiService.post<{ message: string }>(
      endpoint,
      userData
    );
    
    if (response.success) {
      return { message: response.message || "Registration successful" };
    }
    
    throw new Error(response.message || "Registration failed");
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const payload: ForgotPasswordRequest = {
      ...data,
      email: data.email.trim().toLowerCase(),
    };

    const response = await apiService.post<{ message: string }>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      payload
    );
    
    // Considerar éxito cuando la API retorna 200/204 sin payload estandar
    if ((response as any)?.success !== false) {
      return { message: (response as any)?.message || "Password reset email sent" };
    }
    
    throw new Error(response.message || "Failed to send reset email");
  }

  // Verify reset code -> returns temp token on success
  async verifyResetCode(data: { email: string; code: string }): Promise<{ tempToken: string; message?: string; statusCode?: number }> {
    const payload = {
      ...data,
      email: data.email.trim().toLowerCase(),
    };

    const response = await apiService.post<{ tempToken: string; message?: string; statusCode?: number }>(
      API_ENDPOINTS.AUTH.VERIFY_RESET_CODE,
      payload
    );

    // La API puede devolver 200/201 con estructura { statusCode, message, tempToken }
    if ((response as any)?.tempToken) {
      return { tempToken: (response as any).tempToken, message: (response as any).message, statusCode: (response as any).statusCode };
    }

    // También considerar como éxito si viene success true con data
    if ((response as any)?.success && (response as any).data?.tempToken) {
      return { tempToken: (response as any).data.tempToken };
    }

    throw new Error((response as any)?.message || "Código inválido");
  }

  // Reset password using temp token (as 'token')
  async resetPassword(data: { token: string; newPassword: string }): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    );

    if ((response as any)?.success !== false) {
      return { message: (response as any)?.message || "Password reset successful" };
    }

    throw new Error((response as any)?.message || "Failed to reset password");
  }

  // Refresh token
  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = localStorage.getItem("refresh_token");
    
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    
    const response = await apiService.post<LoginResponse>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refresh_token: refreshToken }
    );
    
    const anyResp: any = response;

    // Backend may return one of:
    // 1) { success: true, data: { access_token, refresh_token, expires_in, lang } }
    // 2) { statusCode: 200|201, message, access_token, refresh_token, expires_in, lang }
    // 3) Direct { access_token, refresh_token, lang }

    let accessToken: string | undefined;
    let newRefresh: string | undefined;
    let lang: string | undefined;

    if (anyResp?.success && anyResp?.data?.access_token) {
      accessToken = anyResp.data.access_token;
      newRefresh = anyResp.data.refresh_token;
      lang = anyResp.data.lang;
    } else if ((anyResp?.statusCode === 200 || anyResp?.statusCode === 201) && anyResp?.access_token) {
      accessToken = anyResp.access_token;
      newRefresh = anyResp.refresh_token;
      lang = anyResp.lang;
    } else if (anyResp?.access_token) {
      accessToken = anyResp.access_token;
      newRefresh = anyResp.refresh_token;
      lang = anyResp.lang;
    }

    if (!accessToken || !newRefresh) {
      throw new Error(anyResp?.message || "Token refresh failed");
    }

    apiService.setToken(accessToken);
    localStorage.setItem("refresh_token", newRefresh);

    // Actualizar idioma si viene en la respuesta del refresh
    if (lang && (lang === 'es' || lang === 'en')) {
      i18n.changeLanguage(lang);
      console.log(`[Auth] Idioma actualizado desde refresh token: ${lang}`);
    }

    return { access_token: accessToken, refresh_token: newRefresh, lang } as LoginResponse;
  }

  // Logout
  async logout(): Promise<void> {
    // Clear tokens and cached session data locally
    apiService.setToken(null);
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  // Get current user profile from API (async)
  async getUserProfile(): Promise<User> {
    const response = await apiService.get<User & { lang?: string }>(API_ENDPOINTS.USER.PROFILE);
    
    if (response.success && response.data) {
      const userData = response.data;
      
      // Actualizar idioma si viene en el perfil del usuario
      if (userData.lang && (userData.lang === 'es' || userData.lang === 'en')) {
        i18n.changeLanguage(userData.lang);
        console.log(`[Auth] Idioma actualizado desde perfil de usuario: ${userData.lang}`);
      }
      
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    }
    
    throw new Error(response.message || "Failed to get user profile");
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = apiService.getToken();
    const user = localStorage.getItem("user");
    return !!(token && user);
  }

  // Get stored user (synchronous - from localStorage)
  getStoredUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Get current user (synchronous - alias for getStoredUser for consistency)
  getCurrentUser(): User | null {
    return this.getStoredUser();
  }

  // Update user profile (including language)
  async updateProfile(updates: { lang?: 'es' | 'en'; full_name?: string; phone?: string; [key: string]: any }): Promise<{ user: User; message?: string }> {
    const response = await apiService.patch<{ user: User; message?: string; statusCode?: number }>(
      API_ENDPOINTS.AUTH.UPDATE_PROFILE,
      updates
    );

    const respAny = response as any;

    // Handle different response structures
    let user: User;
    let message: string | undefined;

    if (respAny?.success && respAny?.data?.user) {
      user = respAny.data.user as User;
      message = respAny.data.message || respAny.message;
    } else if (respAny?.statusCode === 200 && respAny?.user) {
      user = respAny.user as User;
      message = respAny.message;
    } else if (respAny?.user) {
      user = respAny.user as User;
      message = respAny.message;
    } else {
      throw new Error(respAny?.message || "Error al actualizar perfil");
    }

    // Update stored user data
    localStorage.setItem("user", JSON.stringify(user));

    // If language was updated, update i18n
    if (updates.lang && (updates.lang === 'es' || updates.lang === 'en')) {
      i18n.changeLanguage(updates.lang);
    }

    return { user, message };
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<{ id: number; email: string }> {
    const response = await apiService.get<{ id: number; email: string }>(
      API_ENDPOINTS.AUTH.USER_BY_EMAIL,
      { email: email.trim().toLowerCase() }
    );

    const anyResponse = response as any;
    
    // El endpoint puede devolver directamente { id, email } o envuelto en { user: { id, email } }
    if (anyResponse?.user) {
      return anyResponse.user;
    }
    
    if (anyResponse?.success && anyResponse?.data) {
      return anyResponse.data;
    }
    
    if (anyResponse?.id && anyResponse?.email) {
      return { id: anyResponse.id, email: anyResponse.email };
    }

    throw new Error(anyResponse?.message || "Usuario no encontrado");
  }
}

export const authService = new AuthService();
export default authService;
