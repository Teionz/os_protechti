import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface NewClientModalProps {
  onClientCreated?: (clientId: number) => void;
}

export function NewClientModal({ onClientCreated }: NewClientModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cnpjCpf: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const createClientMutation = trpc.clients.create.useMutation({
    onSuccess: (client: any) => {
      toast.success("Cliente criado com sucesso!");
      setOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        cnpjCpf: "",
        street: "",
        number: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      });
      onClientCreated?.(client.id);
    },
    onError: (error) => {
      toast.error(`Erro ao criar cliente: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Nome do cliente é obrigatório");
      return;
    }
    createClientMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 border-accent text-accent hover:bg-accent/10"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Nome *</label>
              <Input
                type="text"
                placeholder="Nome do cliente"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 bg-background border-border"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 bg-background border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Telefone</label>
              <Input
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 bg-background border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">CNPJ/CPF</label>
              <Input
                type="text"
                placeholder="00.000.000/0000-00"
                value={formData.cnpjCpf}
                onChange={(e) => setFormData({ ...formData, cnpjCpf: e.target.value })}
                className="mt-1 bg-background border-border"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Rua</label>
                <Input
                  type="text"
                  placeholder="Rua/Avenida"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="mt-1 bg-background border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Número</label>
                <Input
                  type="text"
                  placeholder="123"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="mt-1 bg-background border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Bairro</label>
                <Input
                  type="text"
                  placeholder="Bairro"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="mt-1 bg-background border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Cidade</label>
                <Input
                  type="text"
                  placeholder="São Paulo"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 bg-background border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Estado</label>
                <Input
                  type="text"
                  placeholder="SP"
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="mt-1 bg-background border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">CEP</label>
                <Input
                  type="text"
                  placeholder="01234-567"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="mt-1 bg-background border-border"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-accent text-background hover:bg-accent/90"
              disabled={createClientMutation.isPending}
            >
              {createClientMutation.isPending ? "Criando..." : "Criar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
