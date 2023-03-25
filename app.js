const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3004, () => {
      console.log("Server Running at http://localhost:3004/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1
app.get("/players/", async (request, response) => {
  const getPlayersList = `
    SELECT
      *
    FROM
      cricket_team;`;

  const players = await db.all(getPlayersList);
  const playersObj = (dbObj) => {
    return {
      playerId: dbObj.player_id,
      playerName: dbObj.player_name,
      jerseyNumber: dbObj.jersey_number,
      role: dbObj.role,
    };
  };

  response.send(players.map((eachPlayer) => playersObj(eachPlayer)));
});

//API 2
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addingPlayer = `
        INSERT INTO
            cricket_team(player_name,jersey_number,role)
        VALUES
            ('${playerName}',${jerseyNumber},'${role}')
        ;`;

  const players = await db.run(addingPlayer);
  const playerId = players.lastID;

  response.send("Player Added to Team");
});

//API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT
      *
    FROM
      cricket_team
    WHERE 
      player_id = ${playerId};`;

  const player = await db.get(getPlayer);
  const playerObj = (player) => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
      jerseyNumber: player.jersey_number,
      role: player.role,
    };
  };
  response.send(playerObj(player));
});

//API 4

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const updatePlayerDetails = request.body;

  const updatePlayer = `
    UPDATE
      cricket_team
    SET
      player_name = '${updatePlayerDetails.playerName}',
      jersey_number = ${updatePlayerDetails.jerseyNumber},
      role = '${updatePlayerDetails.role}'
    WHERE
      player_id = ${playerId};
    `;

  await db.run(updatePlayer);
  response.send("Player Details Updated");
});

// API 5

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE FROM
      cricket_team
    WHERE 
      player_id = ${playerId};`;

  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
