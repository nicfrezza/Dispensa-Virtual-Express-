import { useState } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save } from 'lucide-react';

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [user, setUser] = useState({
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '(11) 99999-9999',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
        memberSince: 'Janeiro 2024',
    });

    const [addresses] = useState([
        {
            id: '1',
            street: 'Rua das Flores, 123',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01001-000',
            isDefault: true,
        },
        {
            id: '2',
            street: 'Av. Paulista, 1000, Apto 42',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-100',
            isDefault: false,
        },
    ]);

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        setIsEditing(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Meu Perfil</h1>
                <p className="text-gray-500">Gerencie suas informações e endereços</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Card do Usuário */}
                    <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                        <div className="relative inline-block mb-4">
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-24 h-24 rounded-full object-cover"
                            />
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <h2 className="font-bold text-lg">{user.name}</h2>
                        <p className="text-sm text-gray-500">Cliente desde {user.memberSince}</p>
                    </div>

                    {/* Menu */}
                    <nav className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <a href="#dados" className="block px-4 py-3 bg-primary/5 text-primary font-medium border-l-4 border-primary">
                            Dados Pessoais
                        </a>
                        <a href="#enderecos" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 border-l-4 border-transparent">
                            Endereços
                        </a>
                        <a href="/pedidos" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 border-l-4 border-transparent">
                            Meus Pedidos
                        </a>
                        <a href="#preferencias" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 border-l-4 border-transparent">
                            Preferências
                        </a>
                    </nav>
                </div>

                {/* Conteúdo Principal */}
                <div className="md:col-span-2 space-y-6">
                    {/* Dados Pessoais */}
                    <section id="dados" className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Dados Pessoais
                            </h3>
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                disabled={isSaving}
                                className="flex items-center gap-2 text-primary hover:bg-primary/10 px-3 py-1 rounded-lg transition"
                            >
                                {isEditing ? (
                                    isSaving ? (
                                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Salvar
                                        </>
                                    )
                                ) : (
                                    'Editar'
                                )}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Nome completo</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={user.name}
                                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    />
                                ) : (
                                    <p className="text-dark">{user.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    E-mail
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={user.email}
                                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    />
                                ) : (
                                    <p className="text-dark">{user.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    Telefone
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={user.phone}
                                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    />
                                ) : (
                                    <p className="text-dark">{user.phone}</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Endereços */}
                    <section id="enderecos" className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                Meus Endereços
                            </h3>
                            <button className="text-primary hover:underline text-sm">
                                + Adicionar novo
                            </button>
                        </div>

                        <div className="space-y-4">
                            {addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className={`p-4 rounded-lg border-2 ${address.isDefault ? 'border-primary bg-primary/5' : 'border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium">{address.street}</p>
                                            <p className="text-sm text-gray-600">
                                                {address.neighborhood} - {address.city}/{address.state}
                                            </p>
                                            <p className="text-sm text-gray-500">CEP: {address.zipCode}</p>
                                        </div>
                                        {address.isDefault && (
                                            <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                                                Padrão
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-3 mt-3">
                                        <button className="text-sm text-primary hover:underline">
                                            Editar
                                        </button>
                                        {!address.isDefault && (
                                            <>
                                                <span className="text-gray-300">|</span>
                                                <button className="text-sm text-primary hover:underline">
                                                    Definir como padrão
                                                </button>
                                                <span className="text-gray-300">|</span>
                                                <button className="text-sm text-danger hover:underline">
                                                    Excluir
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Estatísticas */}
                    <section className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-bold mb-4">Resumo da Conta</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-primary">12</p>
                                <p className="text-sm text-gray-600">Pedidos</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-primary">R$ 1.240</p>
                                <p className="text-sm text-gray-600">Economizado</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-primary">3</p>
                                <p className="text-sm text-gray-600">Avaliações</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}