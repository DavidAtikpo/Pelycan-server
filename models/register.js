'use strict';

const bcrypt = require('bcrypt');

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
      allowNull: true // Permettre null pour les connexions Google
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    biometric_data: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    google_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    role: {
      type: DataTypes.ENUM('user', 'pro', 'admin'),
      defaultValue: 'user'
    },
    status: {
      type: DataTypes.ENUM('active', 'pending', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const saltRounds = 10;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const saltRounds = 10;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      }
    }
  });

  // Méthodes de classe
  User.checkUserExists = async function(email) {
    const user = await this.findOne({ where: { email } });
    return !!user;
  };

  User.createUser = async function(userData) {
    const { fullName, email, password, phoneNumber, biometricData } = userData;
    return await this.create({
      full_name: fullName,
      email,
      password,
      phone_number: phoneNumber,
      biometric_data: biometricData
    });
  };

  User.createOrUpdateGoogleUser = async function(googleData) {
    const { email, fullName, googleId } = googleData;
    
    const [user, created] = await this.findOrCreate({
      where: { email },
      defaults: {
        full_name: fullName,
        google_id: googleId,
        status: 'active'
      }
    });

    if (!created && (user.full_name !== fullName || user.google_id !== googleId)) {
      await user.update({
        full_name: fullName,
        google_id: googleId
      });
    }

    return user;
  };

  // Méthodes d'instance
  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  // Associations
  User.associate = function(models) {
    User.hasMany(models.Alert, {
      foreignKey: 'user_id',
      as: 'alerts'
    });
    User.hasMany(models.EmergencyRequest, {
      foreignKey: 'user_id',
      as: 'emergencyRequests'
    });
    // ... autres associations
  };

  return User;
};
