'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM,
      values: ['user', 'pro', 'admin'],
      defaultValue: 'user',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM,
      values: ['active', 'pending', 'inactive'],
      defaultValue: 'pending',
      allowNull: false
    },
    speciality: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    google_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    biometric_data: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true
  });

  User.associate = function(models) {
    User.hasMany(models.Alert, {
      foreignKey: 'user_id',
      as: 'alerts'
    });

    User.hasMany(models.EmergencyRequest, {
      foreignKey: 'user_id',
      as: 'emergencyRequests'
    });

    User.hasMany(models.EmergencyRequest, {
      foreignKey: 'professional_id',
      as: 'assignedEmergencies'
    });

    User.hasMany(models.Message, {
      foreignKey: 'sender_id',
      as: 'sentMessages'
    });

    User.hasMany(models.Message, {
      foreignKey: 'receiver_id',
      as: 'receivedMessages'
    });

    User.hasMany(models.Logement, {
      foreignKey: 'proprietaire_id',
      as: 'logements'
    });

    User.hasMany(models.Don, {
      foreignKey: 'donateur_id',
      as: 'dons'
    });

    User.belongsToMany(models.Structure, {
      through: 'structure_staff',
      foreignKey: 'user_id',
      as: 'structures'
    });

    User.hasMany(models.HebergementTemporaire, {
      foreignKey: 'beneficiaire_id',
      as: 'hebergements'
    });

    User.hasMany(models.EmergencyNotification, {
      foreignKey: 'user_id',
      as: 'notifications'
    });

    User.hasMany(models.EmergencyLog, {
      foreignKey: 'performed_by',
      as: 'emergencyLogs'
    });
  };

  return User;
};