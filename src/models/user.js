'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      // User.belongsToMany(
      //   Channel,
      //   {
      //       through: 'RallyChallenges',
      //       foreignKey: 'user_id'
      //   }
      // )
    }
  }
  User.init({
    slack_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User'
  })
  return User
}
