'use strict';

module.exports = (sequelize, DataTypes) => {
  const CaseAssignment = sequelize.define('CaseAssignment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    case_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'cases',
        key: 'id'
      }
    },
    professional_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('assigned', 'in_progress', 'completed'),
      defaultValue: 'assigned'
    },
    assignment_note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'case_assignments',
    timestamps: true,
    underscored: true
  });

  CaseAssignment.associate = function(models) {
    CaseAssignment.belongsTo(models.Case, {
      foreignKey: 'case_id',
      as: 'case'
    });
    CaseAssignment.belongsTo(models.User, {
      foreignKey: 'professional_id',
      as: 'professional'
    });
  };

  return CaseAssignment;
}; 