import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase/config/firebaseService';
import { auth } from '../../lib/firebase/config/authService';
import { onAuthStateChanged } from 'firebase/auth';

const CadastrarProduto = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState<any>(null);
    const [vendedorInfo, setVendedorInfo] = useState<any>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setVendedorInfo({
                    uid: currentUser.uid,
                    nome: currentUser.displayName || 'Vendedor',
                    email: currentUser.email
                });
            } else {
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        brand: '',
        category: '',
        price: '',
        comparePrice: '',
        stock: '',
        image: '',
        nutriscore: '',
        ecoscore: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        isFeatured: false
    });

    const categorias = [
        'Grãos', 'Massas', 'Bebidas', 'Laticínios', 'Carnes',
        'Hortifruti', 'Padaria', 'Limpeza', 'Higiene', 'Pet', 'Outros'
    ];

    const scores = ['A', 'B', 'C', 'D', 'E'];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const gerarId = () => {
        return Math.floor(Math.random() * 9000000000000 + 1000000000000).toString();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setMensagem({ tipo: 'erro', texto: 'Você precisa estar logado' });
            return;
        }

        setIsSubmitting(true);
        setMensagem({ tipo: '', texto: '' });

        try {
            if (!formData.name || !formData.price || !formData.stock) {
                setMensagem({ tipo: 'erro', texto: 'Preencha nome, preço e estoque' });
                setIsSubmitting(false);
                return;
            }

            const produto = {
                id: gerarId(),
                name: formData.name,
                description: formData.description,
                brand: formData.brand,
                category: formData.category,
                price: parseFloat(formData.price),
                comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
                stock: parseInt(formData.stock),
                image: formData.image || 'https://via.placeholder.com/400x400?text=Sem+Imagem',
                nutriscore: formData.nutriscore || null,
                ecoscore: formData.ecoscore || null,
                nutrition: formData.calories ? {
                    calories: parseFloat(formData.calories) || 0,
                    protein: parseFloat(formData.protein) || 0,
                    carbs: parseFloat(formData.carbs) || 0,
                    fat: parseFloat(formData.fat) || 0,
                    fiber: parseFloat(formData.fiber) || 0
                } : null,
                isFeatured: formData.isFeatured,

                vendedorId: user.uid,
                vendedorNome: vendedorInfo?.nome || 'Vendedor',
                vendedorEmail: user.email,

                criadoEm: serverTimestamp(),
                atualizadoEm: serverTimestamp(),
                ativo: true
            };

            const docRef = await addDoc(collection(db, 'products'), produto);

            console.log('✅ Produto criado:', docRef.id);
            setMensagem({ tipo: 'sucesso', texto: 'Produto cadastrado com sucesso!' });

            const confirmacao = window.confirm(
                `✅ Produto cadastrado com sucesso!\n\n` +
                `📦 ${formData.name}\n` +
                `💰 R$ ${formData.price}\n` +
                `📊 Estoque: ${formData.stock} unidades\n\n` +
                `Deseja cadastrar outro produto?`
            );

            if (confirmacao) {
                setFormData({
                    name: '',
                    description: '',
                    brand: '',
                    category: '',
                    price: '',
                    comparePrice: '',
                    stock: '',
                    image: '',
                    nutriscore: '',
                    ecoscore: '',
                    calories: '',
                    protein: '',
                    carbs: '',
                    fat: '',
                    fiber: '',
                    isFeatured: false
                });
                setMensagem({ tipo: '', texto: '' });
            } else {
                navigate('/vendedor/meus-produtos');
            }

        } catch (error) {
            console.error('Erro:', error);
            setMensagem({ tipo: 'erro', texto: 'Erro ao cadastrar produto' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return <div className="p-8">Carregando...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Cadastrar Produto</h1>
                    <p className="text-gray-600 mt-2">Vendedor: {vendedorInfo?.nome}</p>
                </div>

                {mensagem.texto && (
                    <div className={`mb-6 p-4 rounded-lg ${mensagem.tipo === 'erro'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                        {mensagem.texto}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg overflow-hidden">

                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full inline-flex items-center justify-center text-sm mr-2">1</span>
                            Informações Básicas
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome do Produto *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Ex: Arroz Parboilizado Tipo 1"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 resize-none"
                                    placeholder="Descreva o produto..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Marca
                                </label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Ex: Tio João"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Categoria
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 bg-white"
                                >
                                    <option value="">Selecione</option>
                                    {categorias.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full inline-flex items-center justify-center text-sm mr-2">2</span>
                            Preço e Estoque
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Preço (R$) *
                                </label>
                                <input
                                    type="text"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleNumberChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                                    placeholder="24.90"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Preço Comparativo (R$)
                                </label>
                                <input
                                    type="text"
                                    name="comparePrice"
                                    value={formData.comparePrice}
                                    onChange={handleNumberChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                                    placeholder="29.90"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estoque *
                                </label>
                                <input
                                    type="text"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleNumberChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                                    placeholder="50"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full inline-flex items-center justify-center text-sm mr-2">3</span>
                            Imagem do Produto
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Link da Imagem (URL)
                            </label>
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                                placeholder="https://exemplo.com/imagem.jpg"
                            />

                            {formData.image && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        className="w-32 h-32 object-cover rounded-lg border"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=Erro';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full inline-flex items-center justify-center text-sm mr-2">4</span>
                            Avaliações
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nutri-Score
                                </label>
                                <select
                                    name="nutriscore"
                                    value={formData.nutriscore}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 bg-white"
                                >
                                    <option value="">Selecione</option>
                                    {scores.map(score => (
                                        <option key={score} value={score}>Score {score}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Eco-Score
                                </label>
                                <select
                                    name="ecoscore"
                                    value={formData.ecoscore}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 bg-white"
                                >
                                    <option value="">Selecione</option>
                                    {scores.map(score => (
                                        <option key={score} value={score}>Score {score}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full inline-flex items-center justify-center text-sm mr-2">5</span>
                            Informação Nutricional (por porção)
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { name: 'calories', label: 'Calorias (kcal)' },
                                { name: 'protein', label: 'Proteínas (g)' },
                                { name: 'carbs', label: 'Carboidratos (g)' },
                                { name: 'fat', label: 'Gorduras (g)' },
                                { name: 'fiber', label: 'Fibras (g)' }
                            ].map((field) => (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {field.label}
                                    </label>
                                    <input
                                        type="text"
                                        name={field.name}
                                        value={formData[field.name as keyof typeof formData] as string}
                                        onChange={handleNumberChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                                        placeholder="0"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full inline-flex items-center justify-center text-sm mr-2">6</span>
                            Configurações
                        </h2>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleChange}
                                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                            />
                            <div>
                                <span className="font-medium text-gray-700">Produto em Destaque</span>
                                <p className="text-sm text-gray-500">Aparecerá na página inicial</p>
                            </div>
                        </label>
                    </div>

                    <div className="p-6 bg-gray-50 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/painel_vendedor')}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Cadastrando...
                                </>
                            ) : (
                                'Cadastrar Produto'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CadastrarProduto;