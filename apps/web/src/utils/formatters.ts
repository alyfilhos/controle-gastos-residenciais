// Formatador compartilhado para exibir valores em moeda brasileira.
export const moedaBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// Converte números para o padrão monetário usado na interface.
export function formatarMoeda(valor: number) {
  return moedaBRL.format(valor);
}

// Escolhe a classe visual do saldo conforme o valor calculado.
export function classeSaldo(valor: number) {
  if (valor > 0) {
    return "valor-positivo";
  }

  if (valor < 0) {
    return "valor-negativo";
  }

  return "valor-neutro";
}
