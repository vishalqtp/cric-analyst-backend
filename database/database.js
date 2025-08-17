const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, '..', 'cricket.db');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error connecting to SQLite database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.initTables().then(resolve).catch(reject);
        }
      });
    });
  }

  initTables() {
    return new Promise((resolve, reject) => {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS Matches (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          TournamentName TEXT NOT NULL,
          Year TEXT NOT NULL,
          MatchId TEXT NOT NULL,
          JsonData TEXT NOT NULL
        )
      `;

      this.db.run(createTableSQL, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          reject(err);
        } else {
          console.log('Matches table ready');
          resolve();
        }
      });
    });
  }

  // Insert a new match
  insertMatch(tournamentName, year, matchId, jsonData) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO Matches (TournamentName, Year, MatchId, JsonData) VALUES (?, ?, ?, ?)`;
      
      this.db.run(sql, [tournamentName, year, matchId, jsonData], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  // Check if match exists (for duplicate detection)
  matchExists(tournamentName, matchId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) as count FROM Matches WHERE TournamentName = ? AND MatchId = ?`;
      
      this.db.get(sql, [tournamentName, matchId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count > 0);
        }
      });
    });
  }

  // Get all tournaments
  getTournaments() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT DISTINCT TournamentName FROM Matches`;
      
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const tournaments = rows.map(row => ({
            id: row.TournamentName,
            name: row.TournamentName
          }));
          resolve(tournaments);
        }
      });
    });
  }

  // Get years for a tournament
  getYears(tournamentName) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT DISTINCT Year FROM Matches WHERE TournamentName = ? ORDER BY Year DESC`;
      
      this.db.all(sql, [tournamentName], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const years = rows.map(row => row.Year);
          resolve(years);
        }
      });
    });
  }

  // Get matches by tournament and year
  getMatches(tournamentName, year) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT Id, MatchId, JsonData FROM Matches WHERE TournamentName = ? AND Year = ?`;
      
      this.db.all(sql, [tournamentName, year.toString()], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const matches = rows.map(row => ({
            id: row.Id,
            matchId: row.MatchId,
            jsonData: row.JsonData
          }));
          resolve(matches);
        }
      });
    });
  }

  // Get all matches for a tournament
  getAllMatches(tournamentName) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM Matches WHERE TournamentName = ?`;
      
      this.db.all(sql, [tournamentName], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get single match by ID
  getMatchById(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM Matches WHERE Id = ?`;
      
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = new Database();