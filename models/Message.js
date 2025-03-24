'use strict';

module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    receiver_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'text'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'messages',
    timestamps: true,
    underscored: true
  });

  Message.associate = function(models) {
    Message.belongsTo(models.User, {
      foreignKey: 'sender_id',
      as: 'sender'
    });
    Message.belongsTo(models.User, {
      foreignKey: 'receiver_id',
      as: 'receiver'
    });
  };

  return Message;
};
