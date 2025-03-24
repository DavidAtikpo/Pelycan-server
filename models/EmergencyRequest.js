'use strict';

module.exports = (sequelize, DataTypes) => {
  const EmergencyRequest = sequelize.define('EmergencyRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    professional_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    request_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'assigned', 'in_progress', 'completed'),
      defaultValue: 'pending'
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    assignment_note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'emergency_requests',
    timestamps: true,
    underscored: true
  });

  EmergencyRequest.associate = function(models) {
    EmergencyRequest.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'requester'
    });
    EmergencyRequest.belongsTo(models.User, {
      foreignKey: 'professional_id',
      as: 'responder'
    });
    EmergencyRequest.hasMany(models.EmergencyLog, {
      foreignKey: 'emergency_id',
      as: 'logs'
    });
    EmergencyRequest.hasMany(models.EmergencyNotification, {
      foreignKey: 'emergency_id',
      as: 'notifications'
    });
  };

  return EmergencyRequest;
};
