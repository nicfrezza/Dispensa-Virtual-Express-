import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Truck, Shield } from 'lucide-react';
import ProductCard from '../components/Productcard';
import { productService } from '../services/productService';

export default function Home() {
    const {
        data: featuredProducts,
        isLoading,
        error,
        isError,
    } = useQuery({
        queryKey: ['featured-products'],
        queryFn: productService.getFeatured,
        retry: 2,
        staleTime: 1000 * 60 * 5, // 5 minutos
    });

    // Debug
    console.log('Home - isLoading:', isLoading);
    console.log('Home - isError:', isError);
    console.log('Home - error:', error);
    console.log('Home - featuredProducts:', featuredProducts);

    if (isError) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 mb-2">Erro ao carregar produtos</p>
                <p className="text-sm text-gray-500">
                    {error instanceof Error ? error.message : 'Erro desconhecido'}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Hero */}
            <section className="relative bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-8 md:p-12">
                <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-dark mb-4">
                        Sua dispensa sempre cheia, sem sair de casa
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                        Produtos de qualidade, preços justos e entrega rápida.
                        Monte seu kit mensal e economize até 15%.
                    </p>
                    <Link
                        to="/catalogo"
                        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition"
                    >
                        Ver Produtos
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Benefícios */}
            <section className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Kits Inteligentes</h3>
                        <p className="text-sm text-gray-500">Monte combos personalizados</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                        <Truck className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Frete Grátis</h3>
                        <p className="text-sm text-gray-500">Em compras acima de R$ 150</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Qualidade Garantida</h3>
                        <p className="text-sm text-gray-500">Produtos selecionados</p>
                    </div>
                </div>
            </section>

            {/* Produtos em Destaque */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Produtos em Destaque</h2>
                    <Link to="/catalogo" className="text-primary hover:underline">
                        Ver todos
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : featuredProducts?.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <p className="text-gray-500">Nenhum produto encontrado</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-primary hover:underline"
                        >
                            Recarregar
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {featuredProducts?.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}