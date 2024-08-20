'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
    class Ad extends Model {

    }
    Ad.init({
        title: DataTypes.STRING,
        description: DataTypes.STRING,
        price: DataTypes.FLOAT,
        phoneNumber: DataTypes.NUMBER,
        email: DataTypes.STRING,
        approved: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Ad',
    });
    return Ad;
};