import axios from 'axios';

const offApi = axios.create({
    baseURL: 'https://world.openfoodfacts.org/api/v2',
    timeout: 15000,
    // REMOVIDO: headers customizados que causam erro CORS
});

// Tipos do Open Food Facts
export interface OFFProduct {
    code: string;
    product_name: string;
    brands: string;
    categories: string;
    image_url: string;
    image_small_url: string;
    nutriments: {
        energy_kcal_100g?: number;
        proteins_100g?: number;
        carbohydrates_100g?: number;
        fat_100g?: number;
        fiber_100g?: number;
        sodium_100g?: number;
    };
    product_quantity?: string;
    quantity?: string;
    packaging?: string;
    labels?: string;
    origins?: string;
    manufacturing_places?: string;
    ecoscore_grade?: string;
    nutriscore_grade?: string;
}

export interface OFFSearchResponse {
    count: number;
    page: number;
    products: OFFProduct[];
}

// Nosso formato interno
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    comparePrice?: number;
    images: string[];
    stock: number;
    sku: string;
    brand: string;
    category: {
        id: string;
        name: string;
        slug: string;
    };
    nutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber?: number;
        sodium?: number;
    };
    quantity: string;
    ecoscore?: string;
    nutriscore?: string;
    isFeatured: boolean;
}

// Transformar OFF -> Nosso formato
const transformProduct = (p: OFFProduct, index: number): Product => {
    // Gerar preço baseado na categoria (simulado)
    const basePrice = Math.random() * 30 + 5;
    const price = Math.round(basePrice * 100) / 100;

    // Categorias do OFF são strings separadas por vírgulas
    const categoryName = p.categories?.split(',')[0]?.trim() || 'Alimentos';

    return {
        id: p.code || String(index),
        name: p.product_name || 'Produto sem nome',
        description: `${p.brands || 'Marca desconhecida'} - ${p.quantity || 'Quantidade não especificada'}`,
        price: price,
        comparePrice: Math.round(price * 1.15 * 100) / 100,
        images: p.image_url ? [p.image_url, p.image_small_url] : ['https://placehold.co/400x400?text=Sem+Imagem'],
        stock: Math.floor(Math.random() * 100) + 10,
        sku: `OFF-${p.code || index}`,
        brand: p.brands?.split(',')[0] || 'Marca desconhecida',
        category: {
            id: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name: categoryName,
            slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        },
        nutrition: {
            calories: p.nutriments?.energy_kcal_100g || 0,
            protein: p.nutriments?.proteins_100g || 0,
            carbs: p.nutriments?.carbohydrates_100g || 0,
            fat: p.nutriments?.fat_100g || 0,
            fiber: p.nutriments?.fiber_100g,
            sodium: p.nutriments?.sodium_100g,
        },
        quantity: p.quantity || p.product_quantity || 'N/A',
        ecoscore: p.ecoscore_grade,
        nutriscore: p.nutriscore_grade,
        isFeatured: (p.nutriments?.energy_kcal_100g || 0) > 0 && !!p.image_url,
    };
};

export const openFoodFactsService = {
    // Buscar produtos por categoria/palavra-chave
    search: async (query: string = '', category?: string): Promise<Product[]> => {
        try {
            const params: any = {
                search_terms: query || category || 'rice',
                page_size: 24,
                json: 1,
                fields: 'code,product_name,brands,categories,image_url,image_small_url,nutriments,quantity,product_quantity,ecoscore_grade,nutriscore_grade',
            };

            if (category) {
                params.tagtype_0 = 'categories';
                params.tag_contains_0 = 'contains';
                params.tag_0 = category;
            }

            const { data } = await offApi.get<OFFSearchResponse>('/search', { params });

            // Filtrar produtos válidos (com nome e imagem)
            const validProducts = data.products
                .filter((p) => p.product_name && p.image_url)
                .slice(0, 12); // Limitar a 12 produtos

            console.log('Open Food Facts - Produtos encontrados:', validProducts.length);

            return validProducts.map((p, i) => transformProduct(p, i));
        } catch (error) {
            console.error('Error searching Open Food Facts:', error);
            return [];
        }
    },

    // Buscar por código de barras
    getByBarcode: async (code: string): Promise<Product | null> => {
        try {
            const { data } = await offApi.get<{ product: OFFProduct; status: number; code: string }>(
                `/product/${code}.json`,
                {
                    params: {
                        fields: 'code,product_name,brands,categories,image_url,image_small_url,nutriments,quantity,product_quantity,packaging,labels,origins,manufacturing_places,ecoscore_grade,nutriscore_grade',
                    },
                }
            );

            if (data.status !== 1 || !data.product) {
                console.log('Produto não encontrado na API');
                return null;
            }

            return transformProduct(data.product, 0);
        } catch (error) {
            console.error('Error fetching product by barcode:', error);
            return null;
        }
    },

    // Produtos em destaque
    getFeatured: async (): Promise<Product[]> => {
        try {
            // Buscar produtos populares
            const searches = ['coffee', 'chocolate', 'pasta', 'olive oil', 'milk', 'bread'];
            const randomSearch = searches[Math.floor(Math.random() * searches.length)];

            const products = await openFoodFactsService.search(randomSearch);

            // Filtrar apenas produtos com dados completos
            const featured = products
                .filter((p) => p.isFeatured && p.nutrition.calories > 0)
                .slice(0, 8);

            console.log('Featured products:', featured.length);

            return featured;
        } catch (error) {
            console.error('Error getting featured products:', error);
            return [];
        }
    },

    // Categorias populares
    getCategories: async () => {
        return [
            { id: 'beverages', name: 'Bebidas', slug: 'beverages' },
            { id: 'dairy', name: 'Laticínios', slug: 'dairy' },
            { id: 'snacks', name: 'Snacks', slug: 'snacks' },
            { id: 'cereals', name: 'Cereais', slug: 'cereals' },
            { id: 'condiments', name: 'Condimentos', slug: 'condiments' },
            { id: 'frozen', name: 'Congelados', slug: 'frozen' },
        ];
    },
};