const database = require('../database/database');

class MatchController {
  // Upload matches endpoint
  async uploadMatches(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files provided.' });
      }

      const failedFiles = [];
      const duplicateFiles = [];
      let successCount = 0;

      for (const file of req.files) {
        try {
          // Parse JSON data
          const jsonData = file.buffer.toString('utf-8');
          let parsedData;
          
          try {
            parsedData = JSON.parse(jsonData);
          } catch (parseError) {
            // JSON parsing failed - add to failed files and continue
            failedFiles.push(file.originalname);
            continue;
          }

          // Extract tournament name
          let tournamentName = "UnknownTournament";
          if (parsedData.info && parsedData.info.event && parsedData.info.event.name) {
            tournamentName = parsedData.info.event.name;
          }

          // Extract year
          let year = "0";
          if (parsedData.info && parsedData.info.season) {
            const seasonStr = parsedData.info.season.toString();
            const parsedYear = parseInt(seasonStr);
            if (!isNaN(parsedYear)) {
              year = parsedYear.toString();
            }
          }

          // Check for duplicates
          const isDuplicate = await database.matchExists(tournamentName, file.originalname);
          if (isDuplicate) {
            duplicateFiles.push(file.originalname);
            continue;
          }

          // Insert match
          await database.insertMatch(tournamentName, year, file.originalname, jsonData);
          successCount++;

        } catch (error) {
          console.error(`Error processing file ${file.originalname}:`, error);
          failedFiles.push(file.originalname);
        }
      }

      // Build response
      const response = {
        Uploaded: successCount,
        Failed: failedFiles.length,
        Duplicates: duplicateFiles.length,
        FailedFiles: failedFiles,
        DuplicateFiles: duplicateFiles
      };

      res.json(response);

    } catch (error) {
      console.error('Error in uploadMatches:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get tournaments endpoint
  async getTournaments(req, res) {
    try {
      const tournaments = await database.getTournaments();
      res.json(tournaments);
    } catch (error) {
      console.error('Error in getTournaments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get years for a tournament
  async getYears(req, res) {
    try {
      const { tournamentName } = req.params;
      const years = await database.getYears(tournamentName);
      res.json(years);
    } catch (error) {
      console.error('Error in getYears:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get matches by tournament and year
  async getMatches(req, res) {
    try {
      const { tournamentName, year } = req.params;
      const yearNum = parseInt(year);
      
      if (isNaN(yearNum)) {
        return res.status(400).json({ error: 'Invalid year parameter' });
      }

      const matches = await database.getMatches(tournamentName, yearNum);
      res.json(matches);
    } catch (error) {
      console.error('Error in getMatches:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all matches for a tournament
  async getAllMatches(req, res) {
    try {
      const { tournamentName } = req.params;
      const matches = await database.getAllMatches(tournamentName);
      res.json(matches);
    } catch (error) {
      console.error('Error in getAllMatches:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get single match JSON by ID
  async getMatchJson(req, res) {
    try {
      const { id } = req.params;
      const matchId = parseInt(id);
      
      if (isNaN(matchId)) {
        return res.status(400).json({ error: 'Invalid match ID' });
      }

      const match = await database.getMatchById(matchId);
      
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }

      // Parse and return the JSON data
      const jsonData = JSON.parse(match.JsonData);
      res.json(jsonData);
    } catch (error) {
      console.error('Error in getMatchJson:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new MatchController();