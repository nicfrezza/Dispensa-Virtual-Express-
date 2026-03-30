import { useState, useEffect } from 'react';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    updateDoc,
    doc,
    serverTimestamp,
    deleteDoc,
    setDoc,
    addDoc
} from 'firebase/firestore';
import { db } from '../../src/lib/firebase/firebaseService';
import { useAuth } from '../auth/auth';


const GerenciarSolicitacoes = () => {
    const { userData } = useAuth();
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState('todos');

    const [modalAberto, setModalAberto] = useState(false);
    const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
    const [modoEdicao, setModoEdicao] = useState(false);

    const [formEdicao, setFormEdicao] = useState({
        nomeEmpresa: '',
        cnpj: '',
        email: '',
        telefone: '',
        tipoProduto: '',
        endereco: '',
        cidade: '',
        estado: '',
        status: '',
        observacao: ''
    });

    const [observacaoStatus, setObservacaoStatus] = useState('');

    useEffect(() => {
        const q = query(
            collection(db, 'solicitacoes'),
            orderBy('dataCriacao', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const dados = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSolicitacoes(dados);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const abrirModal = (sol: any, editar = false) => {
        setSolicitacaoSelecionada(sol);
        setModoEdicao(editar);
        setObservacaoStatus('');

        const dados = sol.dadosEmpresa || sol;
        setFormEdicao({
            nomeEmpresa: dados.nomeEmpresa || '',
            cnpj: dados.cnpj || '',
            email: dados.email || '',
            telefone: dados.telefone || '',
            tipoProduto: dados.tipoProduto || '',
            endereco: dados.endereco || '',
            cidade: dados.cidade || '',
            estado: dados.estado || '',
            status: sol.status || 'pendente',
            observacao: ''
        });

        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setSolicitacaoSelecionada(null);
        setModoEdicao(false);
        setObservacaoStatus('');
    };

    const salvarEdicao = async () => {
        if (!solicitacaoSelecionada) return;

        try {
            const ref = doc(db, 'solicitacoes', solicitacaoSelecionada.id);

            // ✅ CORREÇÃO: Usar string de data em vez de serverTimestamp() no array
            const novoHistorico = [
                ...(solicitacaoSelecionada.historico || []),
                {
                    acao: 'editado',
                    data: new Date().toISOString(), // ✅ String ISO
                    usuario: userData?.nome || 'Admin',
                    observacao: 'Dados da empresa atualizados'
                }
            ];

            await updateDoc(ref, {
                dadosEmpresa: {
                    nomeEmpresa: formEdicao.nomeEmpresa,
                    cnpj: formEdicao.cnpj,
                    email: formEdicao.email,
                    telefone: formEdicao.telefone,
                    tipoProduto: formEdicao.tipoProduto,
                    endereco: formEdicao.endereco,
                    cidade: formEdicao.cidade,
                    estado: formEdicao.estado
                },
                historico: novoHistorico,
                atualizadoEm: serverTimestamp() // ✅ Fora do array, funciona normal
            });

            alert('Solicitação atualizada com sucesso!');
            fecharModal();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar edição');
        }
    };

    const atualizarStatus = async (novoStatus: 'aprovado' | 'rejeitado' | 'em_analise' | 'pendente') => {
        if (!solicitacaoSelecionada) return;

        if ((novoStatus === 'aprovado' || novoStatus === 'rejeitado') && !observacaoStatus.trim()) {
            alert('Por favor, adicione uma observação para ' + novoStatus);
            return;
        }

        try {
            const ref = doc(db, 'solicitacoes', solicitacaoSelecionada.id);

            const novoHistorico = [
                ...(solicitacaoSelecionada.historico || []),
                {
                    acao: novoStatus,
                    data: new Date().toISOString(),
                    usuario: userData?.nome || 'Admin',
                    observacao: observacaoStatus || `Status alterado para ${novoStatus}`
                }
            ];

            // Atualizar solicitação
            await updateDoc(ref, {
                status: novoStatus,
                historico: novoHistorico,
                atualizadoEm: serverTimestamp(),
                analisadoPor: userData?.uid,
                analisadoEm: serverTimestamp()
            });

            // ✅ SE FOI APROVADO, CRIAR VENDEDOR
            if (novoStatus === 'aprovado') {
                try {
                    const vendedorId = await criarVendedor(solicitacaoSelecionada);
                    alert(`Solicitação aprovada! Vendedor criado com ID: ${vendedorId}`);
                } catch (error) {
                    alert('Status atualizado, mas erro ao criar vendedor. Verifique manualmente.');
                }
            } else {
                alert(`Solicitação ${novoStatus} com sucesso!`);
            }

            fecharModal();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Erro ao atualizar status: ' + error.message);
        }
    };


    const criarVendedor = async (solicitacoes: any) => {
        // Implementação para criar vendedor
        try {
            const dados = solicitacoes.dadosEmpresa || solicitacoes;

            const vendedorData = {
                nomeEmpresa: dados.nomeEmpresa,
                cnpj: dados.cnpj,
                tipoProduto: dados.tipoProduto,
                descricao: dados.descricao || '',

                // dados responsável 
                nomeEmpresa: dados.nomeEmpresa,
                email: dados.email,
                telefone: dados.telefone,

                // endereco 

                endereco: {
                    rua: dados.endereco,
                    cidade: dados.cidade,
                    estado: dados.estado,
                    cep: dados.cep || ''
                },

                // vinculação 

                userId: solicitacoes.userId || null,
                solicitacoesId: solicitacoes.id || null,

                // STATUS e datas 
                status: 'ativo',
                criadoEm: serverTimestamp(),
                aprovadoEm: serverTimestamp(),
                aprovadorPor: userData?.uid || null,

                // INICIALICAÇÃO 
                avalaicao: 0,
                totalVendas: 0,
                produtos: [],
                logo: null

            };



            // Usar setDoc com o mesmo ID da solicitação ou addDoc para novo ID
            const vendedorRef = doc(collection(db, 'vendedores'));
            await setDoc(vendedorRef, vendedorData);

            console.log('✅ Vendedor criado com ID:', vendedorRef.id);
            return vendedorRef.id;

        } catch (error) {
            console.error('❌ Erro ao criar vendedor:', error);
            throw error;
        }
    };


    const excluirSolicitacao = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta solicitação?')) return;

        try {
            await deleteDoc(doc(db, 'solicitacoes', id));
            alert('Solicitação excluída');
        } catch (error) {
            console.error('Erro ao excluir:', error);
        }
    };


    const filtrarSolicitacoes = () => {
        if (filtroStatus === 'todos') return solicitacoes;
        return solicitacoes.filter(s => s.status === filtroStatus);
    };

    const getDadosEmpresa = (sol: any) => {
        if (sol.dadosEmpresa) {
            return {
                nome: sol.dadosEmpresa.nomeEmpresa || 'N/A',
                email: sol.dadosEmpresa.email || '-',
                telefone: sol.dadosEmpresa.telefone || '-',
                tipo: sol.dadosEmpresa.tipoProduto || '-',
                cidade: sol.dadosEmpresa.cidade || '-',
                estado: sol.dadosEmpresa.estado || '-'
            };
        }
        return {
            nome: sol.nomeEmpresa || 'N/A',
            email: sol.email || '-',
            telefone: sol.telefone || '-',
            tipo: sol.tipoProduto || '-',
            cidade: sol.cidade || '-',
            estado: sol.estado || '-'
        };
    };

    const stats = {
        total: solicitacoes.length,
        pendentes: solicitacoes.filter(s => s.status === 'pendente').length,
        emAnalise: solicitacoes.filter(s => s.status === 'em_analise').length,
        aprovadas: solicitacoes.filter(s => s.status === 'aprovado').length,
        rejeitadas: solicitacoes.filter(s => s.status === 'rejeitado').length
    };

    if (loading) return <div className="p-8">Carregando...</div>;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gerenciar Solicitações</h2>
                    <p className="text-gray-600">Aprovação de cadastros de vendedores</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard titulo="Total" valor={stats.total} cor="gray" />
                <StatCard titulo="Pendentes" valor={stats.pendentes} cor="yellow" />
                <StatCard titulo="Em Análise" valor={stats.emAnalise} cor="blue" />
                <StatCard titulo="Aprovadas" valor={stats.aprovadas} cor="green" />
                <StatCard titulo="Rejeitadas" valor={stats.rejeitadas} cor="red" />
            </div>

            {/* Filtros */}
            <div className="flex gap-2 flex-wrap">
                {['todos', 'pendente', 'em_analise', 'aprovado', 'rejeitado'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFiltroStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm capitalize ${filtroStatus === status
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Protocolo</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filtrarSolicitacoes().map((sol) => {
                            const dados = getDadosEmpresa(sol);
                            return (
                                <tr key={sol.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-sm text-gray-600">
                                        #{sol.id.slice(-6).toUpperCase()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">{dados.nome}</div>
                                        <div className="text-sm text-gray-500">{dados.cidade}/{dados.estado}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div>{dados.email}</div>
                                        <div className="text-gray-500">{dados.telefone}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">
                                            {dados.tipo}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={sol.status} />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {sol.dataCriacao?.toDate?.().toLocaleDateString('pt-BR') || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => abrirModal(sol, false)}
                                                className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                                            >
                                                Analisar
                                            </button>
                                            <button
                                                onClick={() => abrirModal(sol, true)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => excluirSolicitacao(sol.id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modalAberto && solicitacaoSelecionada && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">

                        <div className="p-6 border-b bg-gray-50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {modoEdicao ? 'Editar Solicitação' : 'Analisar Solicitação'}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Protocolo: #{solicitacaoSelecionada.id.slice(-6).toUpperCase()}
                                    </p>
                                </div>
                                <button onClick={fecharModal} className="text-gray-400 hover:text-gray-600 text-2xl">
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">

                            {modoEdicao ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                                        <input
                                            type="text"
                                            value={formEdicao.nomeEmpresa}
                                            onChange={(e) => setFormEdicao({ ...formEdicao, nomeEmpresa: e.target.value })}
                                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                                        <input
                                            type="text"
                                            value={formEdicao.cnpj}
                                            onChange={(e) => setFormEdicao({ ...formEdicao, cnpj: e.target.value })}
                                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={formEdicao.email}
                                            onChange={(e) => setFormEdicao({ ...formEdicao, email: e.target.value })}
                                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                                        <input
                                            type="text"
                                            value={formEdicao.telefone}
                                            onChange={(e) => setFormEdicao({ ...formEdicao, telefone: e.target.value })}
                                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Produto</label>
                                        <select
                                            value={formEdicao.tipoProduto}
                                            onChange={(e) => setFormEdicao({ ...formEdicao, tipoProduto: e.target.value })}
                                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="alimentos">Alimentos</option>
                                            <option value="limpeza">Limpeza</option>
                                            <option value="ambos">Ambos</option>
                                            <option value="outros">Outros</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                                        <input
                                            type="text"
                                            value={formEdicao.endereco}
                                            onChange={(e) => setFormEdicao({ ...formEdicao, endereco: e.target.value })}
                                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                                        <input
                                            type="text"
                                            value={formEdicao.cidade}
                                            onChange={(e) => setFormEdicao({ ...formEdicao, cidade: e.target.value })}
                                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                        <input
                                            type="text"
                                            value={formEdicao.estado}
                                            onChange={(e) => setFormEdicao({ ...formEdicao, estado: e.target.value })}
                                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex gap-3 pt-4">
                                        <button
                                            onClick={salvarEdicao}
                                            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
                                        >
                                            💾 Salvar Alterações
                                        </button>
                                        <button
                                            onClick={() => setModoEdicao(false)}
                                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                        <div>
                                            <span className="text-sm text-gray-500">Empresa:</span>
                                            <p className="font-medium">{formEdicao.nomeEmpresa}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">CNPJ:</span>
                                            <p className="font-medium">{formEdicao.cnpj}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Email:</span>
                                            <p className="font-medium">{formEdicao.email}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Telefone:</span>
                                            <p className="font-medium">{formEdicao.telefone}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-sm text-gray-500">Endereço:</span>
                                            <p className="font-medium">{formEdicao.endereco}, {formEdicao.cidade} - {formEdicao.estado}</p>
                                        </div>
                                    </div>

                                    {solicitacaoSelecionada.historico?.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-2">Histórico</h4>
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {solicitacaoSelecionada.historico.map((item: any, idx: number) => (
                                                    <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                                                        <span className="font-medium capitalize">{item.acao}</span>
                                                        <span className="text-gray-500"> por {item.usuario || 'Sistema'}</span>
                                                        <span className="text-gray-400 text-xs ml-2">
                                                            {new Date(item.data).toLocaleString('pt-BR')}
                                                        </span>
                                                        <p className="text-gray-600 text-xs mt-1">{item.observacao}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Observação (obrigatória para aprovação/rejeição)
                                            </label>
                                            <textarea
                                                value={observacaoStatus}
                                                onChange={(e) => setObservacaoStatus(e.target.value)}
                                                placeholder="Descreva o motivo da aprovação, rejeição ou análise..."
                                                className="w-full border rounded-lg px-3 py-2 h-24 focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <button
                                                onClick={() => atualizarStatus('pendente')}
                                                disabled={formEdicao.status === 'pendente'}
                                                className="py-2 px-4 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 disabled:opacity-50"
                                            >
                                                ↩️ Pendente
                                            </button>
                                            <button
                                                onClick={() => atualizarStatus('em_analise')}
                                                disabled={formEdicao.status === 'em_analise'}
                                                className="py-2 px-4 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                                            >
                                                🔍 Análise
                                            </button>
                                            <button
                                                onClick={() => atualizarStatus('aprovado')}
                                                disabled={formEdicao.status === 'aprovado'}
                                                className="py-2 px-4 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50 font-medium"
                                            >
                                                ✅ Aprovar
                                            </button>
                                            <button
                                                onClick={() => atualizarStatus('rejeitado')}
                                                disabled={formEdicao.status === 'rejeitado'}
                                                className="py-2 px-4 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 disabled:opacity-50 font-medium"
                                            >
                                                ❌ Rejeitar
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ titulo, valor, cor }: any) => {
    const cores = {
        gray: 'bg-gray-100 text-gray-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        red: 'bg-red-100 text-red-800'
    };

    return (
        <div className={`${cores[cor]} rounded-lg p-4`}>
            <p className="text-sm opacity-80">{titulo}</p>
            <p className="text-2xl font-bold">{valor}</p>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const cores = {
        pendente: 'bg-yellow-100 text-yellow-800',
        em_analise: 'bg-blue-100 text-blue-800',
        aprovado: 'bg-green-100 text-green-800',
        rejeitado: 'bg-red-100 text-red-800'
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${cores[status] || 'bg-gray-100'}`}>
            {status?.replace('_', ' ') || 'pendente'}
        </span>
    );
};

export default GerenciarSolicitacoes;