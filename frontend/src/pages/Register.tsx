import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Phone, ArrowRight, Check } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simular cadastro
        await new Promise(resolve => setTimeout(resolve, 1500));

        localStorage.setItem('token', 'mock_token');
        navigate('/perfil');
    };

    const passwordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const strength = passwordStrength(formData.password);
    const strengthLabels = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-primary'];

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-dark mb-2">Criar conta</h1>
                    <p className="text-gray-500">Preencha seus dados para começar</p>
                </div>

                {/* Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    {[1, 2].map((s) => (
                        <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                            {s}
                        </div>
                    ))}
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {step === 1 ? (
                            <>
                                {/* Nome */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Nome completo</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="João Silva"
                                            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">E-mail</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="joao@email.com"
                                            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>

                                {/* Telefone */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Telefone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="(11) 99999-9999"
                                            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2"
                                >
                                    Continuar
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Senha */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {/* Força da senha */}
                                    <div className="mt-2">
                                        <div className="flex gap-1 h-1">
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`flex-1 rounded-full ${i < strength ? strengthColors[strength - 1] : 'bg-gray-200'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formData.password && strengthLabels[strength - 1]}
                                        </p>
                                    </div>
                                </div>

                                {/* Confirmar Senha */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Confirmar senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                        <p className="text-xs text-red-500 mt-1">As senhas não coincidem</p>
                                    )}
                                </div>

                                {/* Termos */}
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        required
                                        checked={formData.acceptTerms}
                                        onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                                        className="mt-1 rounded text-primary"
                                    />
                                    <span className="text-sm text-gray-600">
                                        Aceito os{' '}
                                        <Link to="/termos" className="text-primary hover:underline">Termos de Uso</Link>
                                        {' '}e{' '}
                                        <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
                                    </span>
                                </label>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 border rounded-xl font-medium hover:bg-gray-50"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || formData.password !== formData.confirmPassword}
                                        className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Criar conta
                                                <Check className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </div>

                {/* Login */}
                <p className="text-center mt-6 text-gray-600">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="text-primary font-semibold hover:underline">
                        Entrar
                    </Link>
                </p>
            </div>
        </div>
    );
}