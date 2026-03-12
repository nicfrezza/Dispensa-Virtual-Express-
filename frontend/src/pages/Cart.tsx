import { Link, useNavigate } from 'react-router-dom';
import {
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    ArrowRight,
    Truck,
    Tag
} from 'lucide-react';
import { useCartStore } from '../stores/cartStore';

export default function Cart() {
    const navigate = useNavigate();
    const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();

    const subtotal = getTotalPrice();
    const shipping = subtotal > 150 ? 0 : 15.90;
    const total = subtotal + shipping;

    if (items.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-dark mb-2">Seu carrinho está vazio</h2>
                <p className="text-gray-500 mb-6">Que tal adicionar alguns produtos?</p>
                <Link
                    to="/catalogo"
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition"
                >
                    Continuar Comprando
                </Link>
            </div>
        );
    }

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Lista de Itens */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Carrinho ({items.length} itens)</h1>
                    <button
                        onClick={clearCart}
                        className="text-danger hover:underline text-sm"
                    >
                        Limpar carrinho
                    </button>
                </div>

                <div className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white p-4 rounded-xl shadow-sm flex gap-4"
                        >
                            {/* Imagem */}
                            <Link to={`/produto/${item.id}`} className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </Link>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <Link
                                    to={`/produto/${item.id}`}
                                    className="font-medium text-dark hover:text-primary transition line-clamp-2"
                                >
                                    {item.name}
                                </Link>
                                <p className="text-primary font-bold mt-1">
                                    R$ {item.price.toFixed(2)}
                                </p>

                                {/* Controles */}
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center border rounded-lg">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="p-2 hover:bg-gray-100"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-2 hover:bg-gray-100"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-dark">
                                            R$ {(item.price * item.quantity).toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-2 text-gray-400 hover:text-danger transition"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Link
                    to="/catalogo"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                    ← Continuar comprando
                </Link>
            </div>

            {/* Resumo */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
                    <h2 className="text-xl font-bold mb-6">Resumo do Pedido</h2>

                    {/* Cupom */}
                    <div className="flex gap-2 mb-6">
                        <div className="flex-1 relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Código do cupom"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>
                        <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium">
                            Aplicar
                        </button>
                    </div>

                    {/* Cálculos */}
                    <div className="space-y-3 text-sm mb-6">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span>R$ {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 flex items-center gap-1">
                                <Truck className="w-4 h-4" />
                                Frete
                            </span>
                            <span className={shipping === 0 ? 'text-primary font-medium' : ''}>
                                {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}
                            </span>
                        </div>
                        {shipping > 0 && (
                            <p className="text-xs text-gray-500">
                                Faltam R$ {(150 - subtotal).toFixed(2)} para frete grátis
                            </p>
                        )}
                        <div className="border-t pt-3 flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-primary">R$ {total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Botão Checkout */}
                    <button
                        onClick={() => navigate('/checkout')}
                        className="w-full flex items-center justify-center gap-2 bg-secondary text-white py-4 rounded-xl font-semibold hover:bg-secondary/90 transition"
                    >
                        Finalizar Compra
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    {/* Segurança */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Pagamento 100% seguro
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}