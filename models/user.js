'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
    class User extends Model {

    }
    User.init({
        login: DataTypes.STRING,
        password: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'User',
    });
    return User;
};