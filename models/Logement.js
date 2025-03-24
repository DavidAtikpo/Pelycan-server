'use strict';

module.exports = (sequelize, DataTypes) => {
  const Logement = sequelize.define('Logement', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    proprietaire_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    adresse: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    capacite: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    equipements: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    disponibilite: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'disponible'
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  }, {
    tableName: 'logements',
    timestamps: true,
    underscored: true
  });

  Logement.associate = function(models) {
    Logement.belongsTo(models.User, {
      foreignKey: 'proprietaire_id',
      as: 'proprietaire'
    });
    Logement.hasMany(models.HebergementTemporaire, {
      foreignKey: 'logement_id',
      as: 'hebergements'
    });
    Logement.hasMany(models.DemandeAjoutLogement, {
      foreignKey: 'logement_id',
      as: 'demandes'
    });
  };

  return Logement;
};
