'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Usuario {
  id: number
  nome: string
  email: string
  saldo: number
}

interface Transacao {
  id: number
  tipo: string
  valor: number
  descricao: string
  created_at: string
  nome_destino?: string
}

export default function Dashboard() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [modalAberto, setModalAberto] = useState('')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [emailDestino, setEmailDestino] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const router = useRouter()

  useEffect(() => {
    const usuarioStorage = localStorage.getItem('usuario')
    if (!usuarioStorage) {
      router.push('/')
      return
    }

    const usuarioParsed = JSON.parse(usuarioStorage)
    setUsuario({
      ...usuarioParsed,
      saldo: parseFloat(usuarioParsed.saldo || '0')
    })
    carregarDados(usuarioParsed.id)
  }, [])

  const carregarDados = async (userId: number) => {
    try {
      const [usuarioRes, transacoesRes] = await Promise.all([
        axios.get(`http://localhost:3001/api/usuario/${userId}`),
        axios.get(`http://localhost:3001/api/transacoes/${userId}`)
      ])

      setUsuario({
        ...usuarioRes.data,
        saldo: parseFloat(usuarioRes.data.saldo || '0')
      })
      setTransacoes(transacoesRes.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const realizarTransacao = async (tipo: string) => {
    if (!usuario) return

    setLoading(true)
    setMensagem('')

    try {
      const response = await axios.post('http://localhost:3001/api/transacao', {
        usuarioId: usuario.id,
        tipo,
        valor: parseFloat(valor),
        descricao,
        emailDestino: tipo === 'transferencia' ? emailDestino : undefined
      })

      setMensagem(response.data.mensagem)
      setModalAberto('')
      setValor('')
      setDescricao('')
      setEmailDestino('')
      
      await carregarDados(usuario.id)
    } catch (error: any) {
      setMensagem(error.response?.data?.error || 'Erro na transação')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('usuario')
    router.push('/')
  }

  if (!usuario) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Banco Digital</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Olá, {usuario.nome}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Saldo Atual</h2>
            <div className="text-3xl font-bold text-green-600 mb-6">
              R$ {parseFloat(usuario.saldo || '0').toFixed(2)}
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setModalAberto('deposito')}
                className="bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600"
              >
                Depósito
              </button>
              <button
                onClick={() => setModalAberto('saque')}
                className="bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600"
              >
                Saque
              </button>
              <button
                onClick={() => setModalAberto('transferencia')}
                className="bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600"
              >
                Transferir
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Histórico de Transações</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {transacoes.map((transacao) => (
                <div key={transacao.id} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium capitalize">{transacao.tipo}</span>
                      {transacao.nome_destino && (
                        <span className="text-gray-600"> - {transacao.nome_destino}</span>
                      )}
                    </div>
                    <span className={`font-semibold ${
                      transacao.tipo === 'deposito' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transacao.tipo === 'deposito' ? '+' : '-'}R$ {parseFloat(transacao.valor).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {transacao.descricao} • {new Date(transacao.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {mensagem && (
          <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-md">
            {mensagem}
          </div>
        )}
      </main>

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 capitalize">{modalAberto}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {modalAberto === 'transferencia' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email do Destinatário
                  </label>
                  <input
                    type="email"
                    value={emailDestino}
                    onChange={(e) => setEmailDestino(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => realizarTransacao(modalAberto)}
                disabled={loading}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setModalAberto('')}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 