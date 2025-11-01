import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth';
import { LoginRequest, LoginResponse } from '../types/auth';

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials: LoginRequest) => {
      return await authService.login(credentials);
    },
    onSuccess: (_data: LoginResponse) => {
      // User data is already almacenada en authService.login()
  
    },
    onError: (error: Error) => {
      console.error('Login failed:', error);
    },
  });
};
