import { API_BASE_URL, API_ENDPOINTS, HTTP_STATUS } from "../constants/api";
import { ApiResponse, ApiError } from "../types";

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("access_token");
  }

  // Set authentication token
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("access_token");
    }
  }

  // Get authentication token
  getToken(): string | null {
    return this.token || localStorage.getItem("access_token");
  }

  // Get headers for requests
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Handle API errors
  private async handleError(response: Response): Promise<never> {
    let errorData: any;
    
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: "An error occurred" };
    }

    const error: ApiError = {
      message: errorData.message || "An error occurred",
      status: response.status,
      errors: errorData.errors,
    };

    throw error;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      mode: 'cors',
      credentials: 'include',
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        await this.handleError(response);
      }

      // Manejar respuestas sin contenido (204) o sin JSON
      if (response.status === 204) {
        return { success: true } as unknown as ApiResponse<T>;
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return { success: true } as unknown as ApiResponse<T>;
      }

      try {
        const data = await response.json();
        return data;
      } catch {
        // Si no se puede parsear JSON, asumir éxito genérico
        return { success: true } as unknown as ApiResponse<T>;
      }
    } catch (error) {
      if (error instanceof Error && error.name === "TypeError") {
        throw {
          message: "Network error. Please check your connection.",
          status: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });
    }

    return this.request<T>(endpoint + (params ? `?${url.searchParams}` : ""), {
      method: "GET",
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }

  // Utility method to build endpoint URLs
  buildEndpoint(endpoint: string, params?: Record<string, string | number>): string {
    let builtEndpoint = endpoint;
    
    if (params) {
      Object.keys(params).forEach(key => {
        builtEndpoint = builtEndpoint.replace(`:${key}`, String(params[key]));
      });
    }
    
    return builtEndpoint;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
