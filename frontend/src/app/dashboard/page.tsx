"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "../_components/Header";
import { AccountBalanceCard } from "./_components/AccountBalanceCard";
import { MonthSelector } from "./_components/MonthSelector";
import { TransactionsList } from "./_components/TransactionsList";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  saldo: number;
}

interface Transacao {
  id: number;
  tipo: string;
  valor: number;
  descricao: string;
  created_at: string;
  nome_destino?: string;
}

export default function Dashboard() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [modalAberto, setModalAberto] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [emailDestino, setEmailDestino] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const router = useRouter();

  useEffect(() => {
    const usuarioStorage = localStorage.getItem("usuario");
    const usuarioParsed = JSON.parse(usuarioStorage || "{}");
    setUsuario({
      ...usuarioParsed,
      saldo: parseFloat(usuarioParsed.saldo || "0"),
    });
    carregarDados(usuarioParsed.id);
  }, []);

  const carregarDados = async (userId: number) => {
    try {
      const [usuarioRes, transacoesRes] = await Promise.all([
        axios.get(`http://localhost:3001/api/usuario/${userId}`),
        axios.get(`http://localhost:3001/api/transacoes/${userId}`),
      ]);

      setUsuario({
        ...usuarioRes.data,
        saldo: parseFloat(usuarioRes.data.saldo || "0"),
      });
      setTransacoes(transacoesRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const realizarTransacao = async (tipo: string) => {
    if (!usuario) return;

    setLoading(true);
    setMensagem("");

    try {
      const response = await axios.post("http://localhost:3001/api/transacao", {
        usuarioId: usuario.id,
        tipo,
        valor: parseFloat(valor),
        descricao,
        emailDestino: tipo === "transferencia" ? emailDestino : undefined,
      });

      setMensagem(response.data.mensagem);
      setModalAberto("");
      setValor("");
      setDescricao("");
      setEmailDestino("");

      await carregarDados(usuario.id);
    } catch (error: any) {
      setMensagem(error.response?.data?.error || "Erro na transação");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("usuario");
    router.push("/");
  };

  if (!usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header nome={usuario.nome} />

      {/* Main */}
      <main className="px-8 py-8">
        <div className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <MonthSelector
              selected={selectedMonth}
              onChange={setSelectedMonth}
            />
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <div className="flex flex-col gap-6 md:flex-row md:gap-8">
            <div className="flex-1">
              <AccountBalanceCard balance={usuario.saldo} />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setModalAberto("deposito")}
                  className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                >
                  Depósito
                </button>
                <button
                  onClick={() => setModalAberto("saque")}
                  className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                  Saque
                </button>
                <button
                  onClick={() => setModalAberto("transferencia")}
                  className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  Transferir
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <TransactionsList transactions={transacoes} />
          </div>
        </div>

        {mensagem && (
          <div className="mx-auto mt-4 max-w-6xl rounded-md border border-blue-300 bg-blue-100 p-4">
            {mensagem}
          </div>
        )}
      </main>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold capitalize">
              {modalAberto}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {modalAberto === "transferencia" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email do Destinatário
                  </label>
                  <input
                    type="email"
                    value={emailDestino}
                    onChange={(e) => setEmailDestino(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => realizarTransacao(modalAberto)}
                disabled={loading}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-md px-4 py-2 font-semibold disabled:opacity-50"
              >
                {loading ? "Processando..." : "Confirmar"}
              </button>
              <button
                onClick={() => setModalAberto("")}
                className="bg-muted text-muted-foreground flex-1 rounded-md px-4 py-2 font-semibold hover:bg-gray-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
