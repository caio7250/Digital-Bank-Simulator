interface Transaction {
  id: number;
  tipo: string;
  valor: number;
  descricao: string;
  created_at: string;
  nome_destino?: string;
}

interface TransactionsListProps {
  transactions: Transaction[];
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold">Histórico de Transações</h2>
      <div className="max-h-80 space-y-3 overflow-y-auto">
        {transactions.length === 0 && (
          <div className="text-muted-foreground text-center">
            Nenhuma transação encontrada.
          </div>
        )}
        {transactions.map((transacao) => (
          <div key={transacao.id} className="border-b pb-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium capitalize">{transacao.tipo}</span>
                {transacao.nome_destino && (
                  <span className="text-muted-foreground">
                    {" "}
                    - {transacao.nome_destino}
                  </span>
                )}
              </div>
              <span
                className={`font-semibold ${transacao.tipo === "deposito" ? "text-green-600" : "text-red-600"}`}
              >
                {transacao.tipo === "deposito" ? "+" : "-"}R${" "}
                {parseFloat(transacao.valor as any).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="text-muted-foreground text-sm">
              {transacao.descricao} •{" "}
              {new Date(transacao.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
