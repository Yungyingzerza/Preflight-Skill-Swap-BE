import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { sequelize } from '../../config/database';
import User from '../user';
import Status from './status';

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
            type: DataTypes.STRING,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        req_user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
        req_skill_need_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        res_user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
        res_skill_need_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status_id: {
            type: DataTypes.STRING,
            allowNull: true, // Optional, can be null if not set
            references: {
                model: Status,
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
        tableName: 'offers',
    }
);

export default Offer;