namespace api.dtos;
public class PessoaTotalDTO
{
    public int PessoaID { get; set; }
    public string Nome { get; set; } = "";
    public decimal TotalDespesa { get; set; }
    public decimal TotalReceita { get; set; }
    public decimal Saldo => TotalReceita - TotalDespesa;
}