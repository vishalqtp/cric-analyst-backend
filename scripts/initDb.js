const database = require('../database/database');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  try {
    console.log('🚀 Initializing Cricket Match Database...');
    
    // Check if database file already exists
    const dbPath = path.join(__dirname, '..', 'cricket.db');
    const dbExists = fs.existsSync(dbPath);
    
    if (dbExists) {
      console.log('📁 Database file already exists at:', dbPath);
    } else {
      console.log('📁 Creating new database file at:', dbPath);
    }
    
    // Connect and create tables
    await database.connect();
    
    // Verify tables exist
    console.log('🔍 Verifying database structure...');
    
    // Get table info to confirm structure
    const tableInfo = await new Promise((resolve, reject) => {
      database.db.all("PRAGMA table_info(Matches)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    if (tableInfo.length > 0) {
      console.log('✅ Matches table structure:');
      tableInfo.forEach(col => {
        console.log(`   - ${col.name}: ${col.type}${col.pk ? ' (PRIMARY KEY)' : ''}${col.notnull ? ' NOT NULL' : ''}`);
      });
    }
    
    // Check if there's existing data
    const count = await new Promise((resolve, reject) => {
      database.db.get("SELECT COUNT(*) as count FROM Matches", (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    console.log(`📊 Current matches in database: ${count}`);
    console.log('✅ Database initialized successfully!');
    console.log(`📍 Database location: ${dbPath}`);
    
    await database.close();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();