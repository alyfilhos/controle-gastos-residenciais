# Etapa 1: imagem usada para compilar a aplicação.
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copia primeiro o arquivo do projeto para aproveitar cache do Docker.
COPY api.csproj ./

# Restaura os pacotes NuGet.
RUN dotnet restore

# Copia o restante do código.
COPY . ./

# Publica a aplicação em modo Release.
RUN dotnet publish -c Release -o /app/publish

# Etapa 2: imagem final, mais leve, usada apenas para executar.
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

# A API vai escutar na porta 8080 dentro do container.
ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

ENTRYPOINT ["dotnet", "api.dll"]