import { useEffect, useState, type FormEvent } from "react";
import {
  buscarTotais,
  criarPessoa,
  criarTransacao,
  deletarPessoa,
  listarPessoas,
  listarTransacoes,
} from "./api";
import type { Pessoa, TotaisResponse, Transacao } from "./types";
import { classeSaldo, formatarMoeda } from "./utils/formatters";

type TipoTransacao = "Receita" | "Despesa";

async function buscarDadosAplicacao() {
  const [pessoasAtualizadas, transacoesAtualizadas, totaisAtualizados] =
    await Promise.all([listarPessoas(), listarTransacoes(), buscarTotais()]);

  return {
    pessoasAtualizadas,
    transacoesAtualizadas,
    totaisAtualizados,
  };
}

function obterMensagemErro(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function App() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [totais, setTotais] = useState<TotaisResponse | null>(null);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<TipoTransacao>("Despesa");
  const [pessoaID, setPessoaID] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvandoPessoa, setSalvandoPessoa] = useState(false);
  const [salvandoTransacao, setSalvandoTransacao] = useState(false);
  const [removendoPessoaID, setRemovendoPessoaID] = useState<number | null>(
    null
  );
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");

  async function carregarDados() {
    try {
      const { pessoasAtualizadas, transacoesAtualizadas, totaisAtualizados } =
        await buscarDadosAplicacao();

      setPessoas(pessoasAtualizadas);
      setTransacoes(transacoesAtualizadas);
      setTotais(totaisAtualizados);
      setErro("");
    } catch (error) {
      setErro(obterMensagemErro(error, "Erro inesperado ao carregar dados."));
    } finally {
      setCarregando(false);
    }
  }

  async function cadastrarPessoa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const idadeNumero = Number(idade);

    if (!nome.trim()) {
      setErro("Informe o nome da pessoa.");
      return;
    }

    if (!Number.isInteger(idadeNumero) || idadeNumero < 0) {
      setErro("Informe uma idade válida, sem casas decimais.");
      return;
    }

    try {
      setErro("");
      setMensagem("");
      setSalvandoPessoa(true);

      await criarPessoa({
        nome: nome.trim(),
        idade: idadeNumero,
      });

      setNome("");
      setIdade("");
      setMensagem("Pessoa cadastrada.");

      await carregarDados();
    } catch (error) {
      setErro(obterMensagemErro(error, "Erro inesperado ao cadastrar pessoa."));
    } finally {
      setSalvandoPessoa(false);
    }
  }

  useEffect(() => {
    let ativo = true;

    buscarDadosAplicacao()
      .then(({ pessoasAtualizadas, transacoesAtualizadas, totaisAtualizados }) => {
        if (!ativo) {
          return;
        }

        setPessoas(pessoasAtualizadas);
        setTransacoes(transacoesAtualizadas);
        setTotais(totaisAtualizados);
        setErro("");
      })
      .catch((error: unknown) => {
        if (!ativo) {
          return;
        }

        setErro(obterMensagemErro(error, "Erro inesperado ao carregar dados."));
      })
      .finally(() => {
        if (ativo) {
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
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
      setMensagem("");
      setRemovendoPessoaID(id);

      await deletarPessoa(id);
      setMensagem("Pessoa removida.");

      await carregarDados();
    } catch (error) {
      setErro(obterMensagemErro(error, "Erro inesperado ao deletar pessoa."));
    } finally {
      setRemovendoPessoaID(null);
    }
  }

  async function cadastrarTransacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pessoaID) {
      setErro("Selecione uma pessoa para cadastrar a transação.");
      return;
    }

    const valorNumero = Number(valor);

    if (!descricao.trim()) {
      setErro("Informe a descrição da transação.");
      return;
    }

    if (!Number.isFinite(valorNumero) || valorNumero <= 0) {
      setErro("Informe um valor maior que zero.");
      return;
    }

    try {
      setErro("");
      setMensagem("");
      setSalvandoTransacao(true);

      await criarTransacao({
        descricao: descricao.trim(),
        valor: valorNumero,
        tipo,
        pessoaID: Number(pessoaID),
      });

      setDescricao("");
      setValor("");
      setTipo("Despesa");
      setPessoaID("");
      setMensagem("Transação cadastrada.");

      await carregarDados();
    } catch (error) {
      setErro(
        obterMensagemErro(error, "Erro inesperado ao cadastrar transação.")
      );
    } finally {
      setSalvandoTransacao(false);
    }
  }

  const totalGeral = totais?.totalGeral;
  const saldoLiquido = totalGeral?.saldoLiquido ?? 0;
  const statusCarregamento = carregando ? "Carregando" : "Atualizado";
  const totalRegistros = pessoas.length + transacoes.length;
  const destaquesPessoa = [...(totais?.pessoas ?? [])]
    .sort((a, b) => b.saldo - a.saldo)
    .slice(0, 3);
  const ultimasTransacoes = [...transacoes]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Projeto Renda Familiar</span>
          <h1>Controle de gastos residenciais</h1>
          <p>
            Registre pessoas, receitas e despesas para acompanhar o saldo da
            família com clareza.
          </p>
        </div>

        <div className="hero-card" aria-label="Saldo consolidado">
          <div className="status-linha">
            <span
              className={`status-dot ${carregando ? "carregando" : ""}`}
              aria-hidden="true"
            />
            {statusCarregamento}
          </div>
          <span>Saldo líquido</span>
          <strong className={classeSaldo(saldoLiquido)}>
            {formatarMoeda(saldoLiquido)}
          </strong>
          <small>{totalRegistros} registros no sistema</small>
        </div>
      </header>

      <section className="resumo-grid" aria-label="Resumo financeiro">
        <article className="indicador indicador-receita">
          <div className="indicador-topo">
            <span className="indicador-icone">+</span>
            <span>Receitas</span>
          </div>
          <strong>{formatarMoeda(totalGeral?.totalReceitas ?? 0)}</strong>
          <small>Entradas registradas</small>
        </article>
        <article className="indicador indicador-despesa">
          <div className="indicador-topo">
            <span className="indicador-icone">-</span>
            <span>Despesas</span>
          </div>
          <strong>{formatarMoeda(totalGeral?.totalDespesas ?? 0)}</strong>
          <small>Saídas registradas</small>
        </article>
        <article className="indicador indicador-saldo">
          <div className="indicador-topo">
            <span className="indicador-icone">=</span>
            <span>Saldo líquido</span>
          </div>
          <strong className={classeSaldo(saldoLiquido)}>
            {formatarMoeda(saldoLiquido)}
          </strong>
          <small>Receitas menos despesas</small>
        </article>
        <article className="indicador">
          <div className="indicador-topo">
            <span className="indicador-icone">#</span>
            <span>Pessoas</span>
          </div>
          <strong>{pessoas.length}</strong>
          <small>{transacoes.length} transações cadastradas</small>
        </article>
      </section>

      <div className="mensagens" aria-live="polite">
        {erro && (
          <p className="alerta alerta-erro" role="alert">
            {erro}
          </p>
        )}
        {mensagem && !erro && <p className="alerta alerta-sucesso">{mensagem}</p>}
      </div>

      <div className="layout-principal">
        <section className="painel painel-acoes">
          <div className="secao-titulo">
            <div>
              <h2>Adicionar informações</h2>
              <span>Mantenha o cadastro familiar sempre atualizado.</span>
            </div>
          </div>

          <div className="forms-grid">
            <form className="form-bloco" onSubmit={cadastrarPessoa}>
              <div className="form-bloco-topo">
                <span className="form-indice">01</span>
                <div>
                  <h3>Nova pessoa</h3>
                  <p>Quem participa do controle financeiro.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="campo">
                  <label htmlFor="nome">Nome</label>
                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    placeholder="Ex: Ana"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="campo">
                  <label htmlFor="idade">Idade</label>
                  <input
                    id="idade"
                    type="number"
                    min="0"
                    step="1"
                    value={idade}
                    onChange={(event) => setIdade(event.target.value)}
                    placeholder="Ex: 22"
                    required
                  />
                </div>

                <button className="botao" type="submit" disabled={salvandoPessoa}>
                  {salvandoPessoa ? "Cadastrando..." : "Cadastrar pessoa"}
                </button>
              </div>
            </form>

            <form className="form-bloco" onSubmit={cadastrarTransacao}>
              <div className="form-bloco-topo">
                <span className="form-indice">02</span>
                <div>
                  <h3>Nova transação</h3>
                  <p>Registre uma receita ou despesa por pessoa.</p>
                </div>
              </div>

              <div className="form-grid form-grid-transacao">
                <div className="campo campo-cheio">
                  <label htmlFor="descricao">Descrição</label>
                  <input
                    id="descricao"
                    type="text"
                    value={descricao}
                    onChange={(event) => setDescricao(event.target.value)}
                    placeholder="Ex: Mercado"
                    required
                  />
                </div>

                <div className="campo">
                  <label htmlFor="valor">Valor</label>
                  <input
                    id="valor"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={valor}
                    onChange={(event) => setValor(event.target.value)}
                    placeholder="Ex: 250"
                    required
                  />
                </div>

                <fieldset className="campo">
                  <legend>Tipo</legend>
                  <div className="tipo-toggle">
                    <label className={tipo === "Despesa" ? "ativo" : ""}>
                      <input
                        type="radio"
                        name="tipo"
                        value="Despesa"
                        checked={tipo === "Despesa"}
                        onChange={() => setTipo("Despesa")}
                      />
                      Despesa
                    </label>
                    <label className={tipo === "Receita" ? "ativo" : ""}>
                      <input
                        type="radio"
                        name="tipo"
                        value="Receita"
                        checked={tipo === "Receita"}
                        onChange={() => setTipo("Receita")}
                      />
                      Receita
                    </label>
                  </div>
                </fieldset>

                <div className="campo campo-cheio">
                  <label htmlFor="pessoaID">Pessoa</label>
                  <select
                    id="pessoaID"
                    value={pessoaID}
                    onChange={(event) => setPessoaID(event.target.value)}
                    required
                    disabled={pessoas.length === 0}
                  >
                    <option value="">Selecione uma pessoa</option>

                    {pessoas.map((pessoa) => (
                      <option key={pessoa.id} value={pessoa.id}>
                        {pessoa.nome} - {pessoa.idade} anos
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="botao campo-cheio"
                  type="submit"
                  disabled={salvandoTransacao || pessoas.length === 0}
                >
                  {salvandoTransacao ? "Cadastrando..." : "Cadastrar transação"}
                </button>
              </div>
            </form>
          </div>
        </section>

        <aside className="painel painel-resumo">
          <div className="secao-titulo">
            <div>
              <h2>Leitura rápida</h2>
              <span>Visão consolidada</span>
            </div>
          </div>

          <div className="mini-metricas">
            <div>
              <span>Pessoas</span>
              <strong>{pessoas.length}</strong>
            </div>
            <div>
              <span>Transações</span>
              <strong>{transacoes.length}</strong>
            </div>
          </div>

          <div className="lista-destaques">
            <h3>Maiores saldos</h3>
            {destaquesPessoa.length === 0 && (
              <p className="lista-vazia compacta">Sem saldo por pessoa.</p>
            )}

            {destaquesPessoa.map((pessoa) => (
              <div className="linha-destaque" key={pessoa.pessoaID}>
                <span>{pessoa.nome}</span>
                <strong className={classeSaldo(pessoa.saldo)}>
                  {formatarMoeda(pessoa.saldo)}
                </strong>
              </div>
            ))}
          </div>

          <div className="lista-destaques">
            <h3>Últimos lançamentos</h3>
            {ultimasTransacoes.length === 0 && (
              <p className="lista-vazia compacta">Sem lançamentos recentes.</p>
            )}

            {ultimasTransacoes.map((transacao) => (
              <div className="linha-destaque" key={transacao.id}>
                <span>{transacao.descricao}</span>
                <strong className={transacao.tipo.toLowerCase()}>
                  {formatarMoeda(transacao.valor)}
                </strong>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="dados-grid">
        <section className="painel">
          <div className="secao-titulo">
            <div>
              <h2>Pessoas cadastradas</h2>
              <span>{pessoas.length} registros</span>
            </div>
          </div>

          {carregando && <p className="lista-vazia">Carregando pessoas...</p>}

          {!carregando && pessoas.length === 0 && (
            <p className="lista-vazia">Nenhuma pessoa cadastrada.</p>
          )}

          {!carregando && pessoas.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Idade</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pessoas.map((pessoa) => (
                    <tr key={pessoa.id}>
                      <td>
                        <strong className="texto-principal">{pessoa.nome}</strong>
                      </td>
                      <td>{pessoa.idade} anos</td>
                      <td className="acoes">
                        <button
                          className="botao secundario perigo"
                          type="button"
                          onClick={() => void removerPessoa(pessoa.id)}
                          disabled={removendoPessoaID === pessoa.id}
                        >
                          {removendoPessoaID === pessoa.id
                            ? "Removendo..."
                            : "Deletar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="painel">
          <div className="secao-titulo">
            <div>
              <h2>Totais por pessoa</h2>
              <span>{totais?.pessoas.length ?? 0} registros</span>
            </div>
          </div>

          {!totais && (
            <p className="lista-vazia">Totais ainda não carregados.</p>
          )}

          {totais && totais.pessoas.length === 0 && (
            <p className="lista-vazia">Nenhum total disponível.</p>
          )}

          {totais && totais.pessoas.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Pessoa</th>
                    <th className="valor-coluna">Receitas</th>
                    <th className="valor-coluna">Despesas</th>
                    <th className="valor-coluna">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {totais.pessoas.map((pessoa) => (
                    <tr key={pessoa.pessoaID}>
                      <td>
                        <strong className="texto-principal">{pessoa.nome}</strong>
                      </td>
                      <td className="valor-coluna">
                        {formatarMoeda(pessoa.totalReceitas)}
                      </td>
                      <td className="valor-coluna">
                        {formatarMoeda(pessoa.totalDespesas)}
                      </td>
                      <td
                        className={`valor-coluna ${classeSaldo(pessoa.saldo)}`}
                      >
                        {formatarMoeda(pessoa.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="painel">
        <div className="secao-titulo">
          <div>
            <h2>Transações cadastradas</h2>
            <span>{transacoes.length} registros</span>
          </div>
        </div>

        {carregando && <p className="lista-vazia">Carregando transações...</p>}

        {!carregando && transacoes.length === 0 && (
          <p className="lista-vazia">Nenhuma transação cadastrada.</p>
        )}

        {!carregando && transacoes.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Pessoa</th>
                  <th className="valor-coluna">Valor</th>
                </tr>
              </thead>
              <tbody>
                {transacoes.map((transacao) => (
                  <tr key={transacao.id}>
                    <td>
                      <strong className="texto-principal">
                        {transacao.descricao}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge ${transacao.tipo.toLowerCase()}`}>
                        {transacao.tipo}
                      </span>
                    </td>
                    <td>{transacao.pessoa?.nome ?? `Pessoa ${transacao.pessoaID}`}</td>
                    <td className="valor-coluna">
                      {formatarMoeda(transacao.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
