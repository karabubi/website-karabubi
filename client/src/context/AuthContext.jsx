import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
} from "../api";

const AuthContext =
  createContext(null);

const TOKEN_KEY =
  "websiteKarabubiToken";

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token =
        localStorage.getItem(
          TOKEN_KEY
        );

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await getCurrentUser();

        setUser(response.user);
      } catch {
        localStorage.removeItem(
          TOKEN_KEY
        );

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (
    credentials
  ) => {
    const response =
      await loginRequest(
        credentials
      );

    localStorage.setItem(
      TOKEN_KEY,
      response.token
    );

    setUser(response.user);

    return response;
  };

  const register = async (
    account
  ) => {
    const response =
      await registerRequest(
        account
      );

    localStorage.setItem(
      TOKEN_KEY,
      response.token
    );

    setUser(response.user);

    return response;
  };

  const logout = () => {
    localStorage.removeItem(
      TOKEN_KEY
    );

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
