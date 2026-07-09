using api.models;
namespace api.dtos;

public class CriarTransacaoDTO
{
    public string Descricao { get; set; } = "";
    public decimal Valor { get; set; }
    public TipoDeTransacao Tipo { get; set; }
    public int PessoaID { get; set; }
}