import { useEffect, useState } from "react";
import {
  criarPessoa,
  criarTransacao,
  deletarPessoa,
  listarPessoas,
  listarTransacoes,
} from "./api";
import type { Pessoa, Transacao } from "./types";

function App() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<"RECEITA" | "DESPESA">("DESPESA");
  const [pessoaId, setPessoaId] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");

  async function carregarPessoas(mostrarCarregamento = true) {
    try {
      if (mostrarCarregamento) {
        setCarregando(true);
      }
  
      const dados = await listarPessoas();
  
      setPessoas(dados);
      setErro("");
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro inesperado ao carregar pessoas.");
      }
    } finally {
      setCarregando(false);
    }
  }

  async function cadastrarPessoa(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setErro("");

      await criarPessoa({
        nome,
        idade: Number(idade),
      });

      setNome("");
      setIdade("");

      await carregarPessoas();
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro inesperado ao cadastrar pessoa.");
      }
    }
  }

  useEffect(() => {
    carregarPessoas();
    carregarTransacoes();
  }, []);

  async function removerPessoa(id: number) {
    const confirmou = window.confirm(
      "Tem certeza que deseja deletar esta pessoa? As transações dela também serão removidas."
    );
  
    if (!confirmou) {
      return;
    }
  
    try {
      setErro("");
  
      await deletarPessoa(id);
  
      await carregarPessoas();
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro inesperado ao deletar pessoa.");
      }
    }
  }

  async function carregarTransacoes() {
    try {
      setErro("");
  
      const dados = await listarTransacoes();
  
      setTransacoes(dados);
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro inesperado ao carregar transações.");
      }
    }
  }

  async function cadastrarTransacao(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  
    if (!pessoaId) {
      setErro("Selecione uma pessoa para cadastrar a transação.");
      return;
    }
  
    try {
      setErro("");
  
      await criarTransacao({
        descricao,
        valor: Number(valor),
        tipo,
        pessoaId: Number(pessoaId),
      });
  
      setDescricao("");
      setValor("");
      setTipo("DESPESA");
      setPessoaId("");
  
      await carregarTransacoes();
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro inesperado ao cadastrar transação.");
      }
    }
  }


  
  return (
    <main>
      <h1>Controle de Gastos Residenciais</h1>

      <section>
        <h2>Cadastrar pessoa</h2>

        <form onSubmit={cadastrarPessoa}>
          <div>
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Ex: Ana"
            />
          </div>

          <div>
            <label htmlFor="idade">Idade</label>
            <input
              id="idade"
              type="number"
              value={idade}
              onChange={(event) => setIdade(event.target.value)}
              placeholder="Ex: 22"
            />
          </div>

          <button type="submit">Cadastrar pessoa</button>
        </form>
      </section>

      <section>
        <h2>Cadastrar transação</h2>

        <form onSubmit={cadastrarTransacao}>
          <div>
            <label htmlFor="descricao">Descrição</label>
            <input
              id="descricao"
              type="text"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Ex: Mercado"
            />
          </div>

          <div>
            <label htmlFor="valor">Valor</label>
            <input
              id="valor"
              type="number"
              value={valor}
              onChange={(event) => setValor(event.target.value)}
              placeholder="Ex: 250"
            />
          </div>

          <div>
            <label htmlFor="tipo">Tipo</label>
            <select
              id="tipo"
              value={tipo}
              onChange={(event) =>
                setTipo(event.target.value as "RECEITA" | "DESPESA")
              }
            >
              <option value="DESPESA">Despesa</option>
              <option value="RECEITA">Receita</option>
            </select>
          </div>

          <div>
            <label htmlFor="pessoaId">Pessoa</label>
            <select
              id="pessoaId"
              value={pessoaId}
              onChange={(event) => setPessoaId(event.target.value)}
            >
              <option value="">Selecione uma pessoa</option>

              {pessoas.map((pessoa) => (
                <option key={pessoa.id} value={pessoa.id}>
                  {pessoa.nome} — {pessoa.idade} anos
                </option>
              ))}
            </select>
          </div>

          <button type="submit">Cadastrar transação</button>
        </form>
      </section>

      <section>
        <h2>Pessoas cadastradas</h2>

        {carregando && <p>Carregando pessoas...</p>}

        {erro && <p>{erro}</p>}

        {!carregando && !erro && pessoas.length === 0 && (
          <p>Nenhuma pessoa cadastrada.</p>
        )}

        {!carregando && !erro && pessoas.length > 0 && (
          <ul>
            {pessoas.map((pessoa) => (
              <li key={pessoa.id}>
                {pessoa.nome} — {pessoa.idade} anos{" "}
                <button type="button" onClick={() => removerPessoa(pessoa.id)}>
                  Deletar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2>Transações cadastradas</h2>

        {transacoes.length === 0 && <p>Nenhuma transação cadastrada.</p>}

        {transacoes.length > 0 && (
          <ul>
            {transacoes.map((transacao) => (
              <li key={transacao.id}>
                {transacao.descricao} — {transacao.tipo} — R$ {transacao.valor} —{" "}
                {transacao.pessoa?.nome ?? `Pessoa ${transacao.pessoaId}`}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;