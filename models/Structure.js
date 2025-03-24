'use strict';

module.exports = (sequelize, DataTypes) => {
  const Structure = sequelize.define('Structure', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contact_info: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    services: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  }, {
    tableName: 'structures',
    timestamps: true,
    underscored: true
  });

  Structure.associate = function(models) {
    Structure.hasMany(models.HebergementTemporaire, {
      foreignKey: 'structure_id',
      as: 'hebergements'
    });
    Structure.belongsToMany(models.User, {
      through: 'structure_staff',
      foreignKey: 'structure_id',
      as: 'staff'
    });
  };

  return Structure;
};
