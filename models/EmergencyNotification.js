'use strict';

module.exports = (sequelize, DataTypes) => {
  const EmergencyNotification = sequelize.define('EmergencyNotification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    emergency_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium'
    }
  }, {
    tableName: 'emergency_notifications',
    timestamps: true,
    underscored: true
  });

  EmergencyNotification.associate = function(models) {
    EmergencyNotification.belongsTo(models.EmergencyRequest, {
      foreignKey: 'emergency_id',
      as: 'emergency'
    });
    EmergencyNotification.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return EmergencyNotification;
};
