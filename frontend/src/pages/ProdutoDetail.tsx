import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ShoppingCart,
    Truck,
    Shield,
    ArrowLeft,
    Plus,
    Minus,
    Star,
    Heart
} from 'lucide-react';
import { useCartStore } from '../stores/cartStore';

// Mock de produto - depois virá da API
const mockProduct = {
    id: '1',
    name: 'Arroz Integral Tipo 1 - 5kg',
    description: 'Arroz integral de alta qualidade, fonte de fibras e nutrientes essenciais. Cultivado sem agrotóxicos, ideal para uma alimentação saudável. Grãos selecionados que não empapam no cozimento.',
    price: 28.90,
    comparePrice: 32.90,
    images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
        'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600',
        'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=600',
    ],
    stock: 50,
    sku: 'ARZ-INT-5KG',
    category: { id: 'graos', name: 'Grãos' },
    weight: 5,
    brand: 'Grãos do Vale',
    rating: 4.8,
    reviewCount: 124,
    features: [
        '100% integral, fonte de fibras',
        'Não contém glúten',
        'Embalagem vacuum',
        'Validade: 12 meses',
    ],
};

const relatedProducts = [
    {
        id: '5',
        name: 'Feijão Carioca - 1kg',
        price: 8.90,
        images: ['https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=400'],
        category: { name: 'Grãos' },
    },
    {
        id: '6',
        name: 'Leite Integral UHT - 1L',
        price: 4.99,
        comparePrice: 6.50,
        images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'],
        category: { name: 'Laticínios' },
    },
];

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCartStore();
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Simulando query - depois usar react-query
    const product = mockProduct;

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            stock: product.stock,
        });

        // Resetar quantidade
        setQuantity(1);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/carrinho');
    };

    const discount = product.comparePrice
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;

    return (
        <div className="space-y-12">
            {/* Breadcrumb */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition"
            >
                <ArrowLeft className="w-4 h-4" />
                Voltar
            </button>

            {/* Produto Principal */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Galeria de Imagens */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                        <img
                            src={product.images[selectedImage]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex gap-2">
                        {product.images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(idx)}
                                className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${selectedImage === idx ? 'border-primary' : 'border-transparent'
                                    }`}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Informações */}
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <span>{product.category.name}</span>
                            <span>•</span>
                            <span>SKU: {product.sku}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-dark mb-2">{product.name}</h1>

                        {/* Avaliação */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-gray-300'}`}
                                    />
                                ))}
                            </div>
                            <span className="font-medium">{product.rating}</span>
                            <span className="text-gray-500">({product.reviewCount} avaliações)</span>
                        </div>
                    </div>

                    {/* Preço */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                        <div className="flex items-baseline gap-3 mb-2">
                            <span className="text-4xl font-bold text-primary">
                                R$ {product.price.toFixed(2)}
                            </span>
                            {product.comparePrice && (
                                <span className="text-xl text-gray-400 line-through">
                                    R$ {product.comparePrice.toFixed(2)}
                                </span>
                            )}
                        </div>
                        {discount > 0 && (
                            <span className="inline-block bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                                Economize {discount}%
                            </span>
                        )}
                    </div>

                    {/* Quantidade */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Quantidade</label>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border rounded-lg">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-3 hover:bg-gray-100"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="p-3 hover:bg-gray-100"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <span className="text-sm text-gray-500">
                                {product.stock} unidades disponíveis
                            </span>
                        </div>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-semibold hover:bg-primary/90 transition"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Adicionar ao Carrinho
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className="flex-1 bg-secondary text-white py-4 rounded-xl font-semibold hover:bg-secondary/90 transition"
                        >
                            Comprar Agora
                        </button>
                        <button
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            className={`p-4 rounded-xl border-2 transition ${isWishlisted
                                    ? 'border-danger bg-danger/10 text-danger'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    {/* Benefícios */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <Truck className="w-6 h-6 text-primary" />
                            <div>
                                <p className="font-medium text-sm">Frete Grátis</p>
                                <p className="text-xs text-gray-500">Acima de R$ 150</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <Shield className="w-6 h-6 text-primary" />
                            <div>
                                <p className="font-medium text-sm">Compra Segura</p>
                                <p className="text-xs text-gray-500">Dados protegidos</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Descrição e Detalhes */}
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <section>
                        <h2 className="text-xl font-bold mb-4">Descrição</h2>
                        <p className="text-gray-600 leading-relaxed">{product.description}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4">Características</h2>
                        <ul className="grid sm:grid-cols-2 gap-3">
                            {product.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                    <span className="text-gray-600">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl h-fit">
                    <h3 className="font-bold mb-4">Informações</h3>
                    <dl className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Marca</dt>
                            <dd className="font-medium">{product.brand}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Peso</dt>
                            <dd className="font-medium">{product.weight}kg</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Categoria</dt>
                            <dd className="font-medium">{product.category.name}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Produtos Relacionados */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Produtos Relacionados</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedProducts.map((product) => (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full aspect-square object-cover"
                            />
                            <div className="p-4">
                                <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
                                <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                                <p className="text-lg font-bold text-primary">R$ {product.price.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}