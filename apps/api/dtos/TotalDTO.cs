namespace api.dtos;
public class TotalDTO
{
    public List<PessoaTotalDTO> Pessoas { get; set; } = new();
    public TotalGeralDTO TotalGeral { get; set; } = new();
}