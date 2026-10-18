import { createContext, useContext, useEffect, useState } from "react";
import api, { tokenKey } from "../services/api";
const Context = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const clear = () => setUser(null);
    window.addEventListener("learnhub-session-ended", clear);
    if (sessionStorage.getItem(tokenKey))
      api
        .get("/me")
        .then(({ data }) => setUser(data.user))
        .catch(() => sessionStorage.removeItem(tokenKey))
        .finally(() => setLoading(false));
    else setLoading(false);
    return () => window.removeEventListener("learnhub-session-ended", clear);
  }, []);
  async function signIn(input) {
    const { data } = await api.post("/login", input);
    sessionStorage.setItem(tokenKey, data.token);
    setUser(data.user);
    return data.user;
  }
  async function signOut() {
    try {
      await api.post("/logout");
    } finally {
      sessionStorage.removeItem(tokenKey);
      setUser(null);
    }
  }
  return (
    <Context.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </Context.Provider>
  );
}
export const useAuth = () => useContext(Context);
export const dashboardFor = (user) =>
  user ? `/dashboard/${user.role}` : "/login";
