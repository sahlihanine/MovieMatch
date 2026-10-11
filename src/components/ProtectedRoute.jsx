import { Redirect } from "react-router-dom";
import { IonSpinner } from "@ionic/react";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../utils/constants";

// adminOnly : réservé aux admins
// userOnly  : réservé aux utilisateurs (un admin est renvoyé vers son espace)
const ProtectedRoute = ({ children, adminOnly = false, userOnly = false }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: "100%", display: "grid", placeItems: "center" }}>
        <IonSpinner name="crescent" />
      </div>
    );
  }
  if (!user) return <Redirect to="/login" />;

  const isAdmin = profile?.role === ROLES.ADMIN;
  if (adminOnly && !isAdmin) return <Redirect to="/app/home" />;
  if (userOnly && isAdmin) return <Redirect to="/admin/users" />;

  return children;
};

export default ProtectedRoute;