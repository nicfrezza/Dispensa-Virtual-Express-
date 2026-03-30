import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase/firebaseService';
import { useEffect, useState } from 'react';

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    comparePrice?: number;
    stock: number;
    image: string;
    description?: string;
    brand?: string;
    nutriscore?: string;
    ecoscore?: string;
    isFeatured?: boolean;
    vendedorId?: string;
    vendedorNome?: string;
    ativo?: boolean;
}




export const productService = {
    async getAll(filters?: { category?: string; search?: string }): Promise<Product[]> {
        try {
            let q = query(
                collection(db, 'products'),
                where('ativo', '==', true),
                where('stock', '>', 0)
            );

            const snapshot = await getDocs(q);
            let products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];

            if (filters?.category && filters.category !== 'all') {
                products = products.filter(p =>
                    p.category?.toLowerCase() === filters.category?.toLowerCase()
                );
            }

            if (filters?.search) {
                const searchLower = filters.search.toLowerCase();
                products = products.filter(p =>
                    p.name?.toLowerCase().includes(searchLower) ||
                    p.description?.toLowerCase().includes(searchLower) ||
                    p.brand?.toLowerCase().includes(searchLower)
                );
            }

            return products;
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            return [];
        }
    },

    async getFeatured(): Promise<Product[]> {
        try {
            const q = query(
                collection(db, 'products'),
                where('ativo', '==', true),
                where('isFeatured', '==', true),
                where('stock', '>', 0),
                limit(8)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
        } catch (error) {
            console.error('Erro ao buscar produtos em destaque:', error);
            return [];
        }
    },

    async getById(id: string): Promise<Product | null> {
        try {
            const q = query(collection(db, 'products'), where('id', '==', id));
            const snapshot = await getDocs(q);

            if (snapshot.empty) return null;

            return {
                id: snapshot.docs[0].id,
                ...snapshot.docs[0].data()
            } as Product;
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            return null;
        }
    },

    async getByVendedor(vendedorId: string): Promise<Product[]> {
        try {
            const q = query(
                collection(db, 'products'),
                where('vendedorId', '==', vendedorId),
                where('ativo', '==', true)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
        } catch (error) {
            console.error('Erro ao buscar produtos do vendedor:', error);
            return [];
        }
    }
};