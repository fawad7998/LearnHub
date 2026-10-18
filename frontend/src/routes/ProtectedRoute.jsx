import { Navigate, Outlet, useLocation, Link } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { useAuth, dashboardFor } from "../context/AuthContext";
import { Loading } from "../components/Shared";
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (!user)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.role))
    return (
      <div className="standalone-state">
        <ShieldX size={48} />
        <h1>This space belongs to another role.</h1>
        <p>Your account does not have access to this dashboard.</p>
        <Link to={dashboardFor(user)} className="btn btn-primary">
          Go to my dashboard
        </Link>
      </div>
    );
  return <Outlet />;
}
