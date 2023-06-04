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
Se recomienda usar `nvm`, y luego activarlo con:

```bash
nvm use node
```

También es necesario instalar `yarn`:

```bash
npm install --global yarn
```

Para inicializar el proyecto, hay que instalar las dependencias, crear el `.env` y inicializar la base de datos, lo que se hace con los siguientes comandos:

```bash
yarn install

```

yarn install para instalar las dependencias
crear archivo .env
``touch .env``
db_user: encontrista_user
db_pass: encontrado123
db_name: encontrista_db
db_host: localhost
PORT: 3000

crear db encontrista_db_development, encontrista_db_test, encontrista_db_production




```bash
# Instalar nvm
# npm install yarn
cp .env.example .env
nvm use node
yarn install
sudo -u postgres createuser --superuser encontrista_user
sudo -u postgres psql -c "ALTER USER encontrista_user WITH PASSWORD 'encontrado123'"
sudo -u postgres createdb encontrista_db_development
sudo -u postgres createdb encontrista_db_test
sudo -u postgres createdb encontrista_db_production
yarn sequelize-cli db:migrate

yarn dev
```
