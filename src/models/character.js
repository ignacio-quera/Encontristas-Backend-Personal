'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Character extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Game, {
        foreignKey: 'gameId',
      });
      this.belongsTo(models.Player, {
        foreignKey: 'playerId',
      });
    }
  }
  Character.init({
    gameId: DataTypes.INTEGER,
    playerId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    x: DataTypes.INTEGER,
    y: DataTypes.INTEGER,
    movement: DataTypes.INTEGER,
    turn: DataTypes.INTEGER,
    hp: DataTypes.INTEGER,
    dmg: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Character',
  });
  return Character;
};