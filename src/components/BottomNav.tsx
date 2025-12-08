import { Home, Heart, User, Star } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function BottomNav() {
  const { currentUser } = useAuth();

  const alunoLinks = [
    { to: '/home', icon: Home, label: 'Início' },
    { to: '/favoritos', icon: Heart, label: 'Favoritos' },
    { to: '/perfil', icon: User, label: 'Perfil' },
  ];

  const instrutorLinks = [
    { to: '/instrutor/home', icon: Home, label: 'Início' },
    { to: '/instrutor/avaliacoes', icon: Star, label: 'Avaliações' },
    { to: '/instrutor/perfil', icon: User, label: 'Perfil' },
  ];

  const links = currentUser?.tipo === 'instrutor' ? instrutorLinks : alunoLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
              isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {({ isActive }) => (
              <>
                <Icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
                <span className="text-xs font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
