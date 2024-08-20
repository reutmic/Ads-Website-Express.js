var express = require('express');
var router = express.Router();

const db = require('../models');

/**
 * This route is for getting all the ads from the ads sequelize table.
 */
router.get('/ads', (req, res) => {
    return db.Ad.findAll()
        .then((ads) => {
            res.send(ads);
        })
        .catch((err) => {
            console.log('There was an error querying ads', JSON.stringify(err))
            err.error = 1;
            return res.status(400).send(err)
        });
});

////////

/**
 * This route is for getting all the user from the users sequelize table.
 */
router.get('/users', (req, res) => {
    return db.User.findAll()
        .then((users) => {
            res.send(users);
        })
        .catch((err) => {
            console.log('There was an error querying users', JSON.stringify(err))
            err.error = 1;
            return res.status(400).send(err)
        });
});



module.exports = router;