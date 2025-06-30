const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

interface MonthSelectorProps {
  selected: number;
  onChange: (month: number) => void;
}

export function MonthSelector({ selected, onChange }: MonthSelectorProps) {
  return (
    <select
      className="bg-background rounded-md border px-3 py-2 text-sm"
      value={selected}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {months.map((month, idx) => (
        <option key={month} value={idx}>
          {month}
        </option>
      ))}
    </select>
  );
}
