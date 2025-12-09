import { ChevronLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthNew } from '@/contexts/AuthContextNew';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showLogout?: boolean;
  className?: string;
}

export function Header({ title, showBack, showLogout, className }: HeaderProps) {
  const navigate = useNavigate();
  const { signOut } = useAuthNew();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top",
      className
    )}>
      <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-xl hover:bg-accent transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
        </div>

        {showLogout && (
          <button
            onClick={handleLogout}
            className="p-2 -mr-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}
