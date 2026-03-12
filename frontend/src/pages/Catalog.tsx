import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/Productcard.tsx';
import { productService } from '../services/productService';

const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'graos', name: 'Grãos' },
    { id: 'laticinios', name: 'Laticínios' },
    { id: 'bebidas', name: 'Bebidas' },
    { id: 'snacks', name: 'Snacks' },
    { id: 'condimentos', name: 'Condimentos' },
];

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

    // Mock de produtos para teste
    const { data: products, isLoading } = useQuery({
        queryKey: ['products', selectedCategory, selectedSort, searchQuery],
        queryFn: async () => {
            // Simulando delay de API
            await new Promise(resolve => setTimeout(resolve, 500));

            const allProducts = [
                {
                    id: '1',
                    name: 'Arroz Integral Tipo 1 - 5kg',
                    description: 'Arroz integral de alta qualidade',
                    price: 28.90,
                    comparePrice: 32.90,
                    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'],
                    stock: 50,
                    category: { id: 'graos', name: 'Grãos' },
                },
                {
                    id: '2',
                    name: 'Café em Grãos Especial - 1kg',
                    description: 'Café 100% arábica',
                    price: 45.90,
                    comparePrice: 54.90,
                    images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'],
                    stock: 30,
                    category: { id: 'bebidas', name: 'Bebidas' },
                },
                {
                    id: '3',
                    name: 'Azeite de Oliva Extra Virgem - 500ml',
                    description: 'Azeite importado',
                    price: 32.50,
                    images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400'],
                    stock: 20,
                    category: { id: 'condimentos', name: 'Condimentos' },
                },
                {
                    id: '4',
                    name: 'Mel Orgânico - 300g',
                    description: 'Mel puro de flores silvestres',
                    price: 24.90,
                    comparePrice: 29.90,
                    images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400'],
                    stock: 15,
                    category: { id: 'doces', name: 'Doces' },
                },
                {
                    id: '5',
                    name: 'Feijão Carioca - 1kg',
                    description: 'Feijão selecionado',
                    price: 8.90,
                    images: ['https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=400'],
                    stock: 100,
                    category: { id: 'graos', name: 'Grãos' },
                },
                {
                    id: '6',
                    name: 'Leite Integral UHT - 1L',
                    description: 'Leite longa vida',
                    price: 4.99,
                    comparePrice: 6.50,
                    images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'],
                    stock: 200,
                    category: { id: 'laticinios', name: 'Laticínios' },
                },
                {
                    id: '7',
                    name: 'Pão de Forma Integral - 500g',
                    description: 'Pão sem conservantes',
                    price: 6.90,
                    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'],
                    stock: 40,
                    category: { id: 'padaria', name: 'Padaria' },
                },
                {
                    id: '8',
                    name: 'Chocolate Amargo 70% - 100g',
                    description: 'Cacau selecionado',
                    price: 12.90,
                    comparePrice: 15.90,
                    images: ['https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400'],
                    stock: 60,
                    category: { id: 'doces', name: 'Doces' },
                },
            ];

            let filtered = allProducts;

            // Filtrar por categoria
            if (selectedCategory !== 'all') {
                filtered = filtered.filter(p => p.category.id === selectedCategory);
            }

            // Filtrar por busca
            if (searchQuery) {
                filtered = filtered.filter(p =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.description.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Ordenar
            switch (selectedSort) {
                case 'price-asc':
                    filtered.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    filtered.sort((a, b) => b.price - a.price);
                    break;
                case 'name':
                    filtered.sort((a, b) => a.name.localeCompare(b.name));
                    break;
            }

            return filtered;
        },
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
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`block w-full text-left px-3 py-2 rounded-lg transition ${selectedCategory === cat.id
                                        ? 'bg-primary text-white'
                                        : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Faixa de Preço */}
                    <div>
                        <h4 className="font-medium mb-3">Preço</h4>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded text-primary" />
                                <span className="text-sm">Até R$ 20</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded text-primary" />
                                <span className="text-sm">R$ 20 - R$ 50</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded text-primary" />
                                <span className="text-sm">Acima de R$ 50</span>
                            </label>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <main className="flex-1">
                {/* Header do Catálogo */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-dark">
                            {selectedCategory === 'all' ? 'Todos os Produtos' :
                                categories.find(c => c.id === selectedCategory)?.name}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {products?.length || 0} produtos encontrados
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
                ) : products?.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Nenhum produto encontrado</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {products?.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}