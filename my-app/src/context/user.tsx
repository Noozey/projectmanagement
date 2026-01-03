import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { api } from "@/lib/api.tsx";
import { toast } from "sonner";

export const UserContext = createContext({
  user: {
    fullName: "",
    email: "",
    avatar: "",
  },
  currentProject: "",
  login: () => {},
  logout: () => {},
  isAuthenticate: false,
  isLoading: true,
});

export const useUser = () => {
  return React.useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    avatar: "",
  });
  const [currentProject, setCurrentProject] = useState<"Personal">("Personal");
  const [isAuthenticate, setIsAuthenticate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser({
      fullName: decoded.fullName,
      email: decoded.email,
      avatar: decoded.avatar,
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
      const decoded = jwtDecode(token);
      // Check if token is expired
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

    // Token exists and is valid, verify with server
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
        currentProject,
        setCurrentProject,
        isAuthenticate,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
