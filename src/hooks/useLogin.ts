import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth';
import { LoginRequest, LoginResponse } from '../types/auth';

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials: LoginRequest) => {
      return await authService.login(credentials);
    },
    onSuccess: (data: LoginResponse) => {
      console.log('Login successful:', data);
      // User data is already stored in authService.login()
      // Additional logic can be added here if needed
    },
    onError: (error: Error) => {
      console.error('Login failed:', error);
    },
  });
};
