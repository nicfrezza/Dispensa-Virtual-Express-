import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ShoppingCart,
    Truck,
    Shield,
    ArrowLeft,
    Plus,
    Minus,
    Heart,
    Factory,
} from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { productService } from '../services/productService';
import NutritionLabel from '../components/NutritionLabel';
import ProductScores from '../components/ProductScores';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCartStore();
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const {
        data: product,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getById(id!),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Produto não encontrado</p>
                <Link to="/catalogo" className="text-primary hover:underline mt-4 block">
                    Voltar ao catálogo
                </Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            stock: product.stock,
        });
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
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Imagem */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Informações */}
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <span>{product.category}</span>
                            {product.brand && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Factory className="w-4 h-4" />
                                        {product.brand}
                                    </span>
                                </>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold text-dark mb-3">
                            {product.name}
                        </h1>

                        {product.nutriscore && product.ecoscore && (
                            <ProductScores
                                ecoscore={product.ecoscore}
                                nutriscore={product.nutriscore}
                            />
                        )}
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
                            className="flex-1 flex items-center justify-center gap-2 bg-primary text-red py-4 rounded-xl font-semibold hover:bg-primary/90 transition"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Adicionar ao Carrinho
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className="flex-1 bg-secondary text-red py-4 rounded-xl font-semibold hover:bg-secondary/90 transition"
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

            {/* Descrição e Nutrição */}
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-bold mb-4">Descrição</h2>
                    <p className="text-gray-600 leading-relaxed">
                        {product.description || 'Sem descrição disponível.'}
                    </p>
                </div>

                {product.nutrition && (
                    <NutritionLabel nutrition={product.nutrition} />
                )}
            </div>
        </div>
    );
}