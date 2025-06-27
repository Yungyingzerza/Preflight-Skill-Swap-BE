import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../../config/database";
import User from "../user";
import Status from "./status";
import SkillNeed from "./skillNeed";

class Offer extends Model<
  InferAttributes<Offer>,
  InferCreationAttributes<Offer>
> {
  declare id: CreationOptional<string>; // PK
  declare req_user_id: string; // FK: user.id
  declare req_skill_need_id: string;
  declare res_user_id: string; // FK: user.id
  declare res_skill_need_id: string;
  declare status_id: CreationOptional<string>; // FK: status.id
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Offer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    req_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    req_skill_need_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: SkillNeed,
        key: "skill_need_id",
      },
    },
    res_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    res_skill_need_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: SkillNeed,
        key: "skill_need_id",
      },
    },
    status_id: {
      type: DataTypes.UUID,
      allowNull: true, // Optional, can be null if not set
      references: {
        model: Status,
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
    tableName: "offers",
  }
);

// Associations
User.hasMany(Offer, {
  foreignKey: "req_user_id",
});

User.hasMany(Offer, {
  foreignKey: "res_user_id",
});

Offer.belongsTo(User, {
  foreignKey: "req_user_id",
});

Offer.belongsTo(User, {
  foreignKey: "res_user_id",
});

Status.hasMany(Offer, {
  foreignKey: "status_id",
});

Offer.belongsTo(Status, {
  foreignKey: "status_id",
});

SkillNeed.hasMany(Offer, {
  foreignKey: "req_skill_need_id",
});

SkillNeed.hasMany(Offer, {
  foreignKey: "res_skill_need_id",
});

Offer.belongsTo(SkillNeed, {
  foreignKey: "req_skill_need_id",
});

Offer.belongsTo(SkillNeed, {
  foreignKey: "res_skill_need_id",
});

export default Offer;
