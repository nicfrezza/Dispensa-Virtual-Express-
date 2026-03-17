import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, User, Search } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { categoryService } from '../services/categoryService';

export default function Header() {
    const { items } = useCartStore();
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // Buscar categorias do JSON
    const { data: categories } = useQuery({
        queryKey: ['header-categories'],
        queryFn: categoryService.getAll,
    });

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl">🥬</span>
                        </div>
                        <span className="text-xl font-bold text-dark hidden sm:block">
                            Dispensa Express
                        </span>
                    </Link>

                    {/* Busca */}
                    <div className="flex-1 max-w-xl">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar produtos..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-4">
                        <Link to="/carrinho" className="relative p-2 hover:bg-gray-100 rounded-full">
                            <ShoppingCart className="w-6 h-6 text-dark" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-xs rounded-full flex items-center justify-center font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <Link to="/perfil" className="p-2 hover:bg-gray-100 rounded-full">
                            <User className="w-6 h-6 text-dark" />
                        </Link>
                    </div>
                </div>

                {/* Navegação - Categorias do JSON */}
                <nav className="flex gap-6 mt-4 text-sm font-medium text-gray-600 overflow-x-auto">
                    <Link to="/catalogo" className="hover:text-primary whitespace-nowrap">
                        Todos
                    </Link>
                    {categories?.slice(0, 6).map((cat) => (
                        <Link
                            key={cat.id}
                            to={`/catalogo?categoria=${cat.slug}`}
                            className="hover:text-primary whitespace-nowrap"
                        >
                            {cat.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}