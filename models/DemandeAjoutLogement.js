'use strict';

module.exports = (sequelize, DataTypes) => {
  const DemandeAjoutLogement = sequelize.define('DemandeAjoutLogement', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    prenom: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    justificatif: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    statut: {
      type: DataTypes.ENUM('en_attente', 'approuvee', 'refusee'),
      defaultValue: 'en_attente'
    },
    date_creation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    date_mise_a_jour: {
      type: DataTypes.DATE,
      allowNull: true
    },
    raison_demande: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    est_proprio: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'demandes_ajout_logement',
    timestamps: true,
    underscored: true
  });

  DemandeAjoutLogement.associate = function(models) {
    DemandeAjoutLogement.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'demandeur'
    });
  };

  return DemandeAjoutLogement;
};
