import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/config';
import emailjs from '@emailjs/browser';


const FormularioCadastroVendedor = () => {
    const [formData, setFormData] = useState({
        nomeResponsavel: '',
        email: '',
        telefone: '',
        nomeEmpresa: '',
        cnpj: '',
        tipoProduto: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        descricao: ''
    });

    const [isLoadingCep, setIsLoadingCep] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

    useEffect(() => {
        const fetchCepData = async () => {
            const cepLimpo = formData.cep.replace(/\D/g, '');

            if (cepLimpo.length === 8) {
                setIsLoadingCep(true);
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
                    const data = await response.json();

                    if (!data.erro) {
                        setFormData(prev => ({
                            ...prev,
                            cidade: data.localidade,
                            estado: data.uf,
                            endereco: data.logradouro ? `${data.logradouro}` : prev.endereco
                        }));
                    }
                } catch (error) {
                    console.error('Erro ao buscar CEP:', error);
                } finally {
                    setIsLoadingCep(false);
                }
            }
        };

        fetchCepData();
    }, [formData.cep]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const formatCep = (value: string) => {
        return value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
    };

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCep(e.target.value);
        setFormData(prev => ({ ...prev, cep: formatted }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMensagem({ tipo: '', texto: '' });

        try {
            console.log('📝 Salvando solicitação...', formData);
            const user = auth.currentUser;


            const payload = {
                userId: user?.uid,
                dadosEmpresa: {
                    nomeResponsavel: formData.nomeResponsavel,
                    email: formData.email,
                    telefone: formData.telefone,
                    nomeEmpresa: formData.nomeEmpresa,
                    cnpj: formData.cnpj,
                    tipoProduto: formData.tipoProduto,
                    endereco: formData.endereco,
                    cidade: formData.cidade,
                    estado: formData.estado,
                    cep: formData.cep,
                    descricao: formData.descricao
                },
                status: 'pendente',
                dataCriacao: new Date().toISOString(),
                historico: [{
                    acao: 'criado',
                    data: new Date().toISOString(),
                    observacao: 'Solicitação criada via formulário'
                }]
            };

            const docRef = await addDoc(collection(db, 'solicitacoes'), payload);
            console.log('✅ Salvo com ID:', docRef.id, 'UserID:', user.uid);

            console.log('✅ Documento criado com ID:', docRef.id);

            setIsSubmitted(true);

        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao enviar');
        } finally {
            setIsSubmitting(false);
        }
    };



    const estados = [
        { sigla: 'AC', nome: 'Acre' },
        { sigla: 'AL', nome: 'Alagoas' },
        { sigla: 'AP', nome: 'Amapá' },
        { sigla: 'AM', nome: 'Amazonas' },
        { sigla: 'BA', nome: 'Bahia' },
        { sigla: 'CE', nome: 'Ceará' },
        { sigla: 'DF', nome: 'Distrito Federal' },
        { sigla: 'ES', nome: 'Espírito Santo' },
        { sigla: 'GO', nome: 'Goiás' },
        { sigla: 'MA', nome: 'Maranhão' },
        { sigla: 'MT', nome: 'Mato Grosso' },
        { sigla: 'MS', nome: 'Mato Grosso do Sul' },
        { sigla: 'MG', nome: 'Minas Gerais' },
        { sigla: 'PA', nome: 'Pará' },
        { sigla: 'PB', nome: 'Paraíba' },
        { sigla: 'PR', nome: 'Paraná' },
        { sigla: 'PE', nome: 'Pernambuco' },
        { sigla: 'PI', nome: 'Piauí' },
        { sigla: 'RJ', nome: 'Rio de Janeiro' },
        { sigla: 'RN', nome: 'Rio Grande do Norte' },
        { sigla: 'RS', nome: 'Rio Grande do Sul' },
        { sigla: 'RO', nome: 'Rondônia' },
        { sigla: 'RR', nome: 'Roraima' },
        { sigla: 'SC', nome: 'Santa Catarina' },
        { sigla: 'SP', nome: 'São Paulo' },
        { sigla: 'SE', nome: 'Sergipe' },
        { sigla: 'TO', nome: 'Tocantins' }
    ];

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Solicitação Enviada!</h2>
                    <p className="text-gray-600 mb-6">
                        Obrigado por enviar sua solicitação. Nossa equipe irá analisar seus dados e você receberá um retorno no email cadastrado em até 48 horas úteis.
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-green-800">
                            <strong>Email de confirmação enviado para:</strong><br />
                            {formData.email}
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Voltar para Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-8 py-6">
                    <h2 className="text-3xl font-bold text-white">Cadastro de Empresa</h2>
                    <p className="text-green-100 mt-2">Junte-se à nossa plataforma de alimentos e produtos de limpeza</p>
                </div>

                {mensagem.texto && (
                    <div className={`m-6 p-4 rounded-lg ${mensagem.tipo === 'erro' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                        {mensagem.texto}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b-2 border-green-200 pb-2 flex items-center gap-2">
                            <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                            Dados do Responsável
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="nomeResponsavel" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome Completo <span className="text-green-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="nomeResponsavel"
                                    name="nomeResponsavel"
                                    required
                                    value={formData.nomeResponsavel}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-green-300"
                                    placeholder="Nome do responsável legal"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-green-600">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="empresa@email.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Telefone/WhatsApp <span className="text-green-600">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="telefone"
                                    name="telefone"
                                    required
                                    value={formData.telefone}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b-2 border-green-200 pb-2 flex items-center gap-2">
                            <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                            Dados da Empresa
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label htmlFor="nomeEmpresa" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome da Empresa <span className="text-green-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="nomeEmpresa"
                                    name="nomeEmpresa"
                                    required
                                    value={formData.nomeEmpresa}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="Razão Social ou Nome Fantasia"
                                />
                            </div>

                            <div>
                                <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
                                    CNPJ <span className="text-green-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="cnpj"
                                    name="cnpj"
                                    required
                                    value={formData.cnpj}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="00.000.000/0000-00"
                                />
                            </div>

                            <div>
                                <label htmlFor="tipoProduto" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Produto <span className="text-green-600">*</span>
                                </label>
                                <select
                                    id="tipoProduto"
                                    name="tipoProduto"
                                    required
                                    value={formData.tipoProduto}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                                >
                                    <option value="">Selecione uma categoria</option>
                                    <option value="alimentos">Alimentos e Bebidas</option>
                                    <option value="limpeza">Produtos de Limpeza</option>
                                    <option value="ambos">Alimentos e Limpeza</option>
                                    <option value="outros">Outros</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b-2 border-green-200 pb-2 flex items-center gap-2">
                            <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                            Endereço Comercial
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                                    CEP <span className="text-green-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="cep"
                                    name="cep"
                                    required
                                    value={formData.cep}
                                    onChange={handleCepChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="00000-000"
                                    maxLength={9}
                                />
                                {isLoadingCep && (
                                    <div className="absolute right-3 top-8">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
                                    Endereço <span className="text-green-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="endereco"
                                    name="endereco"
                                    required
                                    value={formData.endereco}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="Rua, número, complemento"
                                />
                            </div>

                            <div>
                                <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                                    Cidade <span className="text-green-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="cidade"
                                    name="cidade"
                                    required
                                    value={formData.cidade}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50"
                                    placeholder="Cidade"
                                    readOnly={!!formData.cidade}
                                />
                            </div>

                            <div>
                                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado <span className="text-green-600">*</span>
                                </label>
                                <select
                                    id="estado"
                                    name="estado"
                                    required
                                    value={formData.estado}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                                >
                                    <option value="">Selecione</option>
                                    {estados.map(estado => (
                                        <option key={estado.sigla} value={estado.sigla}>
                                            {estado.nome} ({estado.sigla})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            * Digite o CEP para preenchimento automático da cidade e estado
                        </p>
                    </div>

                    <div>
                        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição da Empresa
                        </label>
                        <textarea
                            id="descricao"
                            name="descricao"
                            rows={3}
                            value={formData.descricao}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                            placeholder="Conte um pouco sobre sua empresa, principais produtos, diferenciais..."
                        />
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="termos"
                                required
                                className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <label htmlFor="termos" className="text-sm text-gray-600">
                                Concordo com os <a href="#" className="text-green-600 hover:underline font-medium">Termos de Uso</a> e
                                <a href="#" className="text-green-600 hover:underline font-medium"> Política de Privacidade</a> da plataforma
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-600 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Enviando...
                                </>
                            ) : (
                                'Enviar Solicitação de Cadastro'
                            )}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            Após envio, nossa equipe analisará seu cadastro em até 48h úteis
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormularioCadastroVendedor;