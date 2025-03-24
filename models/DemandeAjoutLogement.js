'use strict';

module.exports = (sequelize, DataTypes) => {
  const DemandeAjoutLogement = sequelize.define('DemandeAjoutLogement', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    logement_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    logement_details: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('en_attente', 'approuve', 'refuse'),
      defaultValue: 'en_attente'
    },
    documents: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    commentaire_admin: {
      type: DataTypes.TEXT,
      allowNull: true
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
    DemandeAjoutLogement.belongsTo(models.Logement, {
      foreignKey: 'logement_id',
      as: 'logement'
    });
  };

  return DemandeAjoutLogement;
};
