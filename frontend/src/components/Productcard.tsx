import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';

interface Product {
    id: string;
    name: string;
    price: number;
    comparePrice?: number;
    images: string[];
    category: { name: string };
}

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCartStore();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            stock: 10, // virá do backend depois
        });
    };

    const discount = product.comparePrice
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;

    return (
        <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
            <Link to={`/produto/${product.id}`} className="block">
                {/* Imagem */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img
                        src={product.images[0] || 'https://placehold.co/400x400?text=Produto'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded">
                            -{discount}%
                        </span>
                    )}
                </div>

                {/* Info */}
                <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
                    <h3 className="font-medium text-dark line-clamp-2 mb-2 group-hover:text-primary transition">
                        {product.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-primary">
                            R$ {product.price.toFixed(2)}
                        </span>
                        {product.comparePrice && (
                            <span className="text-sm text-gray-400 line-through">
                                R$ {product.comparePrice.toFixed(2)}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary py-2 rounded-lg font-medium hover:bg-primary hover:text-white transition"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Adicionar
                    </button>
                </div>
            </Link>
        </div>
    );
}