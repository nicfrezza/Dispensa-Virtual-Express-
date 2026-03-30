import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    collection,
    query,
    where,
    onSnapshot,
    getDocs,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from '../../lib/firebase/config/firebaseService';
import { auth } from '../../lib/firebase/config/authService';
import { onAuthStateChanged } from 'firebase/auth';


import {
    Package,
    ShoppingCart,
    TrendingUp,
    DollarSign,
    Plus,
    Eye,
    Star,
    AlertCircle,
    ChevronRight,
    BarChart3,
    Users
} from 'lucide-react';

const PainelVendedor = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        totalProdutos: 0,
        produtosAtivos: 0,
        produtosEsgotados: 0,
        totalPedidos: 0,
        pedidosPendentes: 0,
        faturamentoTotal: 0,
        avaliacaoMedia: 0
    });

    const [produtosRecentes, setProdutosRecentes] = useState<any[]>([]);
    const [pedidosRecentes, setPedidosRecentes] = useState<any[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                carregarDados(currentUser.uid);
            } else {
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const carregarDados = async (userId: string) => {
        setLoading(true);

        try {
            const qProdutos = query(
                collection(db, 'products'),
                where('vendedorId', '==', userId)
            );

            const unsubscribeProdutos = onSnapshot(qProdutos, (snapshot) => {
                const produtos = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const ativos = produtos.filter((p: any) => p.ativo && p.stock > 0).length;
                const esgotados = produtos.filter((p: any) => p.stock === 0).length;

                setStats(prev => ({
                    ...prev,
                    totalProdutos: produtos.length,
                    produtosAtivos: ativos,
                    produtosEsgotados: esgotados
                }));

                setProdutosRecentes(produtos.slice(0, 5));
            });

            const qPedidos = query(
                collection(db, 'orders'),
                where('vendedorId', '==', userId),
                orderBy('criadoEm', 'desc'),
                limit(5)
            );

            try {
                const snapPedidos = await getDocs(qPedidos);
                const pedidos = snapPedidos.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPedidosRecentes(pedidos);

                const pendentes = pedidos.filter((p: any) => p.status === 'pendente').length;
                const faturamento = pedidos.reduce((acc: number, p: any) => acc + (p.total || 0), 0);

                setStats(prev => ({
                    ...prev,
                    totalPedidos: pedidos.length,
                    pedidosPendentes: pendentes,
                    faturamentoTotal: faturamento
                }));
            } catch (e) {
                console.log('Pedidos ainda não configurados');
            }

            return () => {
                unsubscribeProdutos();
            };

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatarPreco = (preco: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(preco);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Painel do Vendedor</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Bem-vindo, {user?.displayName || 'Vendedor'}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/vendedor/cadastrar-produto')}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            Novo Produto
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                    <StatCard
                        titulo="Meus Produtos"
                        valor={stats.totalProdutos}
                        subtitulo={`${stats.produtosAtivos} ativos • ${stats.produtosEsgotados} esgotados`}
                        icone={Package}
                        cor="emerald"
                        onClick={() => navigate('/vendedor/meus-produtos')}
                    />

                    <StatCard
                        titulo="Pedidos"
                        valor={stats.totalPedidos}
                        subtitulo={`${stats.pedidosPendentes} pendentes`}
                        icone={ShoppingCart}
                        cor="blue"
                        onClick={() => navigate('/vendedor/pedidos')}
                    />

                    <StatCard
                        titulo="Faturamento"
                        valor={formatarPreco(stats.faturamentoTotal)}
                        subtitulo="Total acumulado"
                        icone={DollarSign}
                        cor="green"
                        onClick={() => navigate('/vendedor/financeiro')}
                    />

                    <StatCard
                        titulo="Avaliação"
                        valor={stats.avaliacaoMedia > 0 ? stats.avaliacaoMedia.toFixed(1) : '-'}
                        subtitulo="Média dos clientes"
                        icone={Star}
                        cor="yellow"
                        onClick={() => navigate('/vendedor/avaliacoes')}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-1 space-y-6">

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-emerald-600" />
                                Ações Rápidas
                            </h3>

                            <div className="space-y-3">
                                <AcaoRapida
                                    titulo="Cadastrar Produto"
                                    descricao="Adicionar novo item ao catálogo"
                                    icone={Plus}
                                    onClick={() => navigate('/vendedor/cadastrar-produto')}
                                    cor="emerald"
                                />

                                <AcaoRapida
                                    titulo="Ver Produtos"
                                    descricao="Gerenciar seus produtos"
                                    icone={Eye}
                                    onClick={() => navigate('/vendedor/meus-produtos')}
                                    cor="blue"
                                />

                                <AcaoRapida
                                    titulo="Pedidos Pendentes"
                                    descricao={`${stats.pedidosPendentes} aguardando`}
                                    icone={AlertCircle}
                                    onClick={() => navigate('/vendedor/pedidos?filtro=pendente')}
                                    cor="orange"
                                    badge={stats.pedidosPendentes > 0 ? stats.pedidosPendentes : undefined}
                                />

                                <AcaoRapida
                                    titulo="Relatórios"
                                    descricao="Análise de vendas"
                                    icone={TrendingUp}
                                    onClick={() => navigate('/vendedor/relatorios')}
                                    cor="purple"
                                />
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-sm p-6 text-white">
                            <h3 className="font-semibold mb-2">💡 Dica do Dia</h3>
                            <p className="text-sm text-emerald-100">
                                Produtos com imagens de alta qualidade vendem até 3x mais.
                                Invista em boas fotos!
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-800">Produtos Recentes</h3>
                                <button
                                    onClick={() => navigate('/vendedor/meus-produtos')}
                                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
                                >
                                    Ver todos
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {produtosRecentes.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>Nenhum produto cadastrado</p>
                                    <button
                                        onClick={() => navigate('/vendedor/cadastrar-produto')}
                                        className="mt-4 text-emerald-600 hover:underline"
                                    >
                                        Cadastrar primeiro produto
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {produtosRecentes.map((produto: any) => (
                                        <div
                                            key={produto.id}
                                            className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => navigate(`/vendedor/produto/${produto.id}`)}
                                        >
                                            <img
                                                src={produto.image || 'https://via.placeholder.com/60'}
                                                alt={produto.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 line-clamp-1">{produto.name}</h4>
                                                <p className="text-sm text-gray-500">{produto.category}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="font-semibold text-emerald-600">
                                                        {formatarPreco(produto.price)}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${produto.stock > 10
                                                        ? 'bg-green-100 text-green-800'
                                                        : produto.stock > 0
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {produto.stock} em estoque
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {pedidosRecentes.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-800">Pedidos Recentes</h3>
                                    <button
                                        onClick={() => navigate('/vendedor/pedidos')}
                                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        Ver todos
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {pedidosRecentes.map((pedido: any) => (
                                        <div key={pedido.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                            <div>
                                                <p className="font-medium text-gray-900">#{pedido.id?.slice(-6).toUpperCase()}</p>
                                                <p className="text-sm text-gray-500">
                                                    {pedido.criadoEm?.toDate?.().toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatarPreco(pedido.total || 0)}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${pedido.status === 'entregue'
                                                    ? 'bg-green-100 text-green-800'
                                                    : pedido.status === 'pendente'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {pedido.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {stats.produtosEsgotados > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-red-800">Produtos Esgotados</h4>
                                    <p className="text-sm text-red-600 mt-1">
                                        Você tem {stats.produtosEsgotados} produto(s) sem estoque.
                                        <button
                                            onClick={() => navigate('/vendedor/meus-produtos?filtro=esgotado')}
                                            className="font-semibold underline ml-1"
                                        >
                                            Ver produtos
                                        </button>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};


interface StatCardProps {
    titulo: string;
    valor: string | number;
    subtitulo: string;
    icone: any;
    cor: 'emerald' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
    onClick: () => void;
}

const StatCard = ({ titulo, valor, subtitulo, icone: Icone, cor, onClick }: StatCardProps) => {
    const cores = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
        orange: 'bg-orange-50 text-orange-600 border-orange-200'
    };

    return (
        <div
            onClick={onClick}
            className={`${cores[cor]} border rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium opacity-80">{titulo}</p>
                    <p className="text-2xl font-bold mt-1">{valor}</p>
                    <p className="text-xs mt-2 opacity-70">{subtitulo}</p>
                </div>
                <div className="p-3 bg-white bg-opacity-50 rounded-lg">
                    <Icone className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

interface AcaoRapidaProps {
    titulo: string;
    descricao: string;
    icone: any;
    onClick: () => void;
    cor: string;
    badge?: number;
}

const AcaoRapida = ({ titulo, descricao, icone: Icone, onClick, cor, badge }: AcaoRapidaProps) => {
    const coresIcone = {
        emerald: 'bg-emerald-100 text-emerald-600',
        blue: 'bg-blue-100 text-blue-600',
        orange: 'bg-orange-100 text-orange-600',
        purple: 'bg-purple-100 text-purple-600'
    };

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition text-left group"
        >
            <div className={`p-2 rounded-lg ${coresIcone[cor as keyof typeof coresIcone]}`}>
                <Icone className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 group-hover:text-emerald-600 transition">
                        {titulo}
                    </span>
                    {badge && badge > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {badge}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-500">{descricao}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition" />
        </button>
    );
};

export default PainelVendedor;