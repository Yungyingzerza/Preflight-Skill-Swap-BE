import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database';
import User from './user';
import Skill from './skill';

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
            type: DataTypes.STRING,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: User, // Assuming you have a User model
                key: 'id',
            },
        },
        skill_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: Skill, // Assuming you have a Skill model
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
        tableName: 'user_skills',
    }
);

export default UserSkill;
