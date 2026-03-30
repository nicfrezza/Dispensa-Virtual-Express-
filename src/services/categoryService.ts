import { productService } from './productService';

export interface Category {
    id: string;
    name: string;
    slug: string;
    count?: number;
}

export const categoryService = {
    getAll: async (): Promise<Category[]> => {
        const products = await productService.loadProducts();

        const categoryMap = new Map<string, number>();

        products.forEach((product) => {
            const count = categoryMap.get(product.category) || 0;
            categoryMap.set(product.category, count + 1);
        });

        const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
            id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            count,
        }));

        return categories.sort((a, b) => a.name.localeCompare(b.name));
    },

    getBySlug: async (slug: string): Promise<Category | null> => {
        const categories = await categoryService.getAll();
        return categories.find((c) => c.slug === slug) || null;
    },
};