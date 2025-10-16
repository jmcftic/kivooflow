import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth';
import { ForgotPasswordRequest } from '../types/auth';

export const useForgotPassword = () => {
  return useMutation<{ message: string }, Error, ForgotPasswordRequest>({
    mutationFn: async (data: ForgotPasswordRequest) => {
      return await authService.forgotPassword(data);
    },
    onSuccess: (data: { message: string }) => {
      console.log('Password reset email sent:', data);
    },
    onError: (error: Error) => {
      console.error('Password reset failed:', error);
    },
  });
};
