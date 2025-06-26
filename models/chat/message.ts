import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../../config/database';
import Conversation from './conversation';
import User from '../user';

class Message extends Model<
  InferAttributes<Message>,
  InferCreationAttributes<Message>
> {
  declare id: CreationOptional<string>;
  declare conversation_id: string;
  declare sender_id: string;
  declare message: string;
  declare is_read: CreationOptional<boolean>;

  // Optional: If you're using timestamps
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Conversation, // Assuming you have a Conversation model
        key: 'id',
      },
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User, // Assuming you have a User model
        key: 'id',
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'messages',
    modelName: 'Message',
    timestamps: true, // if you want createdAt and updatedAt
  }
);

// Define associations if needed
Conversation.hasMany(Message, {
    foreignKey: 'conversation_id',
});

Message.belongsTo(Conversation, {
    foreignKey: 'conversation_id',
});

User.hasMany(Message, {
    foreignKey: 'sender_id',
});

Message.belongsTo(User, {
    foreignKey: 'sender_id',
});

export default Message;
