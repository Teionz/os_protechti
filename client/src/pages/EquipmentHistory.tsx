import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, Wrench, DollarSign } from "lucide-react";
import { Link } from "wouter";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em Andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function EquipmentHistory() {
  const { id } = useParams<{ id: string }>();
  const equipmentId = parseInt(id || "0");

  const { data: equipment, isLoading: equipLoading } = trpc.equipments.get.useQuery(equipmentId);
  const { data: allOrders = [], isLoading: ordersLoading } = trpc.orders.list.useQuery();
  const orders = allOrders.filter((o: any) => o.equipment?.id === equipmentId);

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  const fmtD = (d: Date | null | undefined) => d ? new Date(d).toLocaleDateString("pt-BR") : "-";

  if (equipLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/equipments">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <Card className="p-6 text-center text-muted-foreground">
            Equipamento não encontrado
          </Card>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
  const completedCount = orders.filter((o: any) => o.status === "completed").length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/equipments">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Equipamentos
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Histórico de Manutenção
              </h1>
              <p className="text-muted-foreground">
                {equipment.name} ({equipment.brand} {equipment.model})
              </p>
              {equipment.serial && (
                <p className="text-sm text-muted-foreground">
                  Série: {equipment.serial}
                </p>
              )}
            {equipment.equipmentTag && (
              <p className="text-sm text-muted-foreground">
                Etiqueta: {equipment.equipmentTag}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-card border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Wrench className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de OS</p>
                <p className="text-2xl font-bold text-foreground">{orders.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Wrench className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-foreground">{completedCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-accent">{fmt(totalRevenue)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Orders List */}
        <Card className="border-border/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-background/50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    OS
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Técnico
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                    Total
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      Nenhuma OS encontrada para este equipamento
                    </td>
                  </tr>
                ) : (
                  orders.map((order: any, idx: number) => (
                    <tr
                      key={order.id}
                      className={`border-b border-border/30 ${
                        idx % 2 === 0 ? "bg-background/50" : "bg-background"
                      } hover:bg-accent/5 transition-colors`}
                    >
                      <td className="px-6 py-3 text-sm font-medium text-foreground">
                        #{order.id}
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {fmtD(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {order.technician || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-accent text-right">
                        {fmt(Number(order.total || 0))}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <Link href={`/os/${order.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
