services:
  database:
    container_name: db_mood
    image: mariadb:latest
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    ports:
      - "${DB_PORT}:3306"
    volumes:
      - ./database:/var/lib/mysql
    networks:
      - proxy-network

  backend:
    container_name: back
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    ports:
      - "${API_PORT}:8085"
    environment:
      - ConnectionStrings__DefaultConnection=Server=database;Port=${DB_PORT};Database=${DB_NAME};Uid=root;Pwd=${DB_PASSWORD};
      - ASPNETCORE_HTTP_PORTS=8085
    depends_on:
      - database
    networks:
      - proxy-network

  frontend:
    container_name: front
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3001:80"
    depends_on:
      - backend
    networks:
      - proxy-network

networks:
  proxy-network:
    external: true