'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Channel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      // Channel.belongsToMany(
      //   User,
      //   {
      //       through: 'RallyChallenges',
      //       foreignKey: 'channel_id'
      //   }
      // )
    }
  }
  Channel.init({
    channel_name: DataTypes.STRING,
    nft_rules: DataTypes.STRING,
    coin_rules: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Channel'
  })
  return Channel
}
