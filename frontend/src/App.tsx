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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="catalogo" element={<Catalog />} />
        <Route path="produto/:id" element={<ProductDetail />} />
        <Route path="carrinho" element={<Cart />} />
        <Route path="privacidade" element={Privacidade} />
        <Route path="termos" element={Termos} />

        {/* Rotas protegidas */}
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

        {/* Auth */}
        <Route path="login" element={<Login />} />
        <Route path="cadastro" element={<Register />} />
      </Route>
    </Routes>
  );
}

export default App;