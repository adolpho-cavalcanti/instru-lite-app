import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const CATEGORIAS_HABILITACAO = ['A', 'B', 'AB', 'C', 'D', 'E'] as const;
type CategoriaHabilitacao = typeof CATEGORIAS_HABILITACAO[number];

interface InstrutorFormFieldsProps {
  categoria: CategoriaHabilitacao;
  setCategoria: (value: CategoriaHabilitacao) => void;
  precoHora: number;
  setPrecoHora: (value: number) => void;
  credenciamentoDetran: string;
  setCredenciamentoDetran: (value: string) => void;
  temVeiculo: boolean;
  setTemVeiculo: (value: boolean) => void;
  anosExperiencia: number;
  setAnosExperiencia: (value: number) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function InstrutorFormFields({
  categoria,
  setCategoria,
  precoHora,
  setPrecoHora,
  credenciamentoDetran,
  setCredenciamentoDetran,
  temVeiculo,
  setTemVeiculo,
  anosExperiencia,
  setAnosExperiencia,
  errors = {},
  disabled = false,
}: InstrutorFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Categoria */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Categoria da habilitação
        </Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS_HABILITACAO.map((cat) => (
            <button
              key={cat}
              type="button"
              disabled={disabled}
              onClick={() => setCategoria(cat)}
              className={cn(
                "px-4 py-2 rounded-lg border-2 font-medium transition-all",
                categoria === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Credenciamento DETRAN */}
      <div>
        <Label htmlFor="credenciamento">Credenciamento DETRAN</Label>
        <Input
          id="credenciamento"
          type="text"
          value={credenciamentoDetran}
          onChange={(e) => setCredenciamentoDetran(e.target.value)}
          placeholder="Ex: DETRAN-SP 123456"
          disabled={disabled}
          className={errors.credenciamentoDetran ? "border-destructive" : ""}
        />
        {errors.credenciamentoDetran && (
          <p className="text-sm text-destructive mt-1">{errors.credenciamentoDetran}</p>
        )}
      </div>

      {/* Anos de experiência */}
      <div>
        <Label htmlFor="experiencia">Anos de experiência</Label>
        <Input
          id="experiencia"
          type="number"
          min="0"
          max="50"
          value={anosExperiencia}
          onChange={(e) => setAnosExperiencia(Number(e.target.value))}
          placeholder="0"
          disabled={disabled}
          className={errors.anosExperiencia ? "border-destructive" : ""}
        />
        {errors.anosExperiencia && (
          <p className="text-sm text-destructive mt-1">{errors.anosExperiencia}</p>
        )}
      </div>

      {/* Preço hora */}
      <div>
        <Label htmlFor="preco">Valor por hora (R$)</Label>
        <Input
          id="preco"
          type="number"
          min="30"
          max="500"
          value={precoHora}
          onChange={(e) => setPrecoHora(Number(e.target.value))}
          placeholder="80"
          disabled={disabled}
          className={errors.precoHora ? "border-destructive" : ""}
        />
        {errors.precoHora && (
          <p className="text-sm text-destructive mt-1">{errors.precoHora}</p>
        )}
      </div>

      {/* Tem veículo */}
      <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
        <div>
          <Label htmlFor="veiculo" className="cursor-pointer">Possui veículo próprio?</Label>
          <p className="text-xs text-muted-foreground">Para aulas práticas</p>
        </div>
        <Switch
          id="veiculo"
          checked={temVeiculo}
          onCheckedChange={setTemVeiculo}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export { CATEGORIAS_HABILITACAO };
export type { CategoriaHabilitacao };
