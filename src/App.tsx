import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <div className="min-h-screen bg-white">
              <Routes>
                <Route path="/admin" element={<AdminPage />} />
                <Route
                  path="*"
                  element={
                    <>
                      <Header />
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/catalog" element={<CatalogPage />} />
                        <Route path="/product/:slug" element={<ProductPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/favorites" element={<FavoritesPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                      </Routes>
                      <BottomNav />
                    </>
                  }
                />
              </Routes>
            </div>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
