import axios from 'axios';


export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    image: string;
    description?: string;
    brand?: string;
    comparePrice?: number;
    nutriscore?: string;
    ecoscore?: string;
    nutrition?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber?: number;
    };
    isFeatured?: boolean;
}

interface ProductsJSON {
    products: Product[];
}

// Cache local
let productsCache: Product[] | null = null;

export const productService = {
    // Carregar todos os produtos do JSON
    loadProducts: async (): Promise<Product[]> => {
        // Retornar cache se existir
        if (productsCache) {
            console.log('Usando cache de produtos:', productsCache.length);
            return productsCache;
        }

        try {
            console.log('Carregando produtos do JSON...');

            const { data } = await axios.get<ProductsJSON>('/data/products.json');

            // Verificar se data existe
            if (!data) {
                console.error('Resposta vazia do JSON');
                return [];
            }

            // Verificar se products existe e é array
            if (!data.products) {
                console.error('Propriedade "products" não encontrada no JSON:', data);
                return [];
            }

            if (!Array.isArray(data.products)) {
                console.error('"products" não é um array:', typeof data.products);
                return [];
            }

            // Validar cada produto
            const validProducts = data.products.filter((p, index) => {
                if (!p.id || !p.name || !p.price) {
                    console.warn(`Produto inválido no índice ${index}:`, p);
                    return false;
                }
                return true;
            });

            console.log('Produtos carregados:', validProducts.length);

            // Salvar no cache
            productsCache = validProducts;

            return validProducts;

        } catch (error: any) {
            console.error('Erro ao carregar produtos:', error.message);

            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            }

            return [];
        }
    },

    // Forçar recarregar (ignorar cache)
    reloadProducts: async (): Promise<Product[]> => {
        productsCache = null;
        return productService.loadProducts();
    },

    // Buscar todos (com filtros opcionais)
    getAll: async (filters?: { category?: string; search?: string }): Promise<Product[]> => {
        try {
            let products = await productService.loadProducts();

            // Se não carregou, retornar array vazio
            if (!products || products.length === 0) {
                console.warn('Nenhum produto carregado');
                return [];
            }

            // Filtrar por categoria
            if (filters?.category && filters.category !== 'all') {
                const categorySlug = filters.category.toLowerCase();
                products = products.filter(
                    (p) => p.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === categorySlug ||
                        p.category?.toLowerCase() === categorySlug
                );
            }

            // Filtrar por busca
            if (filters?.search) {
                const search = filters.search.toLowerCase();
                products = products.filter(
                    (p) =>
                        p.name?.toLowerCase().includes(search) ||
                        p.description?.toLowerCase().includes(search) ||
                        p.brand?.toLowerCase().includes(search) ||
                        p.category?.toLowerCase().includes(search)
                );
            }

            return products;
        } catch (error) {
            console.error('Erro em getAll:', error);
            return [];
        }
    },

    // Produtos em destaque
    getFeatured: async (): Promise<Product[]> => {
        try {
            const products = await productService.loadProducts();
            return products.filter((p) => p.isFeatured === true);
        } catch (error) {
            console.error('Erro em getFeatured:', error);
            return [];
        }
    },

    // Buscar por ID
    getById: async (id: string): Promise<Product | null> => {
        try {
            const products = await productService.loadProducts();
            return products.find((p) => p.id === id) || null;
        } catch (error) {
            console.error('Erro em getById:', error);
            return null;
        }
    },

    // Buscar por categoria
    getByCategory: async (category: string): Promise<Product[]> => {
        try {
            const products = await productService.loadProducts();
            return products.filter(
                (p) => p.category?.toLowerCase() === category.toLowerCase()
            );
        } catch (error) {
            console.error('Erro em getByCategory:', error);
            return [];
        }
    },

    // Obter categorias únicas
    getCategories: async () => {
        try {
            const products = await productService.loadProducts();

            if (!products || products.length === 0) {
                return [];
            }

            // Agrupar por categoria
            const categoryMap = new Map<string, number>();

            products.forEach((product) => {
                if (product.category) {
                    const count = categoryMap.get(product.category) || 0;
                    categoryMap.set(product.category, count + 1);
                }
            });

            // Transformar em array
            const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
                id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                name,
                slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                count,
            }));

            return categories.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Erro em getCategories:', error);
            return [];
        }
    },
};