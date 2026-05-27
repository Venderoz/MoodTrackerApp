FROM node:22-alpine AS build
WORKDIR /app
# Kopiujemy informacje o paczkach i instalujemy narzędzie pnpm (którego używasz)
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm
RUN pnpm install
# Kopiujemy resztę kodu i budujemy czysty HTML/JS/CSS
COPY . .
RUN pnpm run build

# Etap 2: Szybki serwer Nginx do wyświetlania gotowej strony
FROM nginx:alpine
# Kopiujemy konfigurację Nginxa
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Kopiujemy zbudowane pliki z Etapu 1 prosto do folderu publicznego Nginxa
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]