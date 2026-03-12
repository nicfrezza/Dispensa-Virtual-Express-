import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CreditCard,
    QrCode,
    Barcode,
    MapPin,
    ChevronRight,
    Check,
    Truck
} from 'lucide-react';
import { useCartStore } from '../stores/cartStore';

const steps = [
    { id: 'address', label: 'Endereço' },
    { id: 'payment', label: 'Pagamento' },
    { id: 'review', label: 'Revisão' },
];

export default function Checkout() {
    const navigate = useNavigate();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const [currentStep, setCurrentStep] = useState('address');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | 'boleto'>('card');
    const [isProcessing, setIsProcessing] = useState(false);

    const subtotal = getTotalPrice();
    const shipping = subtotal > 150 ? 0 : 15.90;
    const total = subtotal + shipping;

    // Mock de endereço
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
        // Integração com ViaCEP aqui
        if (cep.length === 8) {
            // Mock de resposta
            setAddress({
                ...address,
                zipCode: cep,
                street: 'Rua das Flores',
                neighborhood: 'Centro',
                city: 'São Paulo',
                state: 'SP',
            });
        }
    };

    const handleSubmit = async () => {
        setIsProcessing(true);
        // Simular processamento
        await new Promise(resolve => setTimeout(resolve, 2000));
        clearCart();
        navigate('/pedidos?success=true');
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
                                <input
                                    type="text"
                                    value={address.street}
                                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Número</label>
                                    <input
                                        type="text"
                                        value={address.number}
                                        onChange={(e) => setAddress({ ...address, number: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Complemento</label>
                                    <input
                                        type="text"
                                        value={address.complement}
                                        onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                                        placeholder="Apto, Bloco..."
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Bairro</label>
                                <input
                                    type="text"
                                    value={address.neighborhood}
                                    onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cidade</label>
                                    <input
                                        type="text"
                                        value={address.city}
                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Estado</label>
                                    <input
                                        type="text"
                                        value={address.state}
                                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setCurrentStep('payment')}
                                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition"
                            >
                                Continuar para Pagamento
                            </button>
                        </div>
                    )}

                    {currentStep === 'payment' && (
                        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                            <h2 className="text-lg font-bold mb-4">Forma de Pagamento</h2>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl transition ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-200'
                                        }`}
                                >
                                    <CreditCard className="w-6 h-6 text-primary" />
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">Cartão de Crédito</p>
                                        <p className="text-sm text-gray-500">Parcele em até 12x</p>
                                    </div>
                                    {paymentMethod === 'card' && <Check className="w-5 h-5 text-primary" />}
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('pix')}
                                    className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl transition ${paymentMethod === 'pix' ? 'border-primary bg-primary/5' : 'border-gray-200'
                                        }`}
                                >
                                    <QrCode className="w-6 h-6 text-primary" />
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">PIX</p>
                                        <p className="text-sm text-gray-500">5% de desconto</p>
                                    </div>
                                    {paymentMethod === 'pix' && <Check className="w-5 h-5 text-primary" />}
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('boleto')}
                                    className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl transition ${paymentMethod === 'boleto' ? 'border-primary bg-primary/5' : 'border-gray-200'
                                        }`}
                                >
                                    <Barcode className="w-6 h-6 text-primary" />
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">Boleto Bancário</p>
                                        <p className="text-sm text-gray-500">Vencimento em 3 dias úteis</p>
                                    </div>
                                    {paymentMethod === 'boleto' && <Check className="w-5 h-5 text-primary" />}
                                </button>
                            </div>

                            {paymentMethod === 'card' && (
                                <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Número do Cartão</label>
                                        <input
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Validade</label>
                                            <input
                                                type="text"
                                                placeholder="MM/AA"
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">CVV</label>
                                            <input
                                                type="text"
                                                placeholder="123"
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Nome no Cartão</label>
                                        <input
                                            type="text"
                                            placeholder="Como aparece no cartão"
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCurrentStep('address')}
                                    className="flex-1 py-3 border rounded-xl font-medium hover:bg-gray-50"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={() => setCurrentStep('review')}
                                    className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition"
                                >
                                    Revisar Pedido
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 'review' && (
                        <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
                            <h2 className="text-lg font-bold">Revisão do Pedido</h2>

                            {/* Endereço */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Endereço de Entrega
                                    </span>
                                    <button
                                        onClick={() => setCurrentStep('address')}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Alterar
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {address.street}, {address.number} {address.complement && `- ${address.complement}`}
                                    <br />
                                    {address.neighborhood} - {address.city}/{address.state}
                                    <br />
                                    CEP: {address.zipCode}
                                </p>
                            </div>

                            {/* Pagamento */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">Forma de Pagamento</span>
                                    <button
                                        onClick={() => setCurrentStep('payment')}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Alterar
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 capitalize">
                                    {paymentMethod === 'card' && 'Cartão de Crédito'}
                                    {paymentMethod === 'pix' && 'PIX (5% de desconto)'}
                                    {paymentMethod === 'boleto' && 'Boleto Bancário'}
                                </p>
                            </div>

                            {/* Itens */}
                            <div>
                                <h3 className="font-medium mb-3">Itens do Pedido</h3>
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                {item.quantity}x {item.name}
                                            </span>
                                            <span className="font-medium">
                                                R$ {(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isProcessing}
                                className="w-full bg-secondary text-white py-4 rounded-xl font-semibold hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

                {/* Resumo do Pedido */}
                <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
                    <h3 className="font-bold mb-4">Resumo</h3>

                    <div className="space-y-3 text-sm mb-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between">
                                <span className="text-gray-600">{item.quantity}x {item.name}</span>
                                <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

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
                        {paymentMethod === 'pix' && (
                            <div className="flex justify-between text-primary">
                                <span>Desconto PIX (5%)</span>
                                <span>- R$ {(total * 0.05).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t pt-2 flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-primary">
                                R$ {paymentMethod === 'pix' ? (total * 0.95).toFixed(2) : total.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-700 text-center">
                            🔒 Seus dados estão protegidos com criptografia SSL
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}