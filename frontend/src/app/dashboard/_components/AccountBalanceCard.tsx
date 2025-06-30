interface AccountBalanceCardProps {
  balance: number;
}

export function AccountBalanceCard({ balance }: AccountBalanceCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-white p-6 shadow-md">
      <span className="text-muted-foreground text-sm">Saldo Atual</span>
      <span className="text-primary text-3xl font-bold">
        R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
}
