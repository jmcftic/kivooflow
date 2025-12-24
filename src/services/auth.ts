import { apiService } from "./api";
import { API_ENDPOINTS } from "../constants/api";
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  ForgotPasswordRequest,
  User 
} from "../types";

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
      loginData = {
        access_token: respAny.access_token,
        refresh_token: respAny.refresh_token,
        user: respAny.user,
      } as LoginResponse;
    } else {
      throw new Error(respAny?.message || "Login failed");
    }
    
    // Store tokens
    apiService.setToken(loginData.access_token);
    localStorage.setItem("refresh_token", loginData.refresh_token);
    
    // Store user data with all important information
    localStorage.setItem("user", JSON.stringify(loginData.user));
    
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
    // 1) { success: true, data: { access_token, refresh_token, expires_in } }
    // 2) { statusCode: 200|201, message, access_token, refresh_token, expires_in }
    // 3) Direct { access_token, refresh_token }

    let accessToken: string | undefined;
    let newRefresh: string | undefined;

    if (anyResp?.success && anyResp?.data?.access_token) {
      accessToken = anyResp.data.access_token;
      newRefresh = anyResp.data.refresh_token;
    } else if ((anyResp?.statusCode === 200 || anyResp?.statusCode === 201) && anyResp?.access_token) {
      accessToken = anyResp.access_token;
      newRefresh = anyResp.refresh_token;
    } else if (anyResp?.access_token) {
      accessToken = anyResp.access_token;
      newRefresh = anyResp.refresh_token;
    }

    if (!accessToken || !newRefresh) {
      throw new Error(anyResp?.message || "Token refresh failed");
    }

    apiService.setToken(accessToken);
    localStorage.setItem("refresh_token", newRefresh);

    return { access_token: accessToken, refresh_token: newRefresh } as LoginResponse;
  }

  // Logout
  async logout(): Promise<void> {
    // Clear tokens and cached session data locally
    apiService.setToken(null);
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<User>(API_ENDPOINTS.USER.PROFILE);
    
    if (response.success && response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    }
    
    throw new Error(response.message || "Failed to get user profile");
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = apiService.getToken();
    const user = localStorage.getItem("user");
    return !!(token && user);
  }

  // Get stored user
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
