import { useState } from 'react';
import { registerUser } from '../../lib/firebase/authService';
import { useNavigate, Link } from 'react-router-dom';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    UserPlus,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    ShieldCheck,
    Sparkles
} from 'lucide-react';

interface RegisterProps {
    onSwitchToLogin?: () => void;
}

const Register = ({ onSwitchToLogin }: RegisterProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    // Validações
    const isEmailValid = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const getPasswordStrength = () => {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (hasUpperCase) strength++;
        if (hasNumber) strength++;
        if (password.length >= 10) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength();
    const strengthLabels = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            await registerUser(email, password);
            setSuccess(true);
            setTimeout(() => navigate('/'), 1000);
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleLoginClick = () => {
        if (onSwitchToLogin) {
            onSwitchToLogin();
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/5 via-white to-primary/5 p-4">
            <div className="w-full max-w-md">

                {/* Botão Voltar */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-2xl shadow-lg shadow-secondary/25 mb-4">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Criar conta
                    </h1>
                    <p className="text-gray-500">
                        Comece a organizar sua dispensa hoje
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
                            <p className="text-sm text-green-600">Conta criada com sucesso! Redirecionando...</p>
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
                                    disabled={loading || success}
                                    className={`
                    w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200
                    ${isEmailValid
                                            ? 'border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                                            : 'border-gray-200 focus:border-secondary focus:ring-4 focus:ring-secondary/10'
                                        }
                    ${loading || success ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
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
                                    disabled={loading || success}
                                    className={`
                    w-full px-4 py-3.5 pr-12 rounded-xl border-2 transition-all duration-200
                    ${isPasswordValid
                                            ? 'border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                                            : 'border-gray-200 focus:border-secondary focus:ring-4 focus:ring-secondary/10'
                                        }
                    ${loading || success ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
                    outline-none placeholder:text-gray-400
                  `}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading || success}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Força da Senha */}
                            {password.length > 0 && (
                                <div className="space-y-2 pt-1">
                                    <div className="flex gap-1 h-1.5">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`flex-1 rounded-full transition-all duration-300 ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">
                                            Força: <span className={passwordStrength > 2 ? 'text-green-600 font-medium' : 'text-gray-600'}>
                                                {strengthLabels[passwordStrength - 1] || 'Muito fraca'}
                                            </span>
                                        </span>
                                        <span className="text-gray-400">{password.length} caracteres</span>
                                    </div>

                                    {/* Requisitos */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${password.length >= 6 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {password.length >= 6 ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-current" />}
                                            6+ chars
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${hasUpperCase ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {hasUpperCase ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-current" />}
                                            A-Z
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${hasNumber ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {hasNumber ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-current" />}
                                            0-9
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Campo Confirmar Senha */}
                        <div className="space-y-2">
                            <label
                                htmlFor="confirmPassword"
                                className="text-sm font-medium text-gray-700 flex items-center gap-2"
                            >
                                <ShieldCheck className="w-4 h-4 text-gray-400" />
                                Confirmar Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading || success}
                                    className={`
                    w-full px-4 py-3.5 pr-12 rounded-xl border-2 transition-all duration-200
                    ${passwordsMatch
                                            ? 'border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                                            : confirmPassword.length > 0
                                                ? 'border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                                : 'border-gray-200 focus:border-secondary focus:ring-4 focus:ring-secondary/10'
                                        }
                    ${loading || success ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
                    outline-none placeholder:text-gray-400
                  `}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={loading || success}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {confirmPassword.length > 0 && !passwordsMatch && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    As senhas não coincidem
                                </p>
                            )}
                        </div>

                        {/* Botão de Submit */}
                        <button
                            type="submit"
                            disabled={loading || success || !isEmailValid || !isPasswordValid || !passwordsMatch}
                            className={`
                w-full py-4 rounded-xl font-semibold text-white
                flex items-center justify-center gap-2
                transition-all duration-200
                ${loading || success || !isEmailValid || !isPasswordValid || !passwordsMatch
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-secondary hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/25 hover:-translate-y-0.5'
                                }
              `}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Criando conta...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Conta criada!
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Criar conta grátis
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

                    {/* Login Social */}
                    <button
                        type="button"
                        disabled={loading || success}
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

                {/* Footer - CORRIGIDO AQUI */}
                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Já tem uma conta?{' '}
                        <button
                            type="button"
                            onClick={handleLoginClick}
                            className="font-semibold text-secondary hover:text-secondary/80 transition-colors"
                        >
                            Fazer login
                        </button>
                    </p>
                </div>

                {/* Links de ajuda */}
                <div className="mt-8 flex justify-center gap-6 text-sm text-gray-400">
                    <Link to="/termos" className="hover:text-gray-600 transition-colors">
                        Termos de uso
                    </Link>
                    <Link to="/privacidade" className="hover:text-gray-600 transition-colors">
                        Privacidade
                    </Link>
                    <Link to="/ajuda" className="hover:text-gray-600 transition-colors">
                        Ajuda
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;