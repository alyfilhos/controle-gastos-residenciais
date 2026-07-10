namespace api.dtos;
public class PessoaTotalDTO
{
    public int PessoaID { get; set; }
    public string Nome { get; set; } = "";
    public decimal TotalDespesas { get; set; }
    public decimal TotalReceitas { get; set; }
    public decimal Saldo => TotalReceitas - TotalDespesas;
}
