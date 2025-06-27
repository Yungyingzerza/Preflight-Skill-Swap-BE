import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database';

class Skill extends Model<
    InferAttributes<Skill>,
    InferCreationAttributes<Skill>
> {
    declare id: CreationOptional<string>; // PK
    declare name: string;
    declare description: CreationOptional<string>;
    declare picture_url: CreationOptional<string>;
    }

Skill.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        picture_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'skills',
    }
);

export default Skill;