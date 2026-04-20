// components/AuthRoute.js
import { Navigate } from "react-router-dom";
import { getToken } from "./Auth";

const AuthRoute = ({ element, isPrivate }) => {
  const token = getToken();
  // Jika ini adalah rute private dan token tidak ada, redirect ke halaman login
  if (isPrivate && !token) {
    return <Navigate to="/login" replace />;
  }

  // Jika ini adalah rute public dan token ada, redirect ke dashboard
  if (!isPrivate && token) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

export default AuthRoute;
