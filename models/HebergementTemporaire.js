'use strict';

module.exports = (sequelize, DataTypes) => {
  const HebergementTemporaire = sequelize.define('HebergementTemporaire', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    logement_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    beneficiaire_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    date_debut: {
      type: DataTypes.DATE,
      allowNull: false
    },
    date_fin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('en_cours', 'termine', 'annule'),
      defaultValue: 'en_cours'
    },
    commentaires: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    conditions: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'hebergements_temporaires',
    timestamps: true,
    underscored: true
  });

  HebergementTemporaire.associate = function(models) {
    HebergementTemporaire.belongsTo(models.Logement, {
      foreignKey: 'logement_id',
      as: 'logement'
    });
    HebergementTemporaire.belongsTo(models.User, {
      foreignKey: 'beneficiaire_id',
      as: 'beneficiaire'
    });
  };

  return HebergementTemporaire;
};
