using api.data;
using api.dtos;
using api.models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<AppDbContexto>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContexto>();
    db.Database.Migrate();
}

app.UseCors("FrontendPolicy");

app.UseSwagger();
app.UseSwaggerUI();

//app.UseHttpsRedirection();

app.MapGet("/health", () => {
    return Results.Ok(new { status = "ok" });
});

app.MapGet("/health/db", async (AppDbContexto db) => {
    var canConnect = await db.Database.CanConnectAsync();

    if (!canConnect) {
        return Results.Problem("Não foi possível conectar ao banco de dados.");
    }

    return Results.Ok(new { database = "ok" });
});

//GET PESSOAS
app.MapGet("/pessoas", async (AppDbContexto db) =>{
    var pessoas = await db.Pessoas
        .OrderBy(pessoa => pessoa.ID)
        .Select(pessoa => new
        {
            pessoa.ID,
            pessoa.Nome,
            pessoa.Idade
        })
        .ToListAsync();

    return Results.Ok(pessoas);
});

//POST PESSOA
app.MapPost("/pessoas", async (CriarPessoaDTO dto, AppDbContexto db) =>{
    if(string.IsNullOrWhiteSpace(dto.Nome)){
        return Results.BadRequest(new{
            mensagem = "O nome da pessoa é obrigatório,"
        });
    }

    if(dto.Idade < 0){
        return Results.BadRequest(new{
            mensagem = "A idade não pode ser negativa."
        });
    }

    var pessoa = new Pessoa{
        Idade = dto.Idade,
        Nome = dto.Nome.Trim()
    };

    db.Pessoas.Add(pessoa);
    await db.SaveChangesAsync();

    return Results.Created($"/pessoas/{pessoa.ID}", new{
        pessoa.ID, pessoa.Nome, pessoa.Idade
    });

});

//DELETE PESSOA
app.MapDelete("/pessoas/{id:int}", async (int id, AppDbContexto db) =>
{
    var pessoa = await db.Pessoas.FindAsync(id);
    if (pessoa is null)
    {
        return Results.NotFound(new
        {
            mensagem = "Pessoa não encontrada."
        });
    }

    db.Pessoas.Remove(pessoa);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

//GET TRANSACOES
app.MapGet("/transacoes", async (AppDbContexto db) =>
{
    var transacoes = await db.Transacoes
        .Include(transacao => transacao.Pessoa) //TRANSACAO + PESSOA RELACIONADA
        .OrderBy(transacao => transacao.ID)
        .Select(transacao => new
        {
            transacao.ID,
            transacao.Descricao,
            transacao.Valor,
            transacao.Tipo,
            transacao.PessoaID,
            Pessoa = new
            {
                transacao.Pessoa.ID,
                transacao.Pessoa.Nome,
                transacao.Pessoa.Idade
            }
        })
        .ToListAsync();
    return Results.Ok(transacoes);
});

//POST TRANSACAO 
//e pessoa vai ser carregada?
app.MapPost("/transacoes", async (CriarTransacaoDTO dto, AppDbContexto db) =>
{
    //verificações de segurança
    if (string.IsNullOrWhiteSpace(dto.Descricao))
    {
        return Results.BadRequest(new
        {
            mensagem = "A descrição da transação é obrigatória."
        });
    }

    if (dto.Valor <= 0)
    {
        return Results.BadRequest(new
        {
            mensagem = "O valor da transação deve ser maior que 0."
        });
    }

    if (dto.Tipo != TipoDeTransacao.Despesa && dto.Tipo != TipoDeTransacao.Receita)
    {
        return Results.BadRequest(new
        {
            mensagem = "O tipo da transação é inválido. Deve ser Receita ou Despesa."
        });
    }

    var pessoa = await db.Pessoas.FindAsync(dto.PessoaID);
    if (pessoa is null)
    {
        return Results.BadRequest(new
        {
            mensagem = "A pessoa não está cadastrada no sistema."
        });
    }

    if (pessoa.Idade < 18 && dto.Tipo == TipoDeTransacao.Receita)
    {
        return Results.BadRequest(new
        {
            mensagem = "Menores de idade não estão autorizados a ter transações de receita."
        });
    }
    //Verificações feitas. 

    //Criar transacao.
    var transacao = new Transacao
    {
        Descricao = dto.Descricao.Trim(),
        Valor = dto.Valor,
        Tipo = dto.Tipo,
        PessoaID = dto.PessoaID
    };

    db.Transacoes.Add(transacao);
    await db.SaveChangesAsync();

    return Results.Created($"/transacoes/{transacao.ID}", new
    {
        transacao.ID,
        transacao.Descricao,
        transacao.Valor,
        transacao.Tipo,
        transacao.PessoaID,
        Pessoa = new
        {
            pessoa.ID,
            pessoa.Nome,
            pessoa.Idade
        }
    });
});

//GET TOTAIS
app.MapGet("/totais", async (AppDbContexto db) =>
{
    var pessoas = await db.Pessoas
        .AsNoTracking()
        .OrderBy(pessoa => pessoa.ID)
        .ToListAsync();

    var transacoes = await db.Transacoes
        .AsNoTracking()
        .ToListAsync();

    var totaisPorPessoa = pessoas.Select(pessoa =>
    {
        var transacoesPessoa = transacoes.Where(transacao => transacao.PessoaID == pessoa.ID);

        var totalReceitas = transacoesPessoa.Where(transacao => transacao.Tipo == TipoDeTransacao.Receita).Sum(transacao => transacao.Valor);

        var totalDespesas = transacoesPessoa.Where(transacao => transacao.Tipo == TipoDeTransacao.Despesa).Sum(transacao => transacao.Valor);

        return new PessoaTotalDTO
        {
            PessoaID = pessoa.ID,
            Nome = pessoa.Nome,
            TotalReceitas = totalReceitas,
            TotalDespesas = totalDespesas
        };
    })
    .ToList();

    var TotalGeral = new TotalGeralDTO
    {
        TotalReceitas = totaisPorPessoa.Sum(pessoa => pessoa.TotalReceitas),
        TotalDespesas = totaisPorPessoa.Sum(pessoa => pessoa.TotalDespesas)
    };

    var resposta = new TotalDTO
    {
        Pessoas = totaisPorPessoa,
        TotalGeral = TotalGeral
    };

    return Results.Ok(resposta);
});

app.Run();
