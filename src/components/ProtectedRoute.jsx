import { Redirect } from "react-router-dom";
import { IonSpinner } from "@ionic/react";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../utils/constants";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: "100%", display: "grid", placeItems: "center" }}>
        <IonSpinner name="crescent" />
      </div>
    );
  }
  if (!user) return <Redirect to="/login" />;
  if (adminOnly && profile?.role !== ROLES.ADMIN) return <Redirect to="/app/home" />;

  return children;
};

export default ProtectedRoute;