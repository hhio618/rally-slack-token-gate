'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RallyChallenges', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id',
          as: "user_id"
        }
      },
      channel_id: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Channels',
          key: 'id',
          as: "channel_id"
        }
      },
      rally_state: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },  
      rally_account_id: {
        type: Sequelize.STRING,
      },
      required_rules: {
        type: Sequelize.STRING,
        allowNull: false
      },
      settled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RallyChallenges');
  }
};