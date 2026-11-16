import {createContext, useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router';

import {getCurrentUser, logIn, register} from '../api/authApi.js';
import {
  clearToken,
  getToken,
  saveToken,
  setForbiddenHandler,
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
  // Adevărat când token-ul a expirat; pagina de autentificare explică de ce.
  const [sessionExpired, setSessionExpired] = useState(false);

  // La pornire: un token expirat se șterge fără redirecționare, ca paginile
  // publice (catalogul) să se deschidă normal. Paginile care cer cont trimit
  // oricum la autentificare. Dacă serverul nu răspunde, token-ul rămâne.
  useEffect(() => {
    if (!getToken()) {
      return;
    }
    getCurrentUser()
      .then(setUser)
      .catch((error) => {
        if (error.status === 401) {
          clearToken();
          setSessionExpired(true);
        }
      })
      .finally(() => setIsChecking(false));
  }, []);

  // Token expirat în timpul lucrului: utilizatorul iese din cont și ajunge la
  // autentificare, de unde se întoarce apoi pe pagina pe care era.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken();
      setUser(null);
      setSessionExpired(true);
      navigate('/autentificare', {
        state: {from: window.location.pathname + window.location.search},
        replace: true,
      });
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  // 403: rolul s-a schimbat între timp. Recitim utilizatorul de la server,
  // ca meniul și paginile protejate să arate drepturile actuale.
  useEffect(() => {
    setForbiddenHandler(() => {
      getCurrentUser()
        .then(setUser)
        .catch(() => {});
    });
    return () => setForbiddenHandler(null);
  }, []);

  async function signIn(email, password) {
    const data = await logIn(email, password);
    saveToken(data.token);
    setSessionExpired(false);
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
    <AuthContext.Provider
      value={{user, isChecking, sessionExpired, signIn, signUp, signOut}}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Utilizatorul autentificat (sau null) și funcțiile pentru cont.
 * @return {{user: ?Object, isChecking: boolean, sessionExpired: boolean,
 *     signIn: function(string, string): Promise<void>,
 *     signUp: function(Object): Promise<void>, signOut: function(): void}}
 */
export function useAuth() {
  return useContext(AuthContext);
}
