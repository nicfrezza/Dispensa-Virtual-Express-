import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProdutoDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Account/Login';
import Register from './pages/Account/Register';
import Profile from './pages/Account/Profile';
import Orders from './pages/Orders';
import Privacidade from './pages/Privacidade';
import Termos from './pages/Termos';
import Funcionalidade from './pages/Funcionalidade';
import SerVendedor from './pages/Account/SerVendedor';
import FormularioCadastroVendedor from './pages/Account/CadastroVendedor';
import AdicionarReclamacao from './pages/Reclamacoes';
import AdminLogin from '../admin/auth/AdminLogin';
import AdminLayout from '../admin/layout/AdminLayout';
import GerenciarSolicitacoes from '../admin/layout/GerenciarSolicitacoes';
import GerenciarReclamacoes from '../admin/layout/GerenciarReclamacoes';
import CadastrarProduto from './pages/Vendedor/CadastrarProduto';
import PainelVendedor from './pages/Vendedor/PainelVendedor';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="catalogo" element={<Catalog />} />
        <Route path="produto/:id" element={<ProductDetail />} />
        <Route path="carrinho" element={<Cart />} />

        <Route path="privacidade" element={<Privacidade />} />
        <Route path="termos" element={<Termos />} />
        <Route path="funcionalidade" element={<Funcionalidade />} />

        <Route path="ser_vendedor" element={<SerVendedor />} />
        <Route path="cadastro_vendedor" element={<FormularioCadastroVendedor />} />
        <Route path="adicionar_reclamacao" element={<AdicionarReclamacao />} />


        <Route path="vendedor/cadastrar_produto" element={<CadastrarProduto />} />
        <Route path="vendedor/painel" element={<PainelVendedor />} />
        <Route path="login" element={<Login />} />
        <Route path="cadastro" element={<Register />} />

        <Route path="checkout" element={
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        } />
        <Route path="perfil" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="pedidos" element={
          <PrivateRoute>
            <Orders />
          </PrivateRoute>
        } />
      </Route>

      <Route path="admin/login" element={<AdminLogin />} />

      <Route path="admin" element={
        <PrivateRoute>
          <AdminLayout />
        </PrivateRoute>
      }>
        <Route index element={<div>Dashboard Admin</div>} />
        <Route path="gerenciar_solicitacoes" element={<GerenciarSolicitacoes />} />
        <Route path="usuarios" element={<div>Gerenciar Usuários</div>} />
        <Route path="reclamacoes" element={<GerenciarReclamacoes />} />
      </Route>
    </Routes>
  );
}

export default App;
