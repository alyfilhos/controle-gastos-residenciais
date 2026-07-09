namespace api.models;
public class Transacao {
    public int ID { get; set; } //identificador único
    public string Descricao { get; set; } = "";
    public decimal Valor { get; set; }
    public TipoDeTransacao Tipo { get; set; }
    public int PessoaID { get; set; } //chave-estrangeira (Id da pessoa que recebe a transação)

    public Pessoa? Pessoa { get; set; } //Pessoa relacionada, pode ser nulo até o BD carregar
}