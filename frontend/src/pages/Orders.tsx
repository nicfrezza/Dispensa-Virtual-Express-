import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Package,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    ChevronRight,
    Search,
    Calendar
} from 'lucide-react';

const orders = [
    {
        id: 'DISP-2024-0001',
        date: '2024-03-10',
        status: 'delivered',
        total: 156.80,
        items: [
            { name: 'Arroz Integral 5kg', quantity: 2, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100' },
            { name: 'Café em Grãos 1kg', quantity: 1, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100' },
        ],
        trackingCode: 'BR123456789',
        deliveredAt: '2024-03-12',
    },
    {
        id: 'DISP-2024-0002',
        date: '2024-03-15',
        status: 'shipped',
        total: 89.90,
        items: [
            { name: 'Azeite de Oliva 500ml', quantity: 3, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100' },
        ],
        trackingCode: 'BR987654321',
        shippedAt: '2024-03-16',
    },
    {
        id: 'DISP-2024-0003',
        date: '2024-03-18',
        status: 'processing',
        total: 245.50,
        items: [
            { name: 'Kit Café da Manhã', quantity: 1, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100' },
            { name: 'Mel Orgânico 300g', quantity: 2, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100' },
        ],
    },
    {
        id: 'DISP-2024-0004',
        date: '2024-02-28',
        status: 'cancelled',
        total: 45.00,
        items: [
            { name: 'Feijão Carioca 1kg', quantity: 5, image: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=100' },
        ],
        cancelledAt: '2024-02-28',
    },
];

const statusConfig = {
    pending: { label: 'Pendente', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
    processing: { label: 'Em processamento', icon: Package, color: 'text-blue-600 bg-blue-50' },
    shipped: { label: 'Enviado', icon: Truck, color: 'text-purple-600 bg-purple-50' },
    delivered: { label: 'Entregue', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    cancelled: { label: 'Cancelado', icon: XCircle, color: 'text-red-600 bg-red-50' },
};

export default function Orders() {
    const [searchParams] = useSearchParams();
    const [filter, setFilter] = useState('all');
    const showSuccess = searchParams.get('success') === 'true';

    const filteredOrders = orders.filter(order =>
        filter === 'all' || order.status === filter
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Mensagem de Sucesso */}
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

                {/* Busca */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar pedido..."
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            {/* Filtros */}
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
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === f.id
                                ? 'bg-primary text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Lista de Pedidos */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600">Nenhum pedido encontrado</h3>
                        <p className="text-gray-500 mb-4">Que tal fazer sua primeira compra?</p>
                        <Link
                            to="/catalogo"
                            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary/90"
                        >
                            Ver produtos
                        </Link>
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const status = statusConfig[order.status as keyof typeof statusConfig];
                        const StatusIcon = status.icon;

                        return (
                            <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm">
                                {/* Header do Pedido */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-lg">{order.id}</h3>
                                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                <StatusIcon className="w-4 h-4" />
                                                {status.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(order.date).toLocaleDateString('pt-BR')}
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

                                {/* Itens */}
                                <div className="flex gap-4 overflow-x-auto pb-4 mb-4 border-b">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 min-w-fit">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div>
                                                <p className="font-medium text-sm">{item.name}</p>
                                                <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Ações */}
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="text-sm text-gray-600">
                                        {order.status === 'shipped' && order.trackingCode && (
                                            <p>Código de rastreio: <span className="font-medium">{order.trackingCode}</span></p>
                                        )}
                                        {order.status === 'delivered' && order.deliveredAt && (
                                            <p>Entregue em: {new Date(order.deliveredAt).toLocaleDateString('pt-BR')}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <Link
                                            to={`/pedido/${order.id}`}
                                            className="flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                                        >
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
                    })
                )}
            </div>
        </div>
    );
}