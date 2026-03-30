import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Package,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    ChevronRight,
    Search,
    Calendar,
    Loader2
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/config';
import { useAuthStore } from '../stores/authStore';

const statusConfig = {
    pending: { label: 'Pendente', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
    processing: { label: 'Em processamento', icon: Package, color: 'text-blue-600 bg-blue-50' },
    shipped: { label: 'Enviado', icon: Truck, color: 'text-purple-600 bg-purple-50' },
    delivered: { label: 'Entregue', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    cancelled: { label: 'Cancelado', icon: XCircle, color: 'text-red-600 bg-red-50' },
};

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
}

interface Order {
    id: string;
    items: OrderItem[];
    address: Record<string, string>;
    paymentMethod: string;
    subtotal: number;
    shipping: number;
    total: number;
    status: keyof typeof statusConfig;
    createdAt: any;
    trackingCode?: string;
    couponCode?: string;
    couponDiscount?: number;
    pixDiscount?: number;
}

export default function Orders() {
    const [searchParams] = useSearchParams();
    const { user } = useAuthStore();
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const showSuccess = searchParams.get('success') === 'true';

    useEffect(() => {
        const fetchOrders = async () => {
            console.log('User ID na query:', user?.id);

            if (!user?.id) {
                setOrders([]);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const q = query(
                    collection(db, 'orders'),
                    where('userId', '==', user.id),
                    orderBy('createdAt', 'desc')
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Order[];

                console.log('Orders encontrados:', data.length);
                setOrders(data);
            } catch (error) {
                console.error('Erro ao buscar pedidos:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [user?.id]);

    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'all' || order.status === filter;
        const matchesSearch = search === '' || order.id.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {showSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <div>
                        <p className="font-medium">Pedido realizado com sucesso!</p>
                        <p className="text-sm">Você receberá atualizações por e-mail.</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Meus Pedidos</h1>
                    <p className="text-gray-500">Acompanhe seus pedidos e histórico</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por ID do pedido..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {[
                    { id: 'all', label: 'Todos' },
                    { id: 'processing', label: 'Em andamento' },
                    { id: 'shipped', label: 'Enviados' },
                    { id: 'delivered', label: 'Entregues' },
                    { id: 'cancelled', label: 'Cancelados' },
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === f.id ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600">Nenhum pedido encontrado</h3>
                    <p className="text-gray-500 mb-4">Que tal fazer sua primeira compra?</p>
                    <Link to="/catalogo"
                        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary/90">
                        Ver produtos
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const status = statusConfig[order.status] ?? statusConfig.processing;
                        const StatusIcon = status.icon;
                        const date = order.createdAt?.toDate?.() ?? new Date();

                        return (
                            <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-lg">#{order.id.slice(0, 8).toUpperCase()}</h3>
                                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                <StatusIcon className="w-4 h-4" />
                                                {status.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {date.toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary">
                                            R$ {order.total.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 overflow-x-auto pb-4 mb-4 border-b">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 min-w-fit">
                                            {item.image && (
                                                <img src={item.image} alt={item.name}
                                                    className="w-16 h-16 rounded-lg object-cover" />
                                            )}
                                            <div>
                                                <p className="font-medium text-sm">{item.name}</p>
                                                <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="text-sm text-gray-600">
                                        {order.status === 'shipped' && order.trackingCode && (
                                            <p>Código de rastreio: <span className="font-medium">{order.trackingCode}</span></p>
                                        )}
                                        {order.paymentMethod === 'pix' && <p>Pagamento: PIX</p>}
                                        {order.paymentMethod === 'boleto' && <p>Pagamento: Boleto</p>}
                                        {order.paymentMethod === 'card' && <p>Pagamento: Cartão de Crédito</p>}
                                    </div>
                                    <div className="flex gap-3">
                                        <Link to={`/pedido/${order.id}`}
                                            className="flex items-center gap-1 text-primary hover:underline text-sm font-medium">
                                            Ver detalhes
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                        {order.status === 'delivered' && (
                                            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
                                                Comprar novamente
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}