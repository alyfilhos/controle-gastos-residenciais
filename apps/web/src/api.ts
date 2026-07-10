import type { Pessoa, TotaisResponse, Transacao } from "./types";

// Define a URL base da API, permitindo sobrescrever pelo ambiente do Vite.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5044";

// Centraliza o tratamento de respostas HTTP e mensagens de erro da API.
async function tratarResposta<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const erro = await response.json().catch(() => null);

    throw new Error(
      erro?.mensagem ?? "Ocorreu um erro ao comunicar com a API."
    );
  }

  return response.json();
}

// Busca todas as pessoas cadastradas no backend.
export async function listarPessoas(): Promise<Pessoa[]> {
  const response = await fetch(`${API_URL}/pessoas`);
  return tratarResposta<Pessoa[]>(response);
}

// Envia os dados de uma nova pessoa para cadastro.
export async function criarPessoa(dados: {
  nome: string;
  idade: number;
}): Promise<Pessoa> {
  const response = await fetch(`${API_URL}/pessoas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  return tratarResposta<Pessoa>(response);
}

// Remove uma pessoa pelo ID.
export async function deletarPessoa(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/pessoas/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const erro = await response.json().catch(() => null);

    throw new Error(
      erro?.mensagem ?? "Não foi possível deletar a pessoa."
    );
  }
}

// Busca todas as transações com a pessoa relacionada.
export async function listarTransacoes(): Promise<Transacao[]> {
  const response = await fetch(`${API_URL}/transacoes`);
  return tratarResposta<Transacao[]>(response);
}

// Envia uma nova receita ou despesa para cadastro.
export async function criarTransacao(dados: {
  descricao: string;
  valor: number;
  tipo: "Receita" | "Despesa";
  pessoaID: number;
}): Promise<Transacao> {
  const response = await fetch(`${API_URL}/transacoes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  return tratarResposta<Transacao>(response);
}

// Busca o resumo financeiro calculado pelo backend.
export async function buscarTotais(): Promise<TotaisResponse> {
  const response = await fetch(`${API_URL}/totais`);
  return tratarResposta<TotaisResponse>(response);
}
