# Etapa 1: build do front-end com Node.
FROM node:22-alpine AS build

WORKDIR /app

# Copia os arquivos de dependências primeiro para aproveitar cache.
COPY package*.json ./

# Instala dependências de forma reproduzível.
RUN npm ci

# Copia o restante do projeto.
COPY . .

# Gera a versão final do React/Vite.
RUN npm run build

# Etapa 2: servidor web leve para servir os arquivos estáticos.
FROM nginx:alpine AS final

# Remove a configuração padrão do Nginx.
RUN rm /etc/nginx/conf.d/default.conf

# Copia nossa configuração.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build gerado pelo Vite.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80