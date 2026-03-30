interface ProductScoresProps {
    ecoscore?: string;
    nutriscore?: string;
}

export default function ProductScores({ ecoscore, nutriscore }: ProductScoresProps) {
    const getScoreColor = (score?: string) => {
        switch (score?.toLowerCase()) {
            case 'a':
                return 'bg-green-500 text-white';
            case 'b':
                return 'bg-green-400 text-white';
            case 'c':
                return 'bg-yellow-400 text-dark';
            case 'd':
                return 'bg-orange-400 text-white';
            case 'e':
                return 'bg-red-500 text-white';
            default:
                return 'bg-gray-300 text-gray-600';
        }
    };

    const getScoreLabel = (type: string, score?: string) => {
        if (!score) return `${type}: N/A`;
        return `${type}: ${score.toUpperCase()}`;
    };

    return (
        <div className="flex gap-3">
            {nutriscore && (
                <div
                    className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(
                        nutriscore
                    )}`}
                    title="Nutri-Score: Avaliação nutricional (A = melhor, E = pior)"
                >
                    {getScoreLabel('Nutri-Score', nutriscore)}
                </div>
            )}
            {ecoscore && (
                <div
                    className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(
                        ecoscore
                    )}`}
                    title="Eco-Score: Impacto ambiental (A = melhor, E = pior)"
                >
                    {getScoreLabel('Eco-Score', ecoscore)}
                </div>
            )}
        </div>
    );
}