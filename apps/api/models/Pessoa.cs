namespace api.models;
public class Pessoa {
    public int ID { get; set; } //chave-primaria (identificador)
    public string Nome { get; set; } = "";
    public int Idade { get; set; }

    public List<Transacao> Transacoes { get; set; } = new();
}