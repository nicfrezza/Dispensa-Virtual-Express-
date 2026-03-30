import { Navigate } from 'react-router-dom';
import { useAuth } from '../../admin/auth/auth';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user, userData, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!user || !userData) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};