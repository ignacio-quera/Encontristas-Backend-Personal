# grupo-Los-Encontristas-backend

## Entidades

User: username, mail, password

Lobby: hostId, name

Participant: lobbyId, userId

Game: name, pm, level, turn, winner

Player: userId, gameId

Character: type, gameId, playerId, x, y, movement, turn, hp, dmg

Item: type, x, y, gameId

## Relaciones

Lobby: hostId -> User:ID

Participant: lobbyId -> Lobby:iD, userId -> User:iD

Game: pm -> User:ID

Player: userId -> User:iD, gameId -> Game:Id

Character: gameId -> Game:Id

Item: gameId -> Game:Id

## Instrucciones para inicializar el proyecto

Primero que nada, es necesario instalar `node`.
Se recomienda usar `nvm`, y luego activar `node` con:

```bash
nvm use node
```

También es necesario instalar yarn:

```bash
npm install --global yarn
```

Para inicializar el proyecto, hay que instalar las dependencias, crear el .env y inicializar la base de datos, lo que se hace con los siguientes comandos:

```bash
cp .env.example .env
yarn install
sudo -u postgres createuser --superuser encontrista_user
sudo -u postgres psql -c "ALTER USER encontrista_user WITH PASSWORD 'encontrado123'"
sudo -u postgres createdb encontrista_db_development
sudo -u postgres createdb encontrista_db_test
sudo -u postgres createdb encontrista_db_production
yarn sequelize-cli db:migrate
```

Luego, para correr el proyecto basta con inicializar el servidor de prueba con el siguiente comando:

```bash
yarn dev
```

Esto inicializa un servidor local de prueba (por defecto en el puerto 3000).
Se puede probar con Postman conectándose al host localhost:3000.

## Documentación

La documentación se encuentra disponible en http://localhost:3000/docs tras correr el servidor local de prueba.

## Flujo del juego

El flujo del juego es el siguiente:

Primero, se debe crear usuarios para poder tener suficientes jugadores para crear un lobby.
Esto se hace con requests POST a /users.

Una vez realizado esto, un jugador debe crear un lobby, lo cual hara que este jugador sea el PM, el cual se encarga de crear enemigos e items para los demas jugadores.
Esto se realiza con un request POST a /lobby.

Una vez creado el lobby, los distintos jugadores se debaran unir, lo que les asignara un personaje para jugar dentro del juego.
Esto se hace con un request POST a /lobby/join.

Con todos los jugadores unidos, se inicia el juego con un POST a /game.

Una vez dentro del juego, el PM puede crear personajes enemigos con un POST a /characters, y items con POST a /items.
Estas requests se pueden realizar en cualquier momento.

Los jugadores pueden jugar en sus respectivos turnos con /characters/move y /characters/action para terminar su turno.
El PM también tiene que jugar cuando le toca a sus enemigos.

Cuando se maten a todos los enemigos o todos los aliados, el juego terminará, y se marcará la variable winner.
El estado del juego se puede ver en cualquier momento con un request GET a /game.
