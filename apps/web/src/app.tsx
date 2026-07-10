import { useEffect, useState } from "react";
import { criarPessoa, deletarPessoa, listarPessoas } from "./api";
import type { Pessoa } from "./types";

function App() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
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
    </main>
  );
}

export default App;