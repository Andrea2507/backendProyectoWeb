const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.NAME,
  process.env.USER,
  process.env.PASS,
  {
    host: process.env.HOST,
    port: process.env.PORT_SQL,
    dialect: 'mysql',
    logging: false
  }
);

module.exports = sequelize;
