'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Player, {
        foreignKey: "id",
      });
    }
  }
  User.init({
    username: {
      type:DataTypes.STRING,
      validate: {
        isAlphanumeric: {
          msg: "Username must be alphanumeric"
        }
      },
    },
    password: {
      type:DataTypes.STRING,
      validate: {
        isValidPassword(value) {
          if (value.length < 8) {
            throw new Error('The password must be at least 8 characters long')
          }
        }
      },
    },
    mail: {
      type:DataTypes.STRING,
      validate: {
        isEmail: {
          msg: "mail must have mail format"
        }
      },
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};