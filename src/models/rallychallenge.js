'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class RallyChallenge extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  RallyChallenge.init({
    user_id: DataTypes.INTEGER,
    channel_id: DataTypes.INTEGER,
    rally_state: DataTypes.STRING,
    rally_account_id: DataTypes.STRING,
    required_rules: DataTypes.STRING,
    settled: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'RallyChallenge'
  })
  return RallyChallenge
}
