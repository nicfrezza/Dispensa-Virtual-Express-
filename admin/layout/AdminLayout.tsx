import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth';
import { DebugFirestore } from '../../src/components/DebugFirestore';


const AdminLayout = () => {
    const { user, userData, logout, temPermissao, loading } = useAuth();
    const navigate = useNavigate();

    // Redirecionar se não estiver autenticado
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!user || !userData) {
        navigate('/admin/login');
        return null;
    }

    const menuItems = [
        { path: '/admin', icon: '📊', label: 'Dashboard', permissao: 'solicitacoes_visualizar' },
        { path: '/admin/gerenciar_solicitacoes', icon: '📋', label: 'Solicitações', permissao: 'solicitacoes_visualizar' },
        { path: '/admin/reclamacoes', icon: '⚠️', label: 'Reclamações', permissao: 'reclamacoes_responder' },
        { path: '/admin/relatorios', icon: '📈', label: 'Relatórios', permissao: 'relatorios_visualizar' },
        { path: '/admin/usuarios', icon: '👥', label: 'Usuários', permissao: 'usuarios_gerenciar' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-xl font-bold text-emerald-400">Painel Admin</h1>
                    <p className="text-xs text-slate-400 mt-1">v2.0</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map(item => (
                        temPermissao(item.permissao) && (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'}
                `}
                            >
                                <span>{item.icon}</span>
                                <span className="flex-1">{item.label}</span>
                                {item.badge && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        )
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                            {userData.nome?.[0] || 'A'}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{userData.nome || 'Admin'}</p>
                            <p className="text-xs text-slate-400 capitalize">{userData.role || 'admin'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/admin/login'); }}
                        className="w-full text-left text-slate-400 hover:text-white text-sm"
                    >
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Painel Administrativo
                    </h2>
                </header>

                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;