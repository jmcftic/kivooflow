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
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
    },
    onError: (error: Error) => {
      console.error('Login failed:', error);
    },
  });
};
