import { Home, Heart, User, Star, Calendar, MessageCircle, Users, CreditCard } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';

export function BottomNav() {
  const { currentUser } = useAuth();
  const { getConversasNaoLidas } = useBusiness();

  const unreadCount = getConversasNaoLidas();

  const alunoLinks = [
    { to: '/home', icon: Home, label: 'Início' },
    { to: '/minhas-aulas', icon: Calendar, label: 'Aulas' },
    { to: '/conversas', icon: MessageCircle, label: 'Chat', badge: unreadCount },
    { to: '/favoritos', icon: Heart, label: 'Favoritos' },
    { to: '/perfil', icon: User, label: 'Perfil' },
  ];

  const instrutorLinks = [
    { to: '/instrutor/home', icon: Home, label: 'Início' },
    { to: '/instrutor/alunos', icon: Users, label: 'Alunos' },
    { to: '/conversas', icon: MessageCircle, label: 'Chat', badge: unreadCount },
    { to: '/instrutor/assinatura', icon: CreditCard, label: 'Plano' },
    { to: '/instrutor/perfil', icon: User, label: 'Perfil' },
  ];

  const links = currentUser?.tipo === 'instrutor' ? instrutorLinks : alunoLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {links.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative",
              isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
                  {badge && badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                      <span className="text-[10px] text-destructive-foreground font-bold">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
