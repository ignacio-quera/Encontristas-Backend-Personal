const {
  Model,
} = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Game extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        foreignKey: "pm",
      });
    }
  }
  Game.init({
    name: DataTypes.STRING,
    pm: DataTypes.INTEGER,
    level: DataTypes.INTEGER,
    turn: DataTypes.INTEGER,
    winner: DataTypes.STRING,
  }, {
    sequelize,
    modelName: "Game",
  });
  return Game;
};
