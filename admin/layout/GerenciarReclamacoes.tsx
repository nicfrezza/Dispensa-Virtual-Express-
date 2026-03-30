import { useState, useEffect } from 'react';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    updateDoc,
    doc,
    serverTimestamp,
    where,
    addDoc
} from 'firebase/firestore';
import { db } from '../../src/lib/firebase/firebaseService';
import emailjs from '@emailjs/browser';
import { useAuth } from '../auth/auth'

type StatusReclamacao = 'aberto' | 'em_atendimento' | 'resolvido' | 'escalado';
type Prioridade = 'baixa' | 'media' | 'alta' | 'urgente';

interface Reclamacao {
    id: string;
    titulo: string;
    descricao: string;
    tipo: 'reclamacao' | 'suporte' | 'denuncia' | 'sugestao';
    status: StatusReclamacao;
    prioridade: Prioridade;
    nomeUsuario: string;
    emailUsuario: string;
    telefoneUsuario?: string;
    empresaId?: string;
    empresaNome?: string;
    criadoEm: any;
    atualizadoEm: any;
    atribuidoA?: string;
    respostas: Resposta[];
}

interface Resposta {
    id: string;
    autor: string;
    autorId: string;
    mensagem: string;
    data: any;
    interna: boolean; // true = visível só para admins
    enviadaPorEmail: boolean;
}

const GerenciarReclamacoes = () => {
    const { userData } = useAuth();
    const [reclamacoes, setReclamacoes] = useState<Reclamacao[]>([]);
    const [filtroStatus, setFiltroStatus] = useState<StatusReclamacao | 'todos'>('todos');
    const [filtroPrioridade, setFiltroPrioridade] = useState<Prioridade | 'todas'>('todas');
    const [busca, setBusca] = useState('');
    const [reclamacaoSelecionada, setReclamacaoSelecionada] = useState<Reclamacao | null>(null);

    // Modal de resposta
    const [modalAberto, setModalAberto] = useState(false);
    const [resposta, setResposta] = useState('');
    const [enviarEmail, setEnviarEmail] = useState(true);
    const [marcarResolvido, setMarcarResolvido] = useState(false);
    const [isEnviando, setIsEnviando] = useState(false);

    const EMAILJS_CONFIG = {
        serviceId: 'service_cj1d5y8',
        templateId: 'template_03xaqjw',
        publicKey: 'LhIlRkQY8ycYTMSCe',
        templateParams: {
            to_email: '',
            to_name: '',
            from_name: 'Suporte Marketplace',
            reply_to: 'suporte@dispensaexpress.com',
            subject: '',
            message: ''
        }
    };

    useEffect(() => {
        const q = query(
            collection(db, 'reclamacoes'),
            orderBy('dataCriacao', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const dados = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Reclamacao[];
            setReclamacoes(dados);
        });

        return () => unsubscribe();
    }, []);

    const filtrarReclamacoes = () => {
        return reclamacoes.filter(rec => {
            const matchStatus = filtroStatus === 'todos' || rec.status === filtroStatus;
            const matchPrioridade = filtroPrioridade === 'todas' || rec.prioridade === filtroPrioridade;
            const matchBusca = !busca ||
                rec.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                rec.nomeUsuario.toLowerCase().includes(busca.toLowerCase()) ||
                rec.emailUsuario.toLowerCase().includes(busca.toLowerCase());
            return matchStatus && matchPrioridade && matchBusca;
        });
    };

    const atribuirParaMim = async (reclamacaoId: string) => {
        await updateDoc(doc(db, 'reclamacoes', reclamacaoId), {
            atribuidoA: userData?.uid,
            status: 'em_atendimento',
            atualizadoEm: serverTimestamp()
        });
    };

    const enviarResposta = async () => {
        if (!reclamacaoSelecionada || !resposta.trim()) return;

        setIsEnviando(true);

        try {
            const ref = doc(db, 'reclamacoes', reclamacaoSelecionada.id);

            const novaResposta = [
                ...(reclamacaoSelecionada.respostas || []),
                {
                    id: Date.now().toString(),
                    autor: userData?.nome || 'Atendente',
                    autorId: userData?.uid,
                    mensagem: resposta,
                    data: new Date().toISOString(), // ✅ String ISO
                    interna: false,
                    enviadaPorEmail: enviarEmail
                }
            ];

            // 1. Atualizar Firestore
            await updateDoc(ref, {
                respostas: novaResposta,
                status: marcarResolvido ? 'resolvido' : 'em_atendimento',
                atualizadoEm: serverTimestamp()
            });

            // 2. Enviar email se marcado
            if (enviarEmail) {
                await emailjs.send(
                    EMAILJS_CONFIG.serviceId,
                    EMAILJS_CONFIG.templateId,
                    {
                        to_email: reclamacaoSelecionada.emailUsuario,
                        to_name: reclamacaoSelecionada.nomeUsuario,
                        from_name: 'Suporte Marketplace',
                        reply_to: 'suporte@suaempresa.com',
                        subject: `Resposta: ${reclamacaoSelecionada.titulo}`,
                        message: resposta,
                        numero_protocolo: reclamacaoSelecionada.id.slice(-6).toUpperCase()
                    },
                    EMAILJS_CONFIG.publicKey
                );
            }

            // Limpar e fechar
            setResposta('');
            setModalAberto(false);
            setReclamacaoSelecionada(null);

            alert('Resposta enviada com sucesso!');

        } catch (error) {
            console.error('Erro ao enviar resposta:', error);
            alert('Erro ao enviar resposta. Tente novamente.');
        } finally {
            setIsEnviando(false);
        }
    };

    const getCorPrioridade = (prioridade: Prioridade) => {
        const cores = {
            baixa: 'bg-gray-100 text-gray-800',
            media: 'bg-blue-100 text-blue-800',
            alta: 'bg-orange-100 text-orange-800',
            urgente: 'bg-red-100 text-red-800 animate-pulse'
        };
        return cores[prioridade];
    };

    const getCorStatus = (status: StatusReclamacao) => {
        const cores = {
            aberto: 'bg-yellow-100 text-yellow-800',
            em_atendimento: 'bg-blue-100 text-blue-800',
            resolvido: 'bg-green-100 text-green-800',
            escalado: 'bg-purple-100 text-purple-800'
        };
        return cores[status];
    };

    const stats = {
        total: reclamacoes.length,
        abertos: reclamacoes.filter(r => r.status === 'aberto').length,
        emAtendimento: reclamacoes.filter(r => r.status === 'em_atendimento').length,
        urgentes: reclamacoes.filter(r => r.prioridade === 'urgente' && r.status !== 'resolvido').length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gerenciar Reclamações</h2>
                    <p className="text-gray-600">Atendimento ao cliente e suporte</p>
                </div>
                <button
                    onClick={() => {/* Exportar relatório */ }}
                    className="bg-emerald-600 text-black px-4 py-2 rounded-lg hover:bg-emerald-700"
                >
                    📊 Exportar Relatório
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard titulo="Total" valor={stats.total} cor="gray" icone="📋" />
                <StatCard titulo="Abertos" valor={stats.abertos} cor="yellow" icone="📥" />
                <StatCard titulo="Em Atendimento" valor={stats.emAtendimento} cor="blue" icone="🔧" />
                <StatCard titulo="Urgentes" valor={stats.urgentes} cor="red" icone="🚨" />
            </div>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4">
                <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value as any)}
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="todos">Todos os status</option>
                    <option value="aberto">Aberto</option>
                    <option value="em_atendimento">Em Atendimento</option>
                    <option value="resolvido">Resolvido</option>
                    <option value="escalado">Escalado</option>
                </select>

                <select
                    value={filtroPrioridade}
                    onChange={(e) => setFiltroPrioridade(e.target.value as any)}
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="todas">Todas as prioridades</option>
                    <option value="urgente">🔴 Urgente</option>
                    <option value="alta">🟠 Alta</option>
                    <option value="media">🔵 Média</option>
                    <option value="baixa">⚪ Baixa</option>
                </select>

                <input
                    type="text"
                    placeholder="Buscar por título, cliente ou email..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="flex-1 min-w-[300px] border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500"
                />
            </div>

            {/* Lista de Reclamações */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Protocolo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assunto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridade</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filtrarReclamacoes().map((rec) => (
                            <tr key={rec.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono text-sm text-gray-600">
                                    #{rec.id.slice(-6).toUpperCase()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{rec.nomeUsuario}</div>
                                    <div className="text-sm text-gray-500">{rec.emailUsuario}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{rec.titulo}</div>
                                    <div className="text-sm text-gray-500 capitalize">{rec.tipo}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCorPrioridade(rec.prioridade)}`}>
                                        {rec.prioridade}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCorStatus(rec.status)}`}>
                                        {rec.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {rec.criadoEm?.toDate?.().toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setReclamacaoSelecionada(rec);
                                                setModalAberto(true);
                                            }}
                                            className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                                        >
                                            Responder
                                        </button>

                                        {!rec.atribuidoA && rec.status === 'aberto' && (
                                            <button
                                                onClick={() => atribuirParaMim(rec.id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Atribuir
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filtrarReclamacoes().length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Nenhuma reclamação encontrada
                    </div>
                )}
            </div>

            {/* Modal de Resposta */}
            {modalAberto && reclamacaoSelecionada && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Responder Reclamação</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Protocolo: #{reclamacaoSelecionada.id.slice(-6).toUpperCase()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setModalAberto(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Dados do cliente */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-2">Dados do Cliente</h4>
                                <p><strong>Nome:</strong> {reclamacaoSelecionada.nomeUsuario}</p>
                                <p><strong>Email:</strong> {reclamacaoSelecionada.emailUsuario}</p>
                                {reclamacaoSelecionada.telefoneUsuario && (
                                    <p><strong>Telefone:</strong> {reclamacaoSelecionada.telefoneUsuario}</p>
                                )}
                                {reclamacaoSelecionada.empresaNome && (
                                    <p><strong>Empresa:</strong> {reclamacaoSelecionada.empresaNome}</p>
                                )}
                            </div>

                            {/* Histórico da reclamação */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Histórico</h4>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-amber-800 font-medium mb-1">
                                        {reclamacaoSelecionada.titulo}
                                    </p>
                                    <p className="text-sm text-amber-700">
                                        {reclamacaoSelecionada.descricao}
                                    </p>
                                    <p className="text-xs text-amber-600 mt-2">
                                        Enviado em: {reclamacaoSelecionada.criadoEm?.toDate?.().toLocaleString('pt-BR')}
                                    </p>
                                </div>

                                {/* Respostas anteriores */}
                                {reclamacaoSelecionada.respostas?.filter(r => !r.interna).map((resp, idx) => (
                                    <div key={idx} className={`p-4 rounded-lg mb-2 ${resp.autorId === userData?.uid ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'
                                        }`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-medium text-sm">{resp.autor}</span>
                                            <span className="text-xs text-gray-500">
                                                {resp.data?.toDate?.().toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700">{resp.mensagem}</p>
                                        {resp.enviadaPorEmail && (
                                            <span className="text-xs text-emerald-600 mt-1 block">✓ Enviada por email</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Formulário de resposta */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sua Resposta
                                </label>
                                <textarea
                                    value={resposta}
                                    onChange={(e) => setResposta(e.target.value)}
                                    rows={5}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                                    placeholder="Digite sua resposta ao cliente..."
                                />
                            </div>

                            {/* Opções */}
                            <div className="flex flex-col gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={enviarEmail}
                                        onChange={(e) => setEnviarEmail(e.target.checked)}
                                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        📧 Enviar resposta por email para {reclamacaoSelecionada.emailUsuario}
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={marcarResolvido}
                                        onChange={(e) => setMarcarResolvido(e.target.checked)}
                                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        ✅ Marcar como resolvido após enviar
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setModalAberto(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={enviarResposta}
                                disabled={!resposta.trim() || isEnviando}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isEnviando ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        📤 Enviar Resposta
                                        {enviarEmail && ' + Email'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente auxiliar
const StatCard = ({ titulo, valor, cor, icone }: any) => {
    const cores = {
        gray: 'bg-gray-50 border-gray-200',
        yellow: 'bg-yellow-50 border-yellow-200',
        blue: 'bg-blue-50 border-blue-200',
        red: 'bg-red-50 border-red-200'
    };

    return (
        <div className={`${cores[cor as keyof typeof cores]} border rounded-lg p-4`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">{titulo}</p>
                    <p className="text-2xl font-bold text-gray-900">{valor}</p>
                </div>
                <span className="text-2xl">{icone}</span>
            </div>
        </div>
    );
};

export default GerenciarReclamacoes;