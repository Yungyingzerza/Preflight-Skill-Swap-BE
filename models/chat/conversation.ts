import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../../config/database';
import Participant from './participant';
import Message from './message';

// Define the Conversation model LIKE HEADER FILE in C++
class Conversation extends Model<
  InferAttributes<Conversation>,
  InferCreationAttributes<Conversation>
> {
  declare id: CreationOptional<string>;

  //sometime conversation model will track participants see at file chat.services.ts line135
  declare participants?: Participant[];
  declare lastMessage?: Message | null;

  // Optional: If you're using timestamps
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

//implement the Conversation model
Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    tableName: 'conversations',
    modelName: 'Conversation',
    timestamps: true, // if you want createdAt and updatedAt
  }
);

export default Conversation;
