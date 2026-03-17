interface NutritionLabelProps {
    nutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber?: number;
        sodium?: number;
    };
    quantity?: string;
}

export default function NutritionLabel({ nutrition, quantity }: NutritionLabelProps) {
    const { calories, protein, carbs, fat, fiber, sodium } = nutrition;

    return (
        <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                🥗 Informação Nutricional
                <span className="text-sm font-normal text-gray-500">
                    (por 100g)
                </span>
            </h3>

            {quantity && (
                <p className="text-sm text-gray-600 mb-4">
                    Embalagem: {quantity}
                </p>
            )}

            <div className="space-y-3">
                {/* Calorias - Destaque */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="font-medium">Calorias</span>
                    <span className="text-xl font-bold text-primary">
                        {Math.round(calories)} kcal
                    </span>
                </div>

                {/* Macronutrientes */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                            {protein.toFixed(1)}g
                        </p>
                        <p className="text-xs text-blue-600">Proteínas</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">
                            {carbs.toFixed(1)}g
                        </p>
                        <p className="text-xs text-yellow-600">Carboidratos</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">
                            {fat.toFixed(1)}g
                        </p>
                        <p className="text-xs text-red-600">Gorduras</p>
                    </div>
                </div>

                {/* Extras */}
                {(fiber !== undefined || sodium !== undefined) && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        {fiber !== undefined && (
                            <div className="flex justify-between p-2 bg-green-50 rounded">
                                <span className="text-sm text-green-700">Fibra</span>
                                <span className="font-medium text-green-700">
                                    {fiber.toFixed(1)}g
                                </span>
                            </div>
                        )}
                        {sodium !== undefined && (
                            <div className="flex justify-between p-2 bg-orange-50 rounded">
                                <span className="text-sm text-orange-700">Sódio</span>
                                <span className="font-medium text-orange-700">
                                    {sodium.toFixed(1)}g
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Fonte */}
            <p className="text-xs text-gray-400 mt-4 text-center">
                Dados fornecidos por Open Food Facts
            </p>
        </div>
    );
}