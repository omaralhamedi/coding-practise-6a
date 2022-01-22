const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "covid19India.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertResponseToArray = (eachObj) => {
  return {
    statId: eachObj.state_id,
    stateName: eachObj.state_name,
    population: eachObj.population,
  };
};

const convertDistrictResponseToResponse = (eachObj) => {
  return {
    districtId: eachObj.district_id,
    districtName: eachObj.district_name,
    stateId: eachObj.state_id,
    cases: eachObj.cases,
    cured: eachObj.cured,
    active: eachObj.active,
    deaths: eachObj.deaths,
  };
};
//1
app.get("/states/", async (request, response) => {
  const statesQuery = `SELECT *
     FROM state;`;

  const statesArray = await db.all(statesQuery);
  response.send(statesArray.map((eachObj) => convertResponseToArray(eachObj)));
});

//2

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const statesQuery = `SELECT *
     FROM state
     WHERE state_id = ${stateId};`;

  const statesArray = await db.get(statesQuery);
  response.send(statesArray);
});
//3
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const districtQuery = `
        INSERT INTO
            district(district_name,state_id,cases,cured,active,deaths)
            VALUES (${districtName},${stateId},${cases},${cured},${active},${deaths});`;

  await db.run(districtQuery);
  response.send("District Successfully Added");
});

//4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const statesQuery = `SELECT *
     FROM district
     WHERE district_id = ${districtId};`;

  const statesArray = await db.get(statesQuery);
  response.send(convertDistrictResponseToResponse(statesArray));
});

//5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const statesQuery = `DELETE
     FROM district
     WHERE district_id = ${districtId};`;

  const statesArray = await db.run(statesQuery);
  response.send("District Removed");
});

//6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const statesQuery = ` UPDATE
    district
  SET
    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
  WHERE
    district_id = ${districtId};
  `;

  await db.run(statesQuery);
  response.send("District Details Updated");
});

//7
app.get("/states/:stateId/stats", async (request, response) => {
  const { stateId } = request.params;
  const statesQuery = `SELECT
         SUM(cases) ,
         SUM(cured) ,
         SUM(active),
         SUM(deaths)
     FROM state INNER JOIN district ON state.state_id = district.state_id
     GROUP BY ${stateId}
     WHERE state_id = ${stateId};`;

  const stats = await db.run(statesQuery);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});

//8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const statesQuery = `SELECT state_name
  FROM state NATURAL JOIN district
  WHERE district_id = ${districtId}
   ;`;

  const state = await db.run(statesQuery);
  response.send({ stateName: state.state_name });
});

module.exports = app;

// const express = require("express");
// const { open } = require("sqlite");
// const sqlite3 = require("sqlite3");
// const path = require("path");

// const databasePath = path.join(__dirname, "covid19India.db");

// const app = express();

// app.use(express.json());

// let database = null;

// const initializeDbAndServer = async () => {
//   try {
//     database = await open({
//       filename: databasePath,
//       driver: sqlite3.Database,
//     });

//     app.listen(3000, () =>
//       console.log("Server Running at http://localhost:3000/")
//     );
//   } catch (error) {
//     console.log(`DB Error: ${error.message}`);
//     process.exit(1);
//   }
// };

// initializeDbAndServer();

// const convertStateDbObjectToResponseObject = (dbObject) => {
//   return {
//     stateId: dbObject.state_id,
//     stateName: dbObject.state_name,
//     population: dbObject.population,
//   };
// };

// const convertDistrictDbObjectToResponseObject = (dbObject) => {
//   return {
//     districtId: dbObject.district_id,
//     districtName: dbObject.district_name,
//     stateId: dbObject.state_id,
//     cases: dbObject.cases,
//     cured: dbObject.cured,
//     active: dbObject.active,
//     deaths: dbObject.deaths,
//   };
// };
// //1
// app.get("/states/", async (request, response) => {
//   const getStatesQuery = `
//     SELECT
//       *
//     FROM
//       state;`;
//   const statesArray = await database.all(getStatesQuery);
//   response.send(
//     statesArray.map((eachState) =>
//       convertStateDbObjectToResponseObject(eachState)
//     )
//   );
// });
// //2
// app.get("/states/:stateId/", async (request, response) => {
//   const { stateId } = request.params;
//   const getStateQuery = `
//     SELECT
//       *
//     FROM
//       state
//     WHERE
//       state_id = ${stateId};`;
//   const state = await database.get(getStateQuery);
//   response.send(convertStateDbObjectToResponseObject(state));
// });
// //4
// app.get("/districts/:districtId/", async (request, response) => {
//   const { districtId } = request.params;
//   const getDistrictsQuery = `
//     SELECT
//       *
//     FROM
//      district
//     WHERE
//       district_id = ${districtId};`;
//   const district = await database.get(getDistrictsQuery);
//   response.send(convertDistrictDbObjectToResponseObject(district));
// });
// //3
// app.post("/districts/", async (request, response) => {
//   const { stateId, districtName, cases, cured, active, deaths } = request.body;
//   const postDistrictQuery = `
//   INSERT INTO
//     district (state_id, district_name, cases, cured, active, deaths)
//   VALUES
//     (${stateId}, '${districtName}', ${cases}, ${cured}, ${active}, ${deaths});`;
//   await database.run(postDistrictQuery);
//   response.send("District Successfully Added");
// });
// //5
// app.delete("/districts/:districtId/", async (request, response) => {
//   const { districtId } = request.params;
//   const deleteDistrictQuery = `
//   DELETE FROM
//     district
//   WHERE
//     district_id = ${districtId}
//   `;
//   await database.run(deleteDistrictQuery);
//   response.send("District Removed");
// });
// //6
// app.put("/districts/:districtId/", async (request, response) => {
//   const { districtId } = request.params;
//   const { districtName, stateId, cases, cured, active, deaths } = request.body;
//   const updateDistrictQuery = `
//   UPDATE
//     district
//   SET
//     district_name = '${districtName}',
//     state_id = ${stateId},
//     cases = ${cases},
//     cured = ${cured},
//     active = ${active},
//     deaths = ${deaths}
//   WHERE
//     district_id = ${districtId};
//   `;

//   await database.run(updateDistrictQuery);
//   response.send("District Details Updated");
// });

// app.get("/states/:stateId/stats/", async (request, response) => {
//   const { stateId } = request.params;
//   const getStateStatsQuery = `
//     SELECT
//       SUM(cases),
//       SUM(cured),
//       SUM(active),
//       SUM(deaths)
//     FROM
//       district
//     WHERE
//       state_id=${stateId};`;
//   const stats = await database.get(getStateStatsQuery);
//   response.send({
//     totalCases: stats["SUM(cases)"],
//     totalCured: stats["SUM(cured)"],
//     totalActive: stats["SUM(active)"],
//     totalDeaths: stats["SUM(deaths)"],
//   });
// });

// app.get("/districts/:districtId/details/", async (request, response) => {
//   const { districtId } = request.params;
//   const getStateNameQuery = `
//     SELECT
//       state_name
//     FROM
//       district
//     NATURAL JOIN
//       state
//     WHERE
//       district_id=${districtId};`;
//   const state = await database.get(getStateNameQuery);
//   response.send({ stateName: state.state_name });
// });

// module.exports = app;
