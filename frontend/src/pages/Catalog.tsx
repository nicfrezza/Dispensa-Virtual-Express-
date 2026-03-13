import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/Productcard';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';

const sortOptions = [
    { value: 'relevance', label: 'Relevância' },
    { value: 'price-asc', label: 'Menor preço' },
    { value: 'price-desc', label: 'Maior preço' },
    { value: 'name', label: 'Nome' },
];

export default function Catalog() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);

    const selectedCategory = searchParams.get('categoria') || 'all';
    const selectedSort = searchParams.get('ordenar') || 'relevance';
    const searchQuery = searchParams.get('busca') || '';

    // Buscar categorias do JSON
    const { data: categories, isLoading: loadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getAll,
    });

    // Buscar produtos do JSON
    const { data: products, isLoading: loadingProducts } = useQuery({
        queryKey: ['products', selectedCategory, searchQuery],
        queryFn: () =>
            productService.getAll({
                category: selectedCategory === 'all' ? undefined : selectedCategory,
                search: searchQuery || undefined,
            }),
    });

    // Ordenar produtos
    const sortedProducts = [...(products || [])].sort((a, b) => {
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

    const isLoading = loadingCategories || loadingProducts;

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar de Filtros */}
            <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filtros
                    </h3>

                    {/* Categorias */}
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
                            {categories?.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.slug)}
                                    className={`block w-full text-left px-3 py-2 rounded-lg transition flex justify-between items-center ${selectedCategory === cat.slug
                                        ? 'bg-primary text-white'
                                        : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    <span>{cat.name}</span>
                                    <span className={`text-xs ${selectedCategory === cat.slug ? 'text-white/70' : 'text-gray-400'}`}>
                                        {cat.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <main className="flex-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-dark">
                            {selectedCategory === 'all'
                                ? 'Todos os Produtos'
                                : categories?.find((c) => c.slug === selectedCategory)?.name || 'Categoria'}
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

                {/* Grid de Produtos */}
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : sortedProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Nenhum produto encontrado</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {sortedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}