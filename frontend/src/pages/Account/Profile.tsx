import { useState, useEffect, useRef } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Camera,
    Save,
    LogOut,
    Package,
    Heart,
    Star,
    ChevronRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Edit3,
    Plus,
    Trash2,
    Home,
    Briefcase
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import {
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import {
    doc,
    getDoc,
    updateDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { auth, db, storage } from '../../lib/config';
// Tipos
interface Address {
    id: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
    type: 'home' | 'work' | 'other';
}

interface UserData {
    name: string;
    email: string;
    phone: string;
    avatar: string;
    memberSince: string;
    addresses: Address[];
}

export default function Profile() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estados
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'data' | 'addresses' | 'orders'>('data');
    const [isEditing, setIsEditing] = useState(false);

    const [userData, setUserData] = useState<UserData>({
        name: '',
        email: '',
        phone: '',
        avatar: '',
        memberSince: '',
        addresses: []
    });

    const [editForm, setEditForm] = useState({
        name: '',
        phone: ''
    });

    // Estatísticas
    const [stats, setStats] = useState({
        orders: 0,
        saved: 0,
        reviews: 0
    });

    // Carregar dados do usuário
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate('/login');
                return;
            }

            try {
                // Buscar dados do Firestore
                const userDocRef = doc(db, 'users', user.uid);
                const userDocsSnap = await getDoc(userDocRef);

                if (userDocsSnap.exists()) {
                    const data = userDocsSnap.data();
                    const userInfo: UserData = {
                        name: data.name || user.displayName || 'Usuário',
                        email: user.email || '',
                        phone: data.phone || '',
                        avatar: data.avatar || user.photoURL || 'https://ui-avatars.com/api/?name=User&background=random',
                        memberSince: data.createdAt?.toDate?.()
                            ? new Date(data.createdAt.toDate()).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                            : new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
                        addresses: data.addresses || []
                    };

                    setUserData(userInfo);
                    setEditForm({
                        name: userInfo.name,
                        phone: userInfo.phone
                    });

                    // Buscar estatísticas
                    await loadStats(user.uid);
                } else {
                    // Criar documento se não existir
                    const newUserData = {
                        name: user.displayName || '',
                        email: user.email,
                        phone: '',
                        avatar: user.photoURL || '',
                        createdAt: new Date(),
                        addresses: []
                    };
                    await setDoc(userDocRef, newUserData);
                    setUserData({
                        ...newUserData,
                        memberSince: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
                        addresses: []
                    } as UserData);
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                showMessage('error', 'Erro ao carregar dados do perfil');
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [auth, db, navigate]);

    const loadStats = async (userId: string) => {
        try {
            // Pedidos
            const ordersQuery = query(collection(db, 'orders'), where('userId', '==', userId));
            const ordersSnap = await getDocs(ordersQuery);

            // Favoritos (simulado)
            const savedQuery = query(collection(db, 'favorites'), where('userId', '==', userId));
            const savedSnap = await getDocs(savedQuery);

            // Avaliações
            const reviewsQuery = query(collection(db, 'reviews'), where('userId', '==', userId));
            const reviewsSnap = await getDocs(reviewsQuery);

            setStats({
                orders: ordersSnap.size,
                saved: savedSnap.size,
                reviews: reviewsSnap.size
            });
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    // Salvar edição
    const handleSave = async () => {
        if (!auth.currentUser) return;

        setSaving(true);
        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);

            await updateDoc(userRef, {
                name: editForm.name,
                phone: editForm.phone,
                updatedAt: new Date()
            });

            // Atualizar displayName no Auth
            await updateProfile(auth.currentUser, {
                displayName: editForm.name
            });

            setUserData(prev => ({
                ...prev,
                name: editForm.name,
                phone: editForm.phone
            }));

            setIsEditing(false);
            showMessage('success', 'Dados atualizados com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            showMessage('error', 'Erro ao salvar alterações');
        } finally {
            setSaving(false);
        }
    };

    // Upload de imagem
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !auth.currentUser) return;

        setUploadingImage(true);
        try {
            const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // Atualizar Firestore
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, { avatar: downloadURL });

            // Atualizar Auth
            await updateProfile(auth.currentUser, { photoURL: downloadURL });

            setUserData(prev => ({ ...prev, avatar: downloadURL }));
            showMessage('success', 'Foto atualizada!');
        } catch (error) {
            console.error('Erro ao upload:', error);
            showMessage('error', 'Erro ao atualizar foto');
        } finally {
            setUploadingImage(false);
        }
    };

    // Logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            showMessage('error', 'Erro ao sair');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-gray-500">Carregando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header com Cover */}
            <div className="bg-gradient-to-r from-primary to-secondary h-48 relative">
                <div className="absolute inset-0 bg-black/10" />
                <div className="container mx-auto px-4 h-full flex items-end pb-16 relative">
                    <button
                        onClick={handleLogout}
                        className="absolute top-4 right-4 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full backdrop-blur-sm transition"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-12 relative z-10">
                {/* Card do Perfil */}
                <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                                <img
                                    src={userData.avatar}
                                    alt={userData.name}
                                    className="w-full h-full object-cover"
                                />
                                {uploadingImage && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition disabled:opacity-50"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
                            <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                                <Mail className="w-4 h-4" />
                                {userData.email}
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                                Cliente desde {userData.memberSince}
                            </p>
                        </div>

                        {/* Estatísticas */}
                        <div className="flex gap-6 md:gap-8">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary">{stats.orders}</p>
                                <p className="text-xs text-gray-500">Pedidos</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary">{stats.saved}</p>
                                <p className="text-xs text-gray-500">Favoritos</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary">{stats.reviews}</p>
                                <p className="text-xs text-gray-500">Avaliações</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mensagens */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5" />
                        ) : (
                            <AlertCircle className="w-5 h-5" />
                        )}
                        {message.text}
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white  text-black rounded-2xl shadow-sm p-2 mb-6 flex gap-2">
                    {[
                        { id: 'data', label: 'Dados Pessoais', icon: User },
                        { id: 'addresses', label: 'Endereços', icon: MapPin },
                        { id: 'orders', label: 'Pedidos', icon: Package }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${activeTab === tab.id
                                ? 'bg-primary text-red shadow-md'
                                : 'text-gray-600'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Conteúdo das Tabs */}
                <div className="space-y-6">
                    {/* Dados Pessoais */}
                    {activeTab === 'data' && (
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    Informações Pessoais
                                </h2>
                                <button
                                    onClick={() => {
                                        if (isEditing) {
                                            handleSave();
                                        } else {
                                            setEditForm({
                                                name: userData.name,
                                                phone: userData.phone
                                            });
                                            setIsEditing(true);
                                        }
                                    }}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition disabled:opacity-50"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : isEditing ? (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Salvar
                                        </>
                                    ) : (
                                        <>
                                            <Edit3 className="w-4 h-4" />
                                            Editar
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            Nome completo
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                                                {userData.name}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            E-mail
                                        </label>
                                        <div className="px-4 py-3 bg-gray-100 rounded-xl text-gray-500 flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            {userData.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            Telefone
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                placeholder="(11) 99999-9999"
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {userData.phone || 'Não informado'}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            Membro desde
                                        </label>
                                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                                            {userData.memberSince}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Endereços */}
                    {activeTab === 'addresses' && (
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    Meus Endereços
                                </h2>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition">
                                    <Plus className="w-4 h-4" />
                                    Adicionar
                                </button>
                            </div>

                            {userData.addresses.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p>Nenhum endereço cadastrado</p>
                                    <button className="mt-4 text-primary hover:underline">
                                        Adicionar primeiro endereço
                                    </button>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {userData.addresses.map((address) => (
                                        <div
                                            key={address.id}
                                            className={`p-5 rounded-xl border-2 transition ${address.isDefault
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    {address.type === 'home' ? (
                                                        <Home className="w-5 h-5 text-primary" />
                                                    ) : address.type === 'work' ? (
                                                        <Briefcase className="w-5 h-5 text-primary" />
                                                    ) : (
                                                        <MapPin className="w-5 h-5 text-primary" />
                                                    )}
                                                    <span className="font-medium capitalize">
                                                        {address.type === 'home' ? 'Casa' : address.type === 'work' ? 'Trabalho' : 'Outro'}
                                                    </span>
                                                </div>
                                                {address.isDefault && (
                                                    <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                                                        Padrão
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-gray-900 font-medium">
                                                {address.street}, {address.number}
                                            </p>
                                            {address.complement && (
                                                <p className="text-gray-500 text-sm">{address.complement}</p>
                                            )}
                                            <p className="text-gray-500 text-sm mt-1">
                                                {address.neighborhood} - {address.city}/{address.state}
                                            </p>
                                            <p className="text-gray-400 text-sm">CEP: {address.zipCode}</p>

                                            <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                                                <button className="text-sm text-primary hover:underline">
                                                    Editar
                                                </button>
                                                {!address.isDefault && (
                                                    <>
                                                        <button className="text-sm text-primary hover:underline">
                                                            Tornar padrão
                                                        </button>
                                                        <button className="text-sm text-red-500 hover:underline flex items-center gap-1">
                                                            <Trash2 className="w-3 h-3" />
                                                            Excluir
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pedidos */}
                    {activeTab === 'orders' && (
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary" />
                                    Histórico de Pedidos
                                </h2>
                                <Link
                                    to="/pedidos"
                                    className="flex items-center gap-1 text-primary hover:underline"
                                >
                                    Ver todos
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="text-center py-12 text-gray-500">
                                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p>Seus pedidos aparecerão aqui</p>
                                <Link
                                    to="/catalogo"
                                    className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition"
                                >
                                    Começar a comprar
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}