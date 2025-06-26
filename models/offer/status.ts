import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize';
import { sequelize } from '../../config/database';

class Status extends Model<
    InferAttributes<Status>,
    InferCreationAttributes<Status>
> {
    declare id: CreationOptional<string>; // PK
    declare name: string;
}

Status.init(
    {
        id: {
            type: DataTypes.STRING,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'status',
    }
);

export default Status;
