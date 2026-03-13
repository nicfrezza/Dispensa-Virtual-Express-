import { useState } from 'react';
import { loginUser } from '../../lib/firebase/authService';
import { useNavigate } from 'react-router-dom';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Loader2,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

interface LoginProps {
    onSwitchToRegister?: () => void;
}

const Login = ({ onSwitchToRegister }: LoginProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            await loginUser(email, password);
            setSuccess(true);
            setTimeout(() => navigate('/'), 500);
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterClick = () => {
        if (onSwitchToRegister) {
            onSwitchToRegister();
        } else {
            navigate('/cadastro');
        }
    };

    // Validação visual do email
    const isEmailValid = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 6;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-secondary/5 p-4">
            {/* Card Principal */}
            <div className="w-full max-w-md">

                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg shadow-primary/25 mb-4">
                        <span className="text-3xl">🥬</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Bem-vindo de volta
                    </h1>
                    <p className="text-gray-500">
                        Entre para gerenciar sua dispensa
                    </p>
                </div>

                {/* Card do Formulário */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">

                    {/* Mensagem de Erro */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Mensagem de Sucesso */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <p className="text-sm text-green-600">Login realizado com sucesso!</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Campo Email */}
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-gray-700 flex items-center gap-2"
                            >
                                <Mail className="w-4 h-4 text-gray-400" />
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    className={`
                    w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200
                    ${isEmailValid
                                            ? 'border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                                            : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'
                                        }
                    ${loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
                    outline-none placeholder:text-gray-400
                  `}
                                />
                                {isEmailValid && (
                                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                )}
                            </div>
                        </div>

                        {/* Campo Senha */}
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-gray-700 flex items-center gap-2"
                            >
                                <Lock className="w-4 h-4 text-gray-400" />
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className={`
                    w-full px-4 py-3.5 pr-12 rounded-xl border-2 transition-all duration-200
                    ${isPasswordValid
                                            ? 'border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                                            : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'
                                        }
                    ${loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
                    outline-none placeholder:text-gray-400
                  `}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => navigate('/recuperar-senha')}
                                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>
                        </div>

                        {/* Botão de Submit */}
                        <button
                            type="submit"
                            disabled={loading || !isEmailValid || !isPasswordValid}
                            className={`
                w-full py-4 rounded-xl font-semibold text-red
                flex items-center justify-center gap-2
                transition-all duration-200
                ${loading || !isEmailValid || !isPasswordValid
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5'
                                }
              `}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    Entrar
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">ou</span>
                        </div>
                    </div>

                    {/* Login Social (opcional) */}
                    <button
                        type="button"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl border-2 border-gray-200 
                     flex items-center justify-center gap-3
                     text-gray-700 font-medium
                     hover:bg-gray-50 hover:border-gray-300
                     transition-all duration-200"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar com Google
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Não tem uma conta?{' '}
                        <button
                            type="button"
                            onClick={handleRegisterClick}
                            className="font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            Criar conta grátis
                        </button>
                    </p>
                </div>

                {/* Links de ajuda */}
                <div className="mt-8 flex justify-center gap-6 text-sm text-gray-400">
                    <button type="button" className="hover:text-gray-600 transition-colors">
                        Termos de uso
                    </button>
                    <button type="button" className="hover:text-gray-600 transition-colors">
                        Privacidade
                    </button>
                    <button type="button" className="hover:text-gray-600 transition-colors">
                        Ajuda
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;