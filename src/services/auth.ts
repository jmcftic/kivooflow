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
    const response = await apiService.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
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
    } else {
      throw new Error(respAny?.message || "Login failed");
    }
    
    // Store tokens
    apiService.setToken(loginData.access_token);
    localStorage.setItem("refresh_token", loginData.refresh_token);
    
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
    const response = await apiService.post<{ message: string }>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data
    );
    
    // Considerar éxito cuando la API retorna 200/204 sin payload estandar
    if ((response as any)?.success !== false) {
      return { message: (response as any)?.message || "Password reset email sent" };
    }
    
    throw new Error(response.message || "Failed to send reset email");
  }

  // Verify reset code -> returns temp token on success
  async verifyResetCode(data: { email: string; code: string }): Promise<{ tempToken: string; message?: string; statusCode?: number }> {
    const response = await apiService.post<{ tempToken: string; message?: string; statusCode?: number }>(
      API_ENDPOINTS.AUTH.VERIFY_RESET_CODE,
      data
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
    
    if (response.success && response.data) {
      // Update tokens
      apiService.setToken(response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
      
      return response.data;
    }
    
    throw new Error(response.message || "Token refresh failed");
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn("Logout API call failed:", error);
    } finally {
      // Clear local storage
      apiService.setToken(null);
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
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
}

export const authService = new AuthService();
export default authService;
