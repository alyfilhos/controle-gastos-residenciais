import type { Pessoa } from "./types";
//TotaisResponse, Transacao 
const API_URL = "http://localhost:5044";

async function tratarResposta<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const erro = await response.json().catch(() => null);

    throw new Error(
      erro?.mensagem ?? "Ocorreu um erro ao comunicar com a API."
    );
  }

  return response.json();
}

export async function listarPessoas(): Promise<Pessoa[]> {
  const response = await fetch(`${API_URL}/pessoas`);
  return tratarResposta<Pessoa[]>(response);
}

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


