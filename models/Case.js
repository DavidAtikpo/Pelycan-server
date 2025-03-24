'use strict';

module.exports = (sequelize, DataTypes) => {
  const Case = sequelize.define('Case', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('high', 'medium', 'low'),
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM('new', 'assigned', 'in_progress', 'completed'),
      defaultValue: 'new'
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    professional_id: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    tableName: 'cases',
    timestamps: true,
    underscored: true
  });

  Case.associate = function(models) {
    // S'assurer que models.CaseAssignment existe avant de créer l'association
    if (models.CaseAssignment) {
      Case.hasMany(models.CaseAssignment, {
        foreignKey: 'case_id',
        as: 'assignments'
      });
    }
    
    Case.belongsTo(models.User, {
      foreignKey: 'professional_id',
      as: 'professional'
    });
  };

  return Case;
};
