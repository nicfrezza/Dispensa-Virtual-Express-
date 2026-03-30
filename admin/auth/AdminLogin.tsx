import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../src/lib/firebase/firebaseService';
import { auth } from '../../src/lib/firebase/authService';
import { validarCodigoAcesso } from './codigoAcesso';

import { User } from 'firebase/auth';

type ModoTela = 'login' | 'cadastro' | 'recuperar';

interface NovoAdminData {
    nome: string;
    email: string;
    senha: string;
    confirmarSenha: string;
    codigoAcesso: string;
    role: 'admin' | 'gerente' | 'analista';
}

const AdminLogin = () => {
    const navigate = useNavigate();
    const [modo, setModo] = useState<ModoTela>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

    // Login
    const [loginData, setLoginData] = useState({ email: '', senha: '' });

    // Cadastro
    const [novoAdmin, setNovoAdmin] = useState<NovoAdminData>({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        codigoAcesso: '',
        role: 'analista'
    });

    // Verificar se já está logado
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'usuarios_admin', user.uid));
                if (userDoc.exists()) {
                    navigate('/admin');
                }
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMensagem({ tipo: '', texto: '' });

        try {
            await signInWithEmailAndPassword(auth, loginData.email, loginData.senha);
            navigate('/admin');
        } catch (error: any) {
            let erroMsg = 'Erro ao fazer login';
            if (error.code === 'auth/user-not-found') erroMsg = 'Usuário não encontrado';
            if (error.code === 'auth/wrong-password') erroMsg = 'Senha incorreta';
            if (error.code === 'auth/invalid-email') erroMsg = 'Email inválido';
            setMensagem({ tipo: 'erro', texto: erroMsg });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCadastro = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMensagem({ tipo: '', texto: '' });

        // Validações básicas...
        if (novoAdmin.senha !== novoAdmin.confirmarSenha) {
            setMensagem({ tipo: 'erro', texto: 'As senhas não coincidem' });
            setIsLoading(false);
            return;
        }

        const resultado = await validarCodigoAcesso(novoAdmin.codigoAcesso);

        if (!resultado.valido) {
            setMensagem({ tipo: 'erro', texto: resultado.erro || 'Código inválido' });
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                novoAdmin.email,
                novoAdmin.senha
            );

            await setDoc(doc(db, 'usuarios_admin', userCredential.user.uid), {
                uid: userCredential.user.uid,
                nome: novoAdmin.nome,
                email: novoAdmin.email,
                role: resultado.tipo || novoAdmin.role, // Usa o tipo do código ou o selecionado
                permissoes: definirPermissoesPorRole(resultado.tipo || novoAdmin.role),
                ativo: true,
                criadoEm: serverTimestamp(),
                ultimoAcesso: serverTimestamp(),
                codigoAcessoUsado: novoAdmin.codigoAcesso // Auditoria
            });

            // Criar documento no Firestore
            await setDoc(doc(db, 'usuarios_admin', userCredential.user.uid), {
                uid: userCredential.user.uid,
                nome: novoAdmin.nome,
                email: novoAdmin.email,
                role: novoAdmin.role,
                permissoes: definirPermissoesPorRole(novoAdmin.role),
                ativo: true,
                criadoEm: serverTimestamp(),
                ultimoAcesso: serverTimestamp(),
                criadoPor: 'self_registration' // ou ID do admin que criou
            });

            setMensagem({
                tipo: 'sucesso',
                texto: 'Conta criada com sucesso! Redirecionando...'
            });

            setTimeout(() => navigate('/admin'), 1500);

        } catch (error: any) {
            let erroMsg = 'Erro ao criar conta';
            if (error.code === 'auth/email-already-in-use') erroMsg = 'Email já cadastrado';
            if (error.code === 'auth/invalid-email') erroMsg = 'Email inválido';
            setMensagem({ tipo: 'erro', texto: erroMsg });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecuperarSenha = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await sendPasswordResetEmail(auth, loginData.email);
            setMensagem({
                tipo: 'sucesso',
                texto: 'Email de recuperação enviado! Verifique sua caixa de entrada.'
            });
        } catch (error) {
            setMensagem({ tipo: 'erro', texto: 'Erro ao enviar email de recuperação' });
        } finally {
            setIsLoading(false);
        }
    };

    const definirPermissoesPorRole = (role: string): string[] => {
        const permissoesBase = ['solicitacoes_visualizar'];

        switch (role) {
            case 'admin':
                return [
                    ...permissoesBase,
                    'solicitacoes_aprovar',
                    'solicitacoes_rejeitar',
                    'reclamacoes_responder',
                    'usuarios_gerenciar',
                    'relatorios_visualizar',
                    'configuracoes_gerenciar'
                ];
            case 'gerente':
                return [
                    ...permissoesBase,
                    'solicitacoes_aprovar',
                    'solicitacoes_rejeitar',
                    'reclamacoes_responder',
                    'relatorios_visualizar'
                ];
            case 'analista':
            default:
                return [
                    ...permissoesBase,
                    'solicitacoes_aprovar',
                    'reclamacoes_responder'
                ];
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-emerald-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
                    <p className="text-slate-400">Gerenciamento de Vendedores</p>
                </div>

                {/* Card Principal */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => { setModo('login'); setMensagem({ tipo: '', texto: '' }); }}
                            className={`flex-1 py-4 text-sm font-medium transition-colors ${modo === 'login'
                                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => { setModo('cadastro'); setMensagem({ tipo: '', texto: '' }); }}
                            className={`flex-1 py-4 text-sm font-medium transition-colors ${modo === 'cadastro'
                                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Criar Conta
                        </button>
                    </div>

                    <div className="p-8">

                        {/* Mensagens */}
                        {mensagem.texto && (
                            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${mensagem.tipo === 'erro' ? 'bg-red-50 text-red-700 border border-red-200' :
                                'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                {mensagem.tipo === 'erro' ? '⚠️' : '✅'}
                                <span className="text-sm font-medium">{mensagem.texto}</span>
                            </div>
                        )}

                        {/* Formulário de Login */}
                        {modo === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={loginData.email}
                                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        placeholder="admin@empresa.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Senha
                                    </label>
                                    <input
                                        type="password"
                                        value={loginData.senha}
                                        onChange={(e) => setLoginData({ ...loginData, senha: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 text-gray-600">
                                        <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                        Lembrar-me
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setModo('recuperar')}
                                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                                    >
                                        Esqueceu a senha?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Entrando...
                                        </>
                                    ) : (
                                        'Entrar no Sistema'
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Formulário de Cadastro */}
                        {modo === 'cadastro' && (
                            <form onSubmit={handleCadastro} className="space-y-4">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-amber-800 flex items-start gap-2">
                                        <span className="text-lg">🔒</span>
                                        <span>
                                            <strong>Código de Acesso necessário.</strong>
                                            Solicite ao administrador principal ou entre em contato com o suporte.
                                        </span>
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={novoAdmin.nome}
                                        onChange={(e) => setNovoAdmin({ ...novoAdmin, nome: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="Seu nome"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={novoAdmin.email}
                                        onChange={(e) => setNovoAdmin({ ...novoAdmin, email: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="seu@email.com"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Senha
                                        </label>
                                        <input
                                            type="password"
                                            value={novoAdmin.senha}
                                            onChange={(e) => setNovoAdmin({ ...novoAdmin, senha: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                            placeholder="Mín. 6 caracteres"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirmar Senha
                                        </label>
                                        <input
                                            type="password"
                                            value={novoAdmin.confirmarSenha}
                                            onChange={(e) => setNovoAdmin({ ...novoAdmin, confirmarSenha: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                            placeholder="Repita a senha"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de Acesso
                                    </label>
                                    <select
                                        value={novoAdmin.role}
                                        onChange={(e) => setNovoAdmin({ ...novoAdmin, role: e.target.value as any })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                                    >
                                        <option value="analista">Analista (Aprova cadastros)</option>
                                        <option value="gerente">Gerente (Acesso total exceto usuários)</option>
                                        <option value="admin">Administrador (Acesso completo)</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        * Apenas administradores podem criar outros admins
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Código de Acesso
                                    </label>
                                    <input
                                        type="password"
                                        value={novoAdmin.codigoAcesso}
                                        onChange={(e) => setNovoAdmin({ ...novoAdmin, codigoAcesso: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="Código fornecido pelo admin"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Criando conta...
                                        </>
                                    ) : (
                                        'Criar Conta de Administrador'
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Recuperar Senha */}
                        {modo === 'recuperar' && (
                            <form onSubmit={handleRecuperarSenha} className="space-y-5">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-2xl">📧</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Recuperar Senha</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Digite seu email para receber instruções
                                    </p>
                                </div>

                                <input
                                    type="email"
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    placeholder="seu@email.com"
                                    required
                                />

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50"
                                >
                                    {isLoading ? 'Enviando...' : 'Enviar Email de Recuperação'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setModo('login')}
                                    className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium"
                                >
                                    ← Voltar para o login
                                </button>
                            </form>
                        )}

                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-400 text-sm mt-8">
                    © 2024 Sistema de Gerenciamento. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;