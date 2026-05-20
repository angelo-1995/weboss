'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import type { LoginFormValues, RegisterFormValues } from '../schemas/auth.schema';

export function useLogin() {
  const { setTokens, setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: LoginFormValues) =>
      authService.login(email, password),
    onSuccess: async (tokens) => {
      setTokens(tokens);
      // Fetch user data immediately after login
      try {
        const user = await authService.getMe(tokens.accessToken);
        setUser(user);
      } catch {
        // If getMe fails, still proceed to dashboard
      }
      router.push('/dashboard');
    },
  });
}

export function useRegister() {
  const { setTokens } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterFormValues) => authService.register(data),
    onSuccess: (tokens) => {
      setTokens(tokens);
      router.push('/dashboard');
    },
  });
}

export function useLogout() {
  const { accessToken, clearTokens } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: () =>
      accessToken ? authService.logout(accessToken) : Promise.resolve(),
    onSettled: () => {
      clearTokens();
      router.push('/login');
    },
  });
}
