# grupo-Los-Encontristas-backend

Entidades

Usuario: username, email, password

Jugador: usuario, juego

Juego: name, date, pm, nivel, turno

Personaje: tipo, juego, jugador, posicion(x,y), movimiento, turno, vida, daño

Objetos: tipo, posicion(x,y), juego

Lobby: host

Participante: lobby, usuario

Relacion


yarn install para instalar las dependencias
crear archivo .env
``touch .env``
db_user: encontrista_user
db_pass: encontrado123
db_name: encontrista_db
db_host: localhost
PORT: 3000

crear db encontrista_db_development, encontrista_db_test, encontrista_db_production

Crear usuarios


