import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BusinessProvider } from "@/contexts/BusinessContext";

// Pages
import LoginPage from "./pages/LoginPage";
import CadastroPage from "./pages/CadastroPage";
import HomePage from "./pages/aluno/HomePage";
import InstrutorProfilePage from "./pages/aluno/InstrutorProfilePage";
import AvaliacoesPage from "./pages/aluno/AvaliacoesPage";
import FavoritosPage from "./pages/aluno/FavoritosPage";
import AlunoPerfilPage from "./pages/aluno/AlunoPerfilPage";
import ComprarPacotePage from "./pages/aluno/ComprarPacotePage";
import MinhasAulasPage from "./pages/aluno/MinhasAulasPage";
import AvaliarInstrutorPage from "./pages/aluno/AvaliarInstrutorPage";
import PacoteDetalhesPage from "./pages/PacoteDetalhesPage";
import InstrutorHomePage from "./pages/instrutor/InstrutorHomePage";
import InstrutorAvaliacoesPage from "./pages/instrutor/InstrutorAvaliacoesPage";
import InstrutorPerfilPage from "./pages/instrutor/InstrutorPerfilPage";
import AssinaturaPage from "./pages/instrutor/AssinaturaPage";
import MeusAlunosPage from "./pages/instrutor/MeusAlunosPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedType }: { children: React.ReactNode; allowedType?: 'aluno' | 'instrutor' }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedType && currentUser.tipo !== allowedType) {
    return <Navigate to={currentUser.tipo === 'instrutor' ? '/instrutor/home' : '/home'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Login */}
      <Route 
        path="/" 
        element={
          currentUser 
            ? <Navigate to={currentUser.tipo === 'instrutor' ? '/instrutor/home' : '/home'} replace /> 
            : <LoginPage />
        } 
      />
      <Route 
        path="/login" 
        element={
          currentUser 
            ? <Navigate to={currentUser.tipo === 'instrutor' ? '/instrutor/home' : '/home'} replace /> 
            : <LoginPage />
        } 
      />
      <Route 
        path="/cadastro" 
        element={
          currentUser 
            ? <Navigate to={currentUser.tipo === 'instrutor' ? '/instrutor/home' : '/home'} replace /> 
            : <CadastroPage />
        } 
      />

      {/* Aluno Routes */}
      <Route path="/home" element={
        <ProtectedRoute allowedType="aluno"><HomePage /></ProtectedRoute>
      } />
      <Route path="/instrutor/:id" element={
        <ProtectedRoute allowedType="aluno"><InstrutorProfilePage /></ProtectedRoute>
      } />
      <Route path="/instrutor/:id/avaliacoes" element={
        <ProtectedRoute allowedType="aluno"><AvaliacoesPage /></ProtectedRoute>
      } />
      <Route path="/instrutor/:id/comprar" element={
        <ProtectedRoute allowedType="aluno"><ComprarPacotePage /></ProtectedRoute>
      } />
      <Route path="/favoritos" element={
        <ProtectedRoute allowedType="aluno"><FavoritosPage /></ProtectedRoute>
      } />
      <Route path="/minhas-aulas" element={
        <ProtectedRoute allowedType="aluno"><MinhasAulasPage /></ProtectedRoute>
      } />
      <Route path="/avaliar/:pacoteId" element={
        <ProtectedRoute allowedType="aluno"><AvaliarInstrutorPage /></ProtectedRoute>
      } />
      <Route path="/pacote/:id" element={
        <ProtectedRoute><PacoteDetalhesPage /></ProtectedRoute>
      } />
      <Route path="/perfil" element={
        <ProtectedRoute allowedType="aluno"><AlunoPerfilPage /></ProtectedRoute>
      } />

      {/* Instrutor Routes */}
      <Route path="/instrutor/home" element={
        <ProtectedRoute allowedType="instrutor"><InstrutorHomePage /></ProtectedRoute>
      } />
      <Route path="/instrutor/avaliacoes" element={
        <ProtectedRoute allowedType="instrutor"><InstrutorAvaliacoesPage /></ProtectedRoute>
      } />
      <Route path="/instrutor/perfil" element={
        <ProtectedRoute allowedType="instrutor"><InstrutorPerfilPage /></ProtectedRoute>
      } />
      <Route path="/instrutor/assinatura" element={
        <ProtectedRoute allowedType="instrutor"><AssinaturaPage /></ProtectedRoute>
      } />
      <Route path="/instrutor/alunos" element={
        <ProtectedRoute allowedType="instrutor"><MeusAlunosPage /></ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <AppRoutes />
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
