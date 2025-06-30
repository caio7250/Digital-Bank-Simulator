interface AddTransactionButtonProps {
  onClick: () => void;
}

export function AddTransactionButton({ onClick }: AddTransactionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 font-semibold transition"
    >
      + Nova Transação
    </button>
  );
}
