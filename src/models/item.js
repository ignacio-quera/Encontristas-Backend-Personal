const {
  Model,
} = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Game, {
        foreignKey: "gameId",
      });
    }
  }
  Item.init({
    gameId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    x: DataTypes.INTEGER,
    y: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: "Item",
  });
  return Item;
};
