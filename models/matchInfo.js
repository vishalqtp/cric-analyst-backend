// models/matchInfo.js
const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // <-- use this, not ../db

const MatchInfo = sequelize.define('MatchInfo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tournamentName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.STRING,
    allowNull: false
  },
  matchId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  jsonData: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'Matches',
  timestamps: false
});

module.exports = MatchInfo;
