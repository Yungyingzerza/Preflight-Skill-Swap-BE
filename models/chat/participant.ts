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

class Participant extends Model<
  InferAttributes<Participant>,
  InferCreationAttributes<Participant>
> {
  declare id: CreationOptional<string>;
  declare conversation_id: string; // Assuming this is a foreign key to a Conversation model
  declare user_id: string; // Assuming this is a foreign key to a User model

  // Optional: If you're using timestamps
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Participant.init(
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User, // Assuming you have a User model
        key: 'id',
      },
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
    tableName: 'participants',
    modelName: 'Participant',
    timestamps: true, // if you want createdAt and updatedAt
  }
);

// Define associations if needed

Conversation.hasMany(Participant, {
    foreignKey: 'conversation_id',
});

Participant.belongsTo(Conversation, {
    foreignKey: 'conversation_id',
});

User.hasMany(Participant, {
    foreignKey: 'user_id',
});

Participant.belongsTo(User, {
    foreignKey: 'user_id',
});

export default Participant;
