import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, GraduationCap, ArrowLeft, User, MapPin, Camera, FileText, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CIDADES = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Salvador'];
const CATEGORIAS = ['A', 'B', 'C', 'D', 'E'];

const DEFAULT_AVATAR_ALUNO = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop&crop=face';
const DEFAULT_AVATAR_INSTRUTOR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face';

export default function CadastroPage() {
  const navigate = useNavigate();
  const { registerAluno, registerInstrutor } = useAuth();
  const [selectedType, setSelectedType] = useState<'instrutor' | 'aluno' | null>(null);

  // Common fields
  const [nome, setNome] = useState('');
  const [foto, setFoto] = useState('');
  const [cidade, setCidade] = useState('');

  // Instructor specific fields
  const [credenciamentoDetran, setCredenciamentoDetran] = useState('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [anosExperiencia, setAnosExperiencia] = useState('');
  const [precoHora, setPrecoHora] = useState('');
  const [bairrosAtendimento, setBairrosAtendimento] = useState('');
  const [temVeiculo, setTemVeiculo] = useState(true);
  const [bio, setBio] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !cidade) {
      toast.error('Por favor, preencha os campos obrigatórios.');
      return;
    }

    if (selectedType === 'aluno') {
      const fotoFinal = foto.trim() || DEFAULT_AVATAR_ALUNO;
      registerAluno({
        nome: nome.trim(),
        foto: fotoFinal,
        cidade,
      });
      toast.success('Cadastro realizado com sucesso!');
      navigate('/home');
    } else if (selectedType === 'instrutor') {
      if (!credenciamentoDetran.trim() || categorias.length === 0 || !anosExperiencia || !precoHora) {
        toast.error('Por favor, preencha todos os campos obrigatórios do instrutor.');
        return;
      }

      const fotoFinal = foto.trim() || DEFAULT_AVATAR_INSTRUTOR;
      const bairrosArray = bairrosAtendimento
        .split(',')
        .map(b => b.trim())
        .filter(b => b.length > 0);

      registerInstrutor({
        nome: nome.trim(),
        foto: fotoFinal,
        cidade,
        credenciamentoDetran: credenciamentoDetran.trim(),
        categoria: categorias.join('/'),
        anosExperiencia: parseInt(anosExperiencia),
        precoHora: parseFloat(precoHora),
        bairrosAtendimento: bairrosArray.length > 0 ? bairrosArray : ['Centro'],
        temVeiculo,
        bio: bio.trim() || 'Instrutor dedicado e profissional.',
      });
      toast.success('Cadastro realizado com sucesso!');
      navigate('/instrutor/home');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="gradient-hero px-6 pt-8 pb-6">
        <button
          onClick={() => selectedType ? setSelectedType(null) : navigate('/login')}
          className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Car className="w-8 h-8 text-primary-foreground" />
          <h1 className="text-2xl font-bold text-primary-foreground">
            Instrutor+
          </h1>
        </div>
        <p className="text-primary-foreground/80 text-sm text-center">
          Crie sua conta
        </p>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        {!selectedType ? (
          <>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Você é?
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setSelectedType('aluno')}
                className={cn(
                  "flex flex-col items-center gap-2 p-6 rounded-xl border-2 transition-all duration-200",
                  "border-border bg-card hover:border-primary/50 hover:bg-accent"
                )}
              >
                <GraduationCap className="w-10 h-10 text-muted-foreground" />
                <span className="font-medium text-foreground">Aluno</span>
                <span className="text-xs text-muted-foreground text-center">
                  Quero aprender a dirigir
                </span>
              </button>

              <button
                onClick={() => setSelectedType('instrutor')}
                className={cn(
                  "flex flex-col items-center gap-2 p-6 rounded-xl border-2 transition-all duration-200",
                  "border-border bg-card hover:border-primary/50 hover:bg-accent"
                )}
              >
                <Car className="w-10 h-10 text-muted-foreground" />
                <span className="font-medium text-foreground">Instrutor</span>
                <span className="text-xs text-muted-foreground text-center">
                  Quero dar aulas
                </span>
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {selectedType === 'aluno' ? 'Cadastro de Aluno' : 'Cadastro de Instrutor'}
            </h2>

            {/* Common Fields */}
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome completo *
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="foto" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                URL da foto de perfil
              </Label>
              <Input
                id="foto"
                value={foto}
                onChange={(e) => setFoto(e.target.value)}
                placeholder="https://exemplo.com/sua-foto.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para usar uma foto padrão
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Cidade *
              </Label>
              <Select value={cidade} onValueChange={setCidade} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua cidade" />
                </SelectTrigger>
                <SelectContent>
                  {CIDADES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Instructor Specific Fields */}
            {selectedType === 'instrutor' && (
              <>
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">
                    Informações Profissionais
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credenciamento" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Credenciamento DETRAN *
                  </Label>
                  <Input
                    id="credenciamento"
                    value={credenciamentoDetran}
                    onChange={(e) => setCredenciamentoDetran(e.target.value)}
                    placeholder="Ex: SP-12345"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Categorias *
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIAS.map((cat) => {
                      const isSelected = categorias.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setCategorias(categorias.filter(c => c !== cat));
                            } else {
                              setCategorias([...categorias, cat]);
                            }
                          }}
                          className={cn(
                            "px-4 py-2 rounded-lg border-2 font-medium transition-all duration-200",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card text-foreground border-border hover:border-primary/50"
                          )}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecione todas as categorias que você ensina
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="experiencia" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Anos de exp. *
                    </Label>
                    <Input
                      id="experiencia"
                      type="number"
                      min="1"
                      max="50"
                      value={anosExperiencia}
                      onChange={(e) => setAnosExperiencia(e.target.value)}
                      placeholder="Ex: 5"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preco" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Preço/hora *
                    </Label>
                    <Input
                      id="preco"
                      type="number"
                      min="1"
                      value={precoHora}
                      onChange={(e) => setPrecoHora(e.target.value)}
                      placeholder="Ex: 80"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bairros" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Bairros de atendimento
                  </Label>
                  <Input
                    id="bairros"
                    value={bairrosAtendimento}
                    onChange={(e) => setBairrosAtendimento(e.target.value)}
                    placeholder="Centro, Zona Sul, Zona Norte"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separe os bairros por vírgula
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Label htmlFor="veiculo" className="flex items-center gap-2 cursor-pointer">
                    <CheckCircle className="w-4 h-4" />
                    Possui veículo próprio?
                  </Label>
                  <Switch
                    id="veiculo"
                    checked={temVeiculo}
                    onCheckedChange={setTemVeiculo}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Sua biografia
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte um pouco sobre você e sua experiência como instrutor..."
                    rows={3}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full mt-6">
              Criar conta
            </Button>
          </form>
        )}
      </main>

      <footer className="px-4 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          MVP Demo • Dados fictícios
        </p>
      </footer>
    </div>
  );
}
