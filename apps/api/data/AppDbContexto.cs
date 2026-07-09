using api.models;
using Microsoft.EntityFrameworkCore;

namespace api.data;

public class AppDbContexto : DbContext{
    public DbSet<Pessoa> Pessoas { get; set; } = null!;
    public DbSet<Transacao> Transacoes { get; set; } = null!;

    // Definições do banco: provider, string de conexão e outras opções.
    public AppDbContexto(DbContextOptions<AppDbContexto> opcoes) : base(opcoes){
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Pessoa>()
            .HasKey(pessoa => pessoa.ID);

        modelBuilder.Entity<Pessoa>()
            .Property(pessoa => pessoa.ID)
            .UseIdentityByDefaultColumn();

        modelBuilder.Entity<Transacao>()
            .HasKey(transacao => transacao.ID);

        modelBuilder.Entity<Transacao>()
            .Property(transacao => transacao.ID)
            .UseIdentityByDefaultColumn();

        modelBuilder.Entity<Pessoa>()
            .HasMany(pessoa => pessoa.Transacoes)
            .WithOne(transacao => transacao.Pessoa)
            .HasForeignKey(transacao => transacao.PessoaID)
            .OnDelete(DeleteBehavior.Cascade);
    }
}