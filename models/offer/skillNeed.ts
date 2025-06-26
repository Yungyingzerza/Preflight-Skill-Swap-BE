import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { sequelize } from '../../config/database';
import Offer from './offer';
import Skill from '../skill';

class SkillNeed extends Model<
    InferAttributes<SkillNeed>,
    InferCreationAttributes<SkillNeed>
> {
    declare id: CreationOptional<string>; //PK
    declare req_id: string; // FK: offer.req_user_id or offer.res_user_id
    declare skill_id: string; // FK: skill.id
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

SkillNeed.init(
    {
        id: {
            type: DataTypes.STRING,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        req_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: Offer, 
                key: 'req_user_id',
            },
        },
        skill_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: Skill, 
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
        tableName: 'skill_needs',
    }
);

export default SkillNeed;