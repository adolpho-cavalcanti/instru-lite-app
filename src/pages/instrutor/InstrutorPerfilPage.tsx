import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Check, X } from 'lucide-react';
import { Instrutor } from '@/types';
import { toast } from 'sonner';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { AntecedentesDeclaracao } from '@/components/AntecedentesDeclaracao';
import { SeloVerificado } from '@/components/SeloVerificado';

const CATEGORIAS_HABILITACAO = ['A', 'B', 'AB', 'C', 'D', 'E'] as const;
type CategoriaHabilitacao = typeof CATEGORIAS_HABILITACAO[number];

const profileSchema = z.object({
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
  precoHora: z.number().min(30, 'Mínimo R$30/hora').max(500, 'Máximo R$500/hora'),
  bairrosAtendimento: z.string().max(500, 'Texto muito longo'),
  credenciamentoDetran: z.string().min(3, 'Informe o credenciamento DETRAN').max(50, 'Credenciamento muito longo'),
  anosExperiencia: z.number().min(0, 'Mínimo 0 anos').max(50, 'Máximo 50 anos'),
});

export default function InstrutorPerfilPage() {
  const { currentUser, updateInstrutor } = useAuth();
  const instrutor = currentUser?.data as Instrutor;

  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    bio: instrutor?.bio || '',
    precoHora: instrutor?.precoHora || 80,
    bairrosAtendimento: instrutor?.bairrosAtendimento.join(', ') || '',
    categorias: instrutor?.categorias || ['B'],
    temVeiculo: instrutor?.temVeiculo || false,
    credenciamentoDetran: instrutor?.credenciamentoDetran || '',
    anosExperiencia: instrutor?.anosExperiencia || 0,
  });

  if (!instrutor) return null;

  const handleSave = () => {
    const result = profileSchema.safeParse({
      bio: formData.bio,
      precoHora: formData.precoHora,
      bairrosAtendimento: formData.bairrosAtendimento,
      credenciamentoDetran: formData.credenciamentoDetran,
      anosExperiencia: formData.anosExperiencia,
    });
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Corrija os erros no formulário');
      return;
    }

    setErrors({});
    
    const bairrosArray = formData.bairrosAtendimento
      .split(',')
      .map(b => b.trim())
      .filter(b => b.length > 0)
      .slice(0, 20);

    const updatedInstrutor: Instrutor = {
      ...instrutor,
      bio: formData.bio,
      precoHora: Number(formData.precoHora),
      bairrosAtendimento: bairrosArray,
      categorias: formData.categorias,
      temVeiculo: formData.temVeiculo,
      credenciamentoDetran: formData.credenciamentoDetran,
      anosExperiencia: Number(formData.anosExperiencia),
    };

    updateInstrutor(updatedInstrutor);
    setEditing(false);
    toast.success('Perfil atualizado com sucesso!');
  };

  const handleCancel = () => {
    setFormData({
      bio: instrutor.bio,
      precoHora: instrutor.precoHora,
      bairrosAtendimento: instrutor.bairrosAtendimento.join(', '),
      categorias: instrutor.categorias || ['B'],
      temVeiculo: instrutor.temVeiculo,
      credenciamentoDetran: instrutor.credenciamentoDetran,
      anosExperiencia: instrutor.anosExperiencia,
    });
    setErrors({});
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Editar Perfil" showLogout />

      <main className="px-4 py-4 max-w-md mx-auto">
        {/* Avatar */}
        <div className="text-center mb-6">
          <img
            src={instrutor.foto}
            alt={instrutor.nome}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-accent"
          />
          <h2 className="font-semibold text-lg">{instrutor.nome}</h2>
          <SeloVerificado
            verificado={instrutor.verificado || false}
            antecedentesDeclarados={instrutor.antecedentesDeclarados}
            className="mt-2"
          />
          <h2 className="text-xl font-bold text-foreground">{instrutor.nome}</h2>
          <p className="text-sm text-muted-foreground">{instrutor.cidade}</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Credenciamento DETRAN */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Credenciamento DETRAN
            </label>
            {editing ? (
              <div>
                <input
                  type="text"
                  value={formData.credenciamentoDetran}
                  onChange={(e) => setFormData({ ...formData, credenciamentoDetran: e.target.value })}
                  placeholder="Ex: DETRAN-SP 123456"
                  className={`w-full h-11 px-3 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.credenciamentoDetran ? 'border-destructive' : 'border-border'}`}
                />
                {errors.credenciamentoDetran && <p className="text-xs text-destructive mt-1">{errors.credenciamentoDetran}</p>}
              </div>
            ) : (
              <p className="text-lg font-semibold text-foreground">{instrutor.credenciamentoDetran || '-'}</p>
            )}
          </div>

          {/* Categorias */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Categorias da habilitação
            </label>
            {editing ? (
              <div className="flex flex-wrap gap-2">
                {CATEGORIAS_HABILITACAO.map((cat) => {
                  const isSelected = formData.categorias.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          if (formData.categorias.length > 1) {
                            setFormData({ ...formData, categorias: formData.categorias.filter(c => c !== cat) });
                          }
                        } else {
                          setFormData({ ...formData, categorias: [...formData.categorias, cat] });
                        }
                      }}
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 font-medium transition-all",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-primary/50"
                      )}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-lg font-semibold text-foreground">{instrutor.categorias?.join(', ') || 'B'}</p>
            )}
          </div>

          {/* Anos de experiência */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Anos de experiência
            </label>
            {editing ? (
              <div>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.anosExperiencia}
                  onChange={(e) => setFormData({ ...formData, anosExperiencia: Number(e.target.value) })}
                  className={`w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.anosExperiencia ? 'border-destructive' : 'border-border'}`}
                />
                {errors.anosExperiencia && <p className="text-xs text-destructive mt-1">{errors.anosExperiencia}</p>}
              </div>
            ) : (
              <p className="text-lg font-semibold text-foreground">{instrutor.anosExperiencia} anos</p>
            )}
          </div>

          {/* Preço */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Valor por hora (R$)
            </label>
            {editing ? (
              <div>
                <input
                  type="number"
                  min="30"
                  max="500"
                  value={formData.precoHora}
                  onChange={(e) => setFormData({ ...formData, precoHora: Number(e.target.value) })}
                  className={`w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.precoHora ? 'border-destructive' : 'border-border'}`}
                />
                {errors.precoHora && <p className="text-xs text-destructive mt-1">{errors.precoHora}</p>}
              </div>
            ) : (
              <p className="text-lg font-semibold text-foreground">R${instrutor.precoHora}</p>
            )}
          </div>

          {/* Tem veículo */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-foreground">Possui veículo próprio?</Label>
                <p className="text-xs text-muted-foreground">Para aulas práticas</p>
              </div>
              {editing ? (
                <Switch
                  checked={formData.temVeiculo}
                  onCheckedChange={(checked) => setFormData({ ...formData, temVeiculo: checked })}
                />
              ) : (
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  instrutor.temVeiculo 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                )}>
                  {instrutor.temVeiculo ? 'Sim' : 'Não'}
                </span>
              )}
            </div>
          </div>

          {/* Bairros */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Bairros de atendimento
            </label>
            {editing ? (
              <div>
                <input
                  type="text"
                  maxLength={500}
                  value={formData.bairrosAtendimento}
                  onChange={(e) => setFormData({ ...formData, bairrosAtendimento: e.target.value })}
                  placeholder="Separe por vírgulas (máx. 20 bairros)"
                  className={`w-full h-11 px-3 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.bairrosAtendimento ? 'border-destructive' : 'border-border'}`}
                />
                {errors.bairrosAtendimento && <p className="text-xs text-destructive mt-1">{errors.bairrosAtendimento}</p>}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {instrutor.bairrosAtendimento.length > 0 ? (
                  instrutor.bairrosAtendimento.map(bairro => (
                    <span
                      key={bairro}
                      className="px-2 py-1 bg-muted rounded-md text-sm text-muted-foreground"
                    >
                      {bairro}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground">Nenhum bairro cadastrado</span>
                )}
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Sua bio
            </label>
            {editing ? (
              <div>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  maxLength={500}
                  rows={4}
                  placeholder="Conte um pouco sobre você e sua experiência..."
                  className={`w-full px-3 py-2 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${errors.bio ? 'border-destructive' : 'border-border'}`}
                />
                <div className="flex justify-between mt-1">
                  {errors.bio ? (
                    <p className="text-xs text-destructive">{errors.bio}</p>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs text-muted-foreground">{formData.bio.length}/500</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground leading-relaxed">{instrutor.bio || 'Nenhuma bio cadastrada'}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {editing ? (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={handleSave}
              >
                <Check className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          ) : (
            <Button
              variant="default"
              className="w-full"
              onClick={() => setEditing(true)}
            >
              Editar informações
            </Button>
          )}
        </div>

        {/* Autodeclaração de Antecedentes */}
        <div className="mt-6">
          <AntecedentesDeclaracao
            antecedentesDeclarados={instrutor.antecedentesDeclarados || false}
            onUpdate={() => window.location.reload()}
          />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
