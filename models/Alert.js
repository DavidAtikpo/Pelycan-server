'use strict';

module.exports = (sequelize, DataTypes) => {
  const Alert = sequelize.define('Alert', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    user_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    accuracy: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'processed', 'closed'),
      defaultValue: 'active'
    },
    messages: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    viewed_by_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'alerts',
    timestamps: true,
    underscored: true
  });

  Alert.associate = function(models) {
    Alert.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'alertCreator'
    });
    
    Alert.belongsTo(models.User, {
      foreignKey: 'other_user_id',
      as: 'assignedUser'
    });
  };

  return Alert;
};