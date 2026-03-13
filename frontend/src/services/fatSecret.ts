import axios from 'axios';


const fatSecretApi = axios.create({
    baseURL: 'https://platform.fatsecret.com/rest/server.api',
    timeout: 10000,
});

export interface FatSecretFood {
    food_id: string;
    food_name: string;
    food_type: string;
    brand_name?: string;
    food_url: string;
    servings: {
        serving: Array<{
            serving_id: string;
            serving_description: string;
            metric_serving_amount: string;
            metric_serving_unit: string;
            calories: string;
            carbohydrate: string;
            protein: string;
            fat: string;
            fiber?: string;
            sodium?: string;
        }>;
    };
}

export const fatSecretService = {
    // Buscar alimento por nome
    searchFood: async (query: string) => {
        // Isso requer OAuth - em produção use backend
        // Documentação: https://platform.fatsecret.com/api/Default.aspx?screen=rapih
        console.log('FatSecret search (requires OAuth):', query);
        return [];
    },

    // Obter detalhes de um alimento
    getFood: async (foodId: string) => {
        console.log('FatSecret get food (requires OAuth):', foodId);
        return null;
    },
};

