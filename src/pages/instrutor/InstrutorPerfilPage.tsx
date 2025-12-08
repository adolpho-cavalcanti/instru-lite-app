import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Instrutor } from '@/types';
import { toast } from 'sonner';

export default function InstrutorPerfilPage() {
  const { currentUser, updateInstrutor } = useAuth();
  const instrutor = currentUser?.data as Instrutor;

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: instrutor?.bio || '',
    precoHora: instrutor?.precoHora || 0,
    bairrosAtendimento: instrutor?.bairrosAtendimento.join(', ') || ''
  });

  if (!instrutor) return null;

  const handleSave = () => {
    const bairrosArray = formData.bairrosAtendimento
      .split(',')
      .map(b => b.trim())
      .filter(b => b.length > 0);

    const updatedInstrutor: Instrutor = {
      ...instrutor,
      bio: formData.bio,
      precoHora: Number(formData.precoHora),
      bairrosAtendimento: bairrosArray
    };

    updateInstrutor(updatedInstrutor);
    setEditing(false);
    toast.success('Perfil atualizado com sucesso!');
  };

  const handleCancel = () => {
    setFormData({
      bio: instrutor.bio,
      precoHora: instrutor.precoHora,
      bairrosAtendimento: instrutor.bairrosAtendimento.join(', ')
    });
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
          <h2 className="text-xl font-bold text-foreground">{instrutor.nome}</h2>
          <p className="text-sm text-muted-foreground">{instrutor.credenciamentoDetran}</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Preço */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Valor por hora (R$)
            </label>
            {editing ? (
              <input
                type="number"
                value={formData.precoHora}
                onChange={(e) => setFormData({ ...formData, precoHora: Number(e.target.value) })}
                className="w-full h-11 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            ) : (
              <p className="text-lg font-semibold text-foreground">R${instrutor.precoHora}</p>
            )}
          </div>

          {/* Bairros */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Bairros de atendimento
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.bairrosAtendimento}
                onChange={(e) => setFormData({ ...formData, bairrosAtendimento: e.target.value })}
                placeholder="Separe por vírgulas"
                className="w-full h-11 px-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {instrutor.bairrosAtendimento.map(bairro => (
                  <span
                    key={bairro}
                    className="px-2 py-1 bg-muted rounded-md text-sm text-muted-foreground"
                  >
                    {bairro}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Sua bio
            </label>
            {editing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            ) : (
              <p className="text-muted-foreground leading-relaxed">{instrutor.bio}</p>
            )}
          </div>

          {/* Campos fixos (não editáveis) */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-3">
              Campos não editáveis (contate o suporte)
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Categoria</p>
                <p className="font-medium text-foreground">{instrutor.categoria}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Experiência</p>
                <p className="font-medium text-foreground">{instrutor.anosExperiencia} anos</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cidade</p>
                <p className="font-medium text-foreground">{instrutor.cidade}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Veículo</p>
                <p className="font-medium text-foreground">{instrutor.temVeiculo ? 'Sim' : 'Não'}</p>
              </div>
            </div>
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
      </main>

      <BottomNav />
    </div>
  );
}
