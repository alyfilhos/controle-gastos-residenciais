export type Pessoa = {
    id: number;
    nome: string;
    idade: number;
  };
  
  export type Transacao = {
    id: number;
    descricao: string;
    valor: number;
    tipo: "Receita" | "Despesa";
    pessoaID: number;
    pessoa?: Pessoa;
  };
  
  export type PessoaTotal = {
    pessoaID: number;
    nome: string;
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
  };
  
  export type TotalGeral = {
    totalReceitas: number;
    totalDespesas: number;
    saldoLiquido: number;
  };
  
  export type TotaisResponse = {
    pessoas: PessoaTotal[];
    totalGeral: TotalGeral;
  };
