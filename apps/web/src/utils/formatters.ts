export const moedaBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarMoeda(valor: number) {
  return moedaBRL.format(valor);
}

export function classeSaldo(valor: number) {
  if (valor > 0) {
    return "valor-positivo";
  }

  if (valor < 0) {
    return "valor-negativo";
  }

  return "valor-neutro";
}
