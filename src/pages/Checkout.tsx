import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CreditCard,
    QrCode,
    Barcode,
    MapPin,
    ChevronRight,
    Check,
    Truck,
    Tag
} from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/config';
import { auth } from '../lib/firebase/authService';

const steps = [
    { id: 'address', label: 'Endereço' },
    { id: 'payment', label: 'Pagamento' },
    { id: 'review', label: 'Revisão' },
];

const COUPONS: Record<string, { type: 'percent' | 'fixed'; value: number; label: string }> = {
    'DISPENSA10': { type: 'percent', value: 10, label: '10% de desconto' },
    'FRETE0': { type: 'fixed', value: 0, label: 'Frete grátis' },
    'BEMVINDO20': { type: 'fixed', value: 20, label: 'R$ 20,00 de desconto' },
};

export default function Checkout() {
    const navigate = useNavigate();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const [currentStep, setCurrentStep] = useState('address');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | 'boleto'>('card');
    const [isProcessing, setIsProcessing] = useState(false);

    // Cupom
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<typeof COUPONS[string] | null>(null);
    const [couponError, setCouponError] = useState('');

    const subtotal = getTotalPrice();
    const shipping = subtotal > 150 ? 0 : 15.90;

    const pixDiscount = paymentMethod === 'pix' ? (subtotal + shipping) * 0.05 : 0;
    const couponDiscount = appliedCoupon
        ? appliedCoupon.type === 'percent'
            ? (subtotal + shipping) * (appliedCoupon.value / 100)
            : appliedCoupon.value
        : 0;
    const total = subtotal + shipping - pixDiscount - couponDiscount;

    const [address, setAddress] = useState({
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
    });

    const handleZipCodeLookup = async (cep: string) => {
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (data.erro) {
                    alert('CEP não encontrado');
                    return;
                }
                setAddress(prev => ({
                    ...prev,
                    zipCode: cep,
                    street: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf,
                }));
            } catch {
                alert('Erro ao buscar CEP. Tente novamente.');
            }
        }
    };

    const handleApplyCoupon = () => {
        setCouponError('');
        const code = couponCode.trim().toUpperCase();
        if (COUPONS[code]) {
            setAppliedCoupon(COUPONS[code]);
        } else {
            setCouponError('Cupom inválido ou expirado');
            setAppliedCoupon(null);
        }
    };

    const handleSubmit = async () => {
        setIsProcessing(true);

        try {
            const currentUser = auth.currentUser;

            if (!currentUser) {
                alert('Você precisa estar logado para finalizar a compra.');
                navigate('/login');
                return;
            }

            console.log('Firebase Auth UID:', currentUser.uid);
            console.log('Store User ID:', user?.id);

            await addDoc(collection(db, 'orders'), {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image || null,
                })),
                address,
                paymentMethod,
                subtotal,
                shipping,
                pixDiscount,
                couponCode: appliedCoupon ? couponCode.trim().toUpperCase() : null,
                couponDiscount,
                total,
                status: 'processing',
                createdAt: serverTimestamp(),
            });

            clearCart();
            navigate('/pedidos?success=true');
        } catch (error) {
            console.error('Erro ao salvar pedido:', error);
            alert('Erro ao finalizar pedido. Tente novamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        navigate('/carrinho');
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Finalizar Compra</h1>

            {/* Steps */}
            <div className="flex items-center justify-center mb-8">
                {steps.map((step, idx) => (
                    <div key={step.id} className="flex items-center">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentStep === step.id
                            ? 'bg-primary text-white'
                            : idx < steps.findIndex(s => s.id === currentStep)
                                ? 'bg-primary/20 text-primary'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                            {idx < steps.findIndex(s => s.id === currentStep) ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                                    {idx + 1}
                                </span>
                            )}
                            <span className="font-medium">{step.label}</span>
                        </div>
                        {idx < steps.length - 1 && (
                            <ChevronRight className="w-5 h-5 text-gray-400 mx-2" />
                        )}
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Formulário Principal */}
                <div className="md:col-span-2 space-y-6">
                    {currentStep === 'address' && (
                        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-bold">Endereço de Entrega</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium mb-1">CEP</label>
                                    <input
                                        type="text"
                                        value={address.zipCode}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            setAddress({ ...address, zipCode: value });
                                            if (value.length === 8) handleZipCodeLookup(value);
                                        }}
                                        placeholder="00000-000"
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                        maxLength={8}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Rua</label>
                                <input type="text" value={address.street}
                                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Número</label>
                                    <input type="text" value={address.number}
                                        onChange={(e) => setAddress({ ...address, number: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Complemento</label>
                                    <input type="text" value={address.complement}
                                        onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                                        placeholder="Apto, Bloco..."
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Bairro</label>
                                <input type="text" value={address.neighborhood}
                                    onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cidade</label>
                                    <input type="text" value={address.city}
                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Estado</label>
                                    <input type="text" value={address.state}
                                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary" />
                                </div>
                            </div>

                            <button onClick={() => setCurrentStep('payment')}
                                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition">
                                Continuar para Pagamento
                            </button>
                        </div>
                    )}

                    {currentStep === 'payment' && (
                        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                            <h2 className="text-lg font-bold mb-4">Forma de Pagamento</h2>

                            <div className="space-y-3">
                                {([
                                    { id: 'card', icon: CreditCard, label: 'Cartão de Crédito', sub: 'Parcele em até 12x' },
                                    { id: 'pix', icon: QrCode, label: 'PIX', sub: '5% de desconto' },
                                    { id: 'boleto', icon: Barcode, label: 'Boleto Bancário', sub: 'Vencimento em 3 dias úteis' },
                                ] as const).map(({ id, icon: Icon, label, sub }) => (
                                    <button key={id} onClick={() => setPaymentMethod(id)}
                                        className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl transition ${paymentMethod === id ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                                        <Icon className="w-6 h-6 text-primary" />
                                        <div className="flex-1 text-left">
                                            <p className="font-medium">{label}</p>
                                            <p className="text-sm text-gray-500">{sub}</p>
                                        </div>
                                        {paymentMethod === id && <Check className="w-5 h-5 text-primary" />}
                                    </button>
                                ))}
                            </div>

                            {paymentMethod === 'card' && (
                                <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Número do Cartão</label>
                                        <input type="text" placeholder="0000 0000 0000 0000"
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Validade</label>
                                            <input type="text" placeholder="MM/AA"
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">CVV</label>
                                            <input type="text" placeholder="123"
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Nome no Cartão</label>
                                        <input type="text" placeholder="Como aparece no cartão"
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary" />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setCurrentStep('address')}
                                    className="flex-1 py-3 border rounded-xl font-medium hover:bg-gray-50">
                                    Voltar
                                </button>
                                <button onClick={() => setCurrentStep('review')}
                                    className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition">
                                    Revisar Pedido
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 'review' && (
                        <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
                            <h2 className="text-lg font-bold">Revisão do Pedido</h2>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Endereço de Entrega
                                    </span>
                                    <button onClick={() => setCurrentStep('address')}
                                        className="text-sm text-primary hover:underline">Alterar</button>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {address.street}, {address.number} {address.complement && `- ${address.complement}`}<br />
                                    {address.neighborhood} - {address.city}/{address.state}<br />
                                    CEP: {address.zipCode}
                                </p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">Forma de Pagamento</span>
                                    <button onClick={() => setCurrentStep('payment')}
                                        className="text-sm text-primary hover:underline">Alterar</button>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {paymentMethod === 'card' && 'Cartão de Crédito'}
                                    {paymentMethod === 'pix' && 'PIX (5% de desconto)'}
                                    {paymentMethod === 'boleto' && 'Boleto Bancário'}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium mb-3">Itens do Pedido</h3>
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{item.quantity}x {item.name}</span>
                                            <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isProcessing}
                                className="w-full bg-primary text-white py-4 rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        Confirmar Pedido
                                        <Truck className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Resumo */}
                <div className="bg-white p-6 rounded-xl shadow-sm h-fit space-y-4">
                    <h3 className="font-bold">Resumo</h3>

                    <div className="space-y-3 text-sm">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between">
                                <span className="text-gray-600">{item.quantity}x {item.name}</span>
                                <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Cupom */}
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Código do cupom"
                                value={couponCode}
                                onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                                disabled={!!appliedCoupon}
                                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary disabled:bg-gray-50"
                            />
                        </div>
                        {appliedCoupon ? (
                            <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                                className="px-3 py-2 border rounded-lg text-sm text-red-500 hover:bg-red-50">
                                Remover
                            </button>
                        ) : (
                            <button onClick={handleApplyCoupon}
                                className="px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">
                                Aplicar
                            </button>
                        )}
                    </div>
                    {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                    {appliedCoupon && (
                        <p className="text-xs text-green-600 font-medium">✓ Cupom aplicado: {appliedCoupon.label}</p>
                    )}

                    <div className="border-t pt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span>R$ {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Frete</span>
                            <span className={shipping === 0 ? 'text-primary' : ''}>
                                {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}
                            </span>
                        </div>
                        {pixDiscount > 0 && (
                            <div className="flex justify-between text-primary">
                                <span>Desconto PIX (5%)</span>
                                <span>- R$ {pixDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        {couponDiscount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Cupom ({couponCode.toUpperCase()})</span>
                                <span>- R$ {couponDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t pt-2 flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-primary">R$ {total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-700 text-center">
                            🔒 Seus dados estão protegidos com criptografia SSL
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}