import axios from 'axios';

const fakeApi = axios.create({
    baseURL: 'https://fakestoreapi.com',
});

export interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating: {
        rate: number;
        count: number;
    };
}

export const productService = {
    getAll: async () => {
        const { data } = await fakeApi.get<Product[]>('/products');
        // Transformar para nosso formato
        return data.map(p => ({
            id: String(p.id),
            name: p.title,
            description: p.description,
            price: p.price,
            comparePrice: p.price * 1.2,
            images: [p.image],
            stock: Math.floor(Math.random() * 50) + 10,
            sku: `PROD-${p.id}`,
            category: {
                id: p.category,
                name: p.category.charAt(0).toUpperCase() + p.category.slice(1),
                slug: p.category,
            },
            isFeatured: p.rating.rate > 4,
        }));
    },

    getFeatured: async () => {
        const products = await productService.getAll();
        return products.filter(p => p.isFeatured).slice(0, 4);
    },

    getById: async (id: string) => {
        const { data } = await fakeApi.get<Product>(`/products/${id}`);
        return {
            id: String(data.id),
            name: data.title,
            description: data.description,
            price: data.price,
            comparePrice: data.price * 1.2,
            images: [data.image],
            stock: Math.floor(Math.random() * 50) + 10,
            sku: `PROD-${data.id}`,
            category: {
                id: data.category,
                name: data.category.charAt(0).toUpperCase() + data.category.slice(1),
                slug: data.category,
            },
            isFeatured: data.rating.rate > 4,
        };
    },
};