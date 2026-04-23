import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { api } from "@/lib/api.tsx";

type UserType = {
  fullName: string;
  email: string;
  avatar: string;
  uid: string;
};

type DecodedToken = UserType & {
  exp: number;
};

type UserContextType = {
  user: UserType;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticate: boolean;
  isLoading: boolean;
};

export const UserContext = createContext<UserContextType>({
  user: {
    fullName: "",
    email: "",
    avatar: "",
    uid: "",
  },
  login: () => {},
  logout: () => {},
  isAuthenticate: false,
  isLoading: true,
});

export const useUser = () => {
  return React.useContext(UserContext);
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType>({
    fullName: "",
    email: "",
    avatar: "",
    uid: "",
  });

  const [isAuthenticate, setIsAuthenticate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = (token: string) => {
    localStorage.setItem("token", token);

    const decoded = jwtDecode<DecodedToken>(token);

    setUser({
      fullName: decoded.fullName,
      email: decoded.email,
      avatar: decoded.avatar,
      uid: decoded.uid,
    });

    setIsAuthenticate(true);

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem("token");

    setUser({
      fullName: "",
      email: "",
      avatar: "",
      uid: "",
    });

    setIsAuthenticate(false);

    delete api.defaults.headers.common["Authorization"];
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      if (decoded.exp * 1000 < Date.now()) {
        logout();
        setIsLoading(false);
        return;
      }
    } catch (err) {
      logout();
      setIsLoading(false);
      return;
    }

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    api
      .get("/verify")
      .then((res) => {
        setUser(res.data.user);
        setIsAuthenticate(true);
      })
      .catch((err) => {
        console.log(err);
        logout();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticate,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
