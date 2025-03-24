'use strict';

module.exports = (sequelize, DataTypes) => {
  const Don = sequelize.define('Don', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    donateur_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    quantite: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    etat: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('disponible', 'reserve', 'attribue'),
      defaultValue: 'disponible'
    },
    localisation: {
      type: DataTypes.STRING,
      allowNull: false
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  }, {
    tableName: 'dons',
    timestamps: true,
    underscored: true
  });

  Don.associate = function(models) {
    Don.belongsTo(models.User, {
      foreignKey: 'donateur_id',
      as: 'donateur'
    });
    Don.belongsToMany(models.User, {
      through: 'demandes_dons',
      foreignKey: 'don_id',
      as: 'demandeurs'
    });
  };

  return Don;
};
