import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PackageProvider } from "@/contexts/PackageContext";

// Pages
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/student/HomePage";
import InstructorProfilePage from "./pages/student/InstructorProfilePage";
import ReviewsPage from "./pages/student/ReviewsPage";
import FavoritesPage from "./pages/student/FavoritesPage";
import StudentProfilePage from "./pages/student/StudentProfilePage";
import BuyPackagePage from "./pages/student/BuyPackagePage";
import MyLessonsPage from "./pages/student/MyLessonsPage";
import RateInstructorPage from "./pages/student/RateInstructorPage";
import PackageDetailsPage from "./pages/PackageDetailsPage";
import InstructorHomePage from "./pages/instrutor/InstrutorHomePage";
import InstructorReviewsPage from "./pages/instrutor/InstrutorAvaliacoesPage";
import InstructorEditProfilePage from "./pages/instrutor/InstrutorPerfilPage";
import HowItWorksPage from "./pages/instrutor/AssinaturaPage";
import MyStudentsPage from "./pages/instrutor/MeusAlunosPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedType }: { children: React.ReactNode; allowedType?: 'aluno' | 'instrutor' }) {
  const { user, userType, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  if (allowedType && userType !== allowedType) {
    return <Navigate to={userType === 'instrutor' ? '/instructor/home' : '/home'} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { user, userType, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={userType === 'instrutor' ? '/instructor/home' : '/home'} replace /> : <Navigate to="/auth" replace />} />
      <Route path="/auth" element={user ? <Navigate to={userType === 'instrutor' ? '/instructor/home' : '/home'} replace /> : <AuthPage />} />
      
      {/* Student Routes */}
      <Route path="/home" element={<ProtectedRoute allowedType="aluno"><HomePage /></ProtectedRoute>} />
      <Route path="/instructor/:id" element={<ProtectedRoute allowedType="aluno"><InstructorProfilePage /></ProtectedRoute>} />
      <Route path="/instructor/:id/reviews" element={<ProtectedRoute allowedType="aluno"><ReviewsPage /></ProtectedRoute>} />
      <Route path="/instructor/:id/buy" element={<ProtectedRoute allowedType="aluno"><BuyPackagePage /></ProtectedRoute>} />
      <Route path="/favorites" element={<ProtectedRoute allowedType="aluno"><FavoritesPage /></ProtectedRoute>} />
      <Route path="/my-lessons" element={<ProtectedRoute allowedType="aluno"><MyLessonsPage /></ProtectedRoute>} />
      <Route path="/rate/:packageId" element={<ProtectedRoute allowedType="aluno"><RateInstructorPage /></ProtectedRoute>} />
      <Route path="/package/:id" element={<ProtectedRoute><PackageDetailsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedType="aluno"><StudentProfilePage /></ProtectedRoute>} />

      {/* Instructor Routes */}
      <Route path="/instructor/home" element={<ProtectedRoute allowedType="instrutor"><InstructorHomePage /></ProtectedRoute>} />
      <Route path="/instructor/reviews" element={<ProtectedRoute allowedType="instrutor"><InstructorReviewsPage /></ProtectedRoute>} />
      <Route path="/instructor/profile" element={<ProtectedRoute allowedType="instrutor"><InstructorEditProfilePage /></ProtectedRoute>} />
      <Route path="/instructor/how-it-works" element={<ProtectedRoute allowedType="instrutor"><HowItWorksPage /></ProtectedRoute>} />
      <Route path="/instructor/students" element={<ProtectedRoute allowedType="instrutor"><MyStudentsPage /></ProtectedRoute>} />
      <Route path="/instructor/package/:id" element={<ProtectedRoute allowedType="instrutor"><PackageDetailsPage /></ProtectedRoute>} />

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
          <PackageProvider>
            <AppRoutes />
          </PackageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
