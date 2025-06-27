import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database";
import User from "./user";
import Skill from "./skill";

class UserSkill extends Model<
  InferAttributes<UserSkill>,
  InferCreationAttributes<UserSkill>
> {
  declare id: CreationOptional<string>; // PK
  declare user_id: string; // FK: user.id
  declare skill_id: string; // FK: skill.id
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

UserSkill.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User, // Assuming you have a User model
        key: "id",
      },
    },
    skill_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Skill, // Assuming you have a Skill model
        key: "id",
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
    tableName: "user_skills",
  }
);

// Associations
User.hasMany(UserSkill, {
  foreignKey: "user_id",
});

UserSkill.belongsTo(User, {
  foreignKey: "user_id",
});

Skill.hasMany(UserSkill, {
  foreignKey: "skill_id",
});

UserSkill.belongsTo(Skill, {
  foreignKey: "skill_id",
});

export default UserSkill;
