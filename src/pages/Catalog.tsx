import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Loader2 } from 'lucide-react';
import ProductCard from '../components/Productcard';
import { productService, Product } from '../services/productService';

const sortOptions = [
    { value: 'relevance', label: 'Relevância' },
    { value: 'price-asc', label: 'Menor preço' },
    { value: 'price-desc', label: 'Maior preço' },
    { value: 'name', label: 'Nome' },
];

const categories = [
    { id: 'graos', name: 'Grãos', slug: 'graos' },
    { id: 'massas', name: 'Massas', slug: 'massas' },
    { id: 'bebidas', name: 'Bebidas', slug: 'bebidas' },
    { id: 'laticinios', name: 'Laticínios', slug: 'laticinios' },
    { id: 'carnes', name: 'Carnes', slug: 'carnes' },
    { id: 'hortifruti', name: 'Hortifruti', slug: 'hortifruti' },
    { id: 'padaria', name: 'Padaria', slug: 'padaria' },
    { id: 'limpeza', name: 'Limpeza', slug: 'limpeza' },
    { id: 'higiene', name: 'Higiene', slug: 'higiene' },
    { id: 'pet', name: 'Pet', slug: 'pet' },
    { id: 'outros', name: 'Outros', slug: 'outros' },
];

export default function Catalog() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const selectedCategory = searchParams.get('categoria') || 'all';
    const selectedSort = searchParams.get('ordenar') || 'relevance';
    const searchQuery = searchParams.get('busca') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');

            try {
                const data = await productService.getAll({
                    category: selectedCategory === 'all' ? undefined : selectedCategory,
                    search: searchQuery || undefined,
                });
                setProducts(data);
            } catch (err) {
                setError('Erro ao carregar produtos');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [selectedCategory, searchQuery]);

    const sortedProducts = [...products].sort((a, b) => {
        switch (selectedSort) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });

    const handleCategoryChange = (categoryId: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (categoryId === 'all') {
            newParams.delete('categoria');
        } else {
            newParams.set('categoria', categoryId);
        }
        setSearchParams(newParams);
    };

    const handleSortChange = (sort: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('ordenar', sort);
        setSearchParams(newParams);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filtros
                    </h3>

                    <div className="mb-6">
                        <h4 className="font-medium mb-3">Categorias</h4>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleCategoryChange('all')}
                                className={`block w-full text-left px-3 py-2 rounded-lg transition ${selectedCategory === 'all'
                                    ? 'bg-primary text-white'
                                    : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                            >
                                Todas
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.slug)}
                                    className={`block w-full text-left px-3 py-2 rounded-lg transition ${selectedCategory === cat.slug
                                        ? 'bg-primary text-white'
                                        : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {selectedCategory === 'all'
                                ? 'Todos os Produtos'
                                : categories.find((c) => c.slug === selectedCategory)?.name || 'Categoria'}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {sortedProducts.length} produtos encontrados
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filtros
                        </button>

                        <select
                            value={selectedSort}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                        >
                            {sortOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500">
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 text-primary hover:underline"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : sortedProducts.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <p className="text-gray-500 mb-2">Nenhum produto encontrado</p>
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    const newParams = new URLSearchParams();
                                    setSearchParams(newParams);
                                }}
                                className="text-primary hover:underline"
                            >
                                Limpar filtros
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {sortedProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={{
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.image,
                                    category: product.category,
                                    comparePrice: product.comparePrice,
                                    brand: product.brand
                                }}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}