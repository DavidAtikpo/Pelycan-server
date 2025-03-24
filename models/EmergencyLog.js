'use strict';

module.exports = (sequelize, DataTypes) => {
  const EmergencyLog = sequelize.define('EmergencyLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    emergency_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    details: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    performed_by: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'emergency_logs',
    timestamps: true,
    underscored: true
  });

  EmergencyLog.associate = function(models) {
    EmergencyLog.belongsTo(models.EmergencyRequest, {
      foreignKey: 'emergency_id',
      as: 'emergency'
    });
    EmergencyLog.belongsTo(models.User, {
      foreignKey: 'performed_by',
      as: 'performer'
    });
  };

  return EmergencyLog;
};
