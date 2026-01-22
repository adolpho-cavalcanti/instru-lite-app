import { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { InstrutorCard } from '@/components/InstrutorCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CIDADES = ['Todas', 'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Salvador'];
const CATEGORIAS = ['Todas', 'A', 'B', 'C', 'D', 'E'];

export default function HomePage() {
  const { instrutores, currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCidade, setSelectedCidade] = useState('Todas');
  const [selectedCategoria, setSelectedCategoria] = useState('Todas');
  const [showFilters, setShowFilters] = useState(false);

  const filteredInstrutores = useMemo(() => {
    return instrutores.filter(instrutor => {
      const matchesSearch = instrutor.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        instrutor.cidade.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCidade = selectedCidade === 'Todas' || instrutor.cidade === selectedCidade;
      const matchesCategoria = selectedCategoria === 'Todas' || 
        (instrutor.categorias && instrutor.categorias.includes(selectedCategoria));
      
      return matchesSearch && matchesCidade && matchesCategoria;
    });
  }, [instrutores, searchQuery, selectedCidade, selectedCategoria]);

  const hasActiveFilters = selectedCidade !== 'Todas' || selectedCategoria !== 'Todas';

  const clearFilters = () => {
    setSelectedCidade('Todas');
    setSelectedCategoria('Todas');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Instrutor Mais" showLogout />

      <main className="px-4 py-4 max-w-md mx-auto">
        {/* Welcome */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            Olá, <span className="text-foreground font-medium">
              {(currentUser?.data as { nome: string })?.nome?.split(' ')[0]}
            </span>
          </p>
          <h2 className="text-xl font-bold text-foreground">
            Encontre seu instrutor
          </h2>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou cidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-10 pr-12 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors",
              showFilters || hasActiveFilters
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-card rounded-xl p-4 mb-4 border border-border animate-scale-in">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-foreground">Filtros</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Limpar
                </button>
              )}
            </div>

            {/* Cidade */}
            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-2 block">Cidade</label>
              <div className="flex flex-wrap gap-2">
                {CIDADES.map(cidade => (
                  <button
                    key={cidade}
                    onClick={() => setSelectedCidade(cidade)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      selectedCidade === cidade
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {cidade}
                  </button>
                ))}
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Categoria</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIAS.map(categoria => (
                  <button
                    key={categoria}
                    onClick={() => setSelectedCategoria(categoria)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      selectedCategoria === categoria
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {categoria === 'Todas' ? 'Todas' : `Cat. ${categoria}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {filteredInstrutores.length} instrutor{filteredInstrutores.length !== 1 ? 'es' : ''} encontrado{filteredInstrutores.length !== 1 ? 's' : ''}
          </p>

          {filteredInstrutores.map((instrutor, index) => (
            <InstrutorCard
              key={instrutor.id}
              instrutor={instrutor}
              className={`stagger-${Math.min(index + 1, 6)}`}
            />
          ))}

          {filteredInstrutores.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum instrutor encontrado
              </p>
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="mt-2"
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
