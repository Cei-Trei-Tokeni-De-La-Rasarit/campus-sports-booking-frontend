import {createContext, useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router';

import {getCurrentUser, logIn, register} from '../api/authApi.js';
import {
  clearToken,
  getToken,
  saveToken,
  setUnauthorizedHandler,
} from '../api/request.js';

const AuthContext = createContext(null);

/**
 * Păstrează utilizatorul autentificat pentru toată aplicația și oferă
 * funcțiile de autentificare, creare cont și ieșire.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function AuthProvider({children}) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  // Cu un token salvat, aflăm întâi de la server cui îi aparține.
  const [isChecking, setIsChecking] = useState(() => getToken() !== null);

  useEffect(() => {
    if (!getToken()) {
      return;
    }
    getCurrentUser()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setIsChecking(false));
  }, []);

  // Token expirat sau greșit: utilizatorul iese din cont și ajunge la
  // autentificare, de unde se întoarce apoi pe pagina pe care era.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken();
      setUser(null);
      navigate('/autentificare', {
        state: {from: window.location.pathname},
        replace: true,
      });
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  async function signIn(email, password) {
    const data = await logIn(email, password);
    saveToken(data.token);
    setUser(data.utilizator);
  }

  async function signUp(account) {
    // Serverul nu întoarce token la creare, așa că ne autentificăm imediat.
    await register(account);
    await signIn(account.email, account.parola);
  }

  function signOut() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{user, isChecking, signIn, signUp, signOut}}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Utilizatorul autentificat (sau null) și funcțiile pentru cont.
 * @return {{user: ?Object, isChecking: boolean,
 *     signIn: function(string, string): Promise<void>,
 *     signUp: function(Object): Promise<void>, signOut: function(): void}}
 */
export function useAuth() {
  return useContext(AuthContext);
}
