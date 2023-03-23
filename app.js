const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("Server Running at http://localhost:3002/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const playersObj = (dbObj) => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    jerseyNumber: dbObj.jersey_number,
    role: dbObj.role,
  };
};

//API 1
app.get("/players/", async (request, response) => {
  const getPlayersList = `
    SELECT
      player_id,player_name,jersey_number,role
    FROM
      cricket_team;`;

  const players = await db.all(getPlayersList);

  response.send(players.map((eachPlayer) => playersObj(eachPlayer)));
});

//API 2
app.post("/players/", async (request, response) => {
  const addPlayerDet = request.body;
  const { playerName, jerseyNumber, role } = addPlayerDet;
  const addingPlayer = `
        INSERT INTO 
            cricket_team(player_name,jersey_number,role)
        VALUES
            ('${playerName}',${jerseyNumber},'${role}')
        ;`;

  const addPlayer = await db.run(addingPlayer);
  const player_id = addPlayer.lastID;

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
  const convertDbObjectToResponseObject = (player) => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
      jerseyNumber: player.jersey_number,
      role: player.role,
    };
  };
  const result = response.send(
    player.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//API 4

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const updatePlayerDetails = request.body;
  const { playerName, jerseyNumber, role } = updatePlayerDetails;

  const updatePlayer = `
    UPDATE 
      cricket_team
    SET
      player_name = '${playerName}',
      jersey_number = ${jerseyNumber},
      role = ${role}
    WHERE player_id = ${playerId};
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
