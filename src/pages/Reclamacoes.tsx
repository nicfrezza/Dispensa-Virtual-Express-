import { useState, useEffect } from 'react';

interface FormData {
    titulo: string;
    descricao: string;
}


const AdicionarReclamacao = () => {
    const [formData, setFormData] = useState<FormData>({
        titulo: '',
        descricao: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };





    const handleSubmit = async (e: React.FormEvent) => {



        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('https://firestore.googleapis.com/v1/projects/dispensa-84b12/databases/(default)/documents/reclamacoes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fields: {
                        titulo: { stringValue: formData.titulo },
                        descricao: { stringValue: formData.descricao },
                        status: { stringValue: 'pendente' },
                        dataCriacao: { timestampValue: new Date().toISOString() }
                    }
                })
            });

            if (response.ok) {
                setIsSubmitted(true);
            } else {
                throw new Error('Erro ao enviar');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao enviar solicitação. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };





    return (
        <div className="p-4">
            {isSubmitted ? (
                <div className="text-center py-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Enviado com sucesso!</h2>
                    <p className="text-gray-600 mb-6">
                        Sua reclamação foi registrada. Nossa equipe irá analisar e responder o mais breve possível.
                    </p>
                    <button
                        onClick={() => setIsSubmitted(false)}
                        className="text-blue-500 hover:underline"
                    >
                        Enviar outra reclamação
                    </button>
                </div>
            ) : (
                <>
                    <h2 className="text-2xl font-bold mb-4">Adicionar Reclamação</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Título</label>
                            <input
                                type="text"
                                name="titulo"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Digite o título da reclamação"
                                value={formData.titulo}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descrição</label>
                            <textarea
                                name="descricao"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Descreva sua reclamação com detalhes"
                                rows={4}
                                value={formData.descricao}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition disabled:bg-gray-400"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Reclamação'}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}


export default AdicionarReclamacao;


