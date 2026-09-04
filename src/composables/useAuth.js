import { ref, onMounted } from 'vue';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const user = ref(null);
const loadingAuth = ref(true);

export function useAuth() {
  const initAuth = (onAuthSuccessCallback) => {
    onAuthStateChanged(auth, (currentUser) => {
      user.value = currentUser;
      loadingAuth.value = false;
      if (currentUser && onAuthSuccessCallback) {
        onAuthSuccessCallback(currentUser);
      }
    });
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      user.value = result.user;
      return result.user;
    } catch (err) {
      console.error("Lỗi đăng nhập Google:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      user.value = null;
    } catch (err) {
      console.error("Lỗi đăng xuất:", err);
    }
  };

  return {
    user,
    loadingAuth,
    initAuth,
    loginWithGoogle,
    logout
  };
}
