import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const RoleRoute = ({ allowedRoles }) => {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
