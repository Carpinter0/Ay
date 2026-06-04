import { useAuth } from '../context/AuthContext.js';

export function useCurrentUser() {
  const { user, loading } = useAuth();
  return { user, loading };
}

export function useLogout() {
  const { logout } = useAuth();
  return logout;
}
