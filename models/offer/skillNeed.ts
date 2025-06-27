import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../../config/database";
import Skill from "../skill";

class SkillNeed extends Model<
  InferAttributes<SkillNeed>,
  InferCreationAttributes<SkillNeed>
> {
  declare id: CreationOptional<string>; //PK
  declare skill_need_id: string; // FK: offer.req_user_id or offer.res_user_id
  declare skill_id: string; // FK: skill.id
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

SkillNeed.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    skill_need_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    skill_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Skill,
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
    tableName: "skill_needs",
  }
);

//associations
Skill.hasMany(SkillNeed, {
  foreignKey: "skill_id",
});

SkillNeed.belongsTo(Skill, {
  foreignKey: "skill_id",
});

export default SkillNeed;
