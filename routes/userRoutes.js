var express = require('express');
var router = express.Router();
const moment = require('moment');


const Sequelize = require('sequelize');

const db = require('../models');

/**
 * This route is for getting to the "post new ad" page.
 */
router.get('/add', (req, res) => {
    let userInfo;

    // checking if the current user has already posted an ad:
    if (req.cookies.userAdInfo) {
        const { email, date } = req.cookies.userAdInfo;
        userInfo = `Welcome back ${email}, your previous ad was posted on ${date}`;
    }
    else {
        userInfo = 'Post here your first ad!';
    }

    res.render('postNewAd', { title: 'Post a new ad' , userInfo: userInfo , message: '', formData: req.body});
});

/////////

/**
 * This route is for posting a new ad - This is the routing the website goes to after the user clicks on the
 * "Add new ad" button.
 */
router.post('/add', (req, res) => {
    const { title, description, price, phoneNumber, email} = req.body;

    // getting info about the user:
    let userInfo;
    if (req.cookies.userAdInfo) {
        const { email, date } = req.cookies.userAdInfo;
        userInfo = `Welcome back ${email}, your previous ad was posted on ${date}`;
    }
    else {
        userInfo = 'Post here your first ad!';
    }

    // checking validation:
    // regex for email validation:
    let regex = /^[A-Za-z0-9!#$%&'*+\-\/=?^_`{|}~]+(?:\.[A-Za-z0-9!#$%&'*+\-\/=?^_`{|}~]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9\-]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[A-Za-z0-9\-]*[A-Za-z0-9])?$/;

    // checking mandatory fields:
    if (title === "" || price === "" || email === "") {
        res.render('postNewAd', { title: 'Post a new ad' , userInfo: userInfo,
        message: 'Missing one or more required fields!', formData: req.body});
    }

    // checking price validation:
    else if (price < 0) {
        res.render('postNewAd', { title: 'Post a new ad' , userInfo: userInfo,
            message: 'Price cannot be negative', formData: req.body});
    }

    // checking the email address:
    else if (!regex.test(email)) {
       res.render('postNewAd', { title: 'Post a new ad' , userInfo: userInfo,
           message: 'Email address is not valid', formData: req.body});
    }

    else {      // if the inputs are valid
        // adding a new ad to the sequelize table:
        let ad = db.Ad.build({ title: title, description: description, price: price,
            phoneNumber: phoneNumber, email: email , approved: false});

        // saving the user information:
        res.cookie('userAdInfo', { email: email, date: moment().format('YYYY-MM-DD') });

        return ad.save()
            .then((ad) => {
                res.render('newAdSuccess', { title: 'Added'});            }
            )
            .catch((err) => {
                if (err instanceof Sequelize.ValidationError) {
                    res.render('index', {message: `Invalid input: ${err}`});
                } else if (err instanceof Sequelize.DatabaseError) {
                    res.render('index', {message: `Database error: ${err}`});
                } else {
                    res.render('index', {message: `Unexpected error: ${err}`});
                }
            })
    }
});

///////////

/**
 * This route is for getting the login page:
 */
router.get('/login', (req, res) => {
    // to not save credentials in the browser's memory:
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    // if an admin is already logged in and didn't log out, trying to get to the "login" page will
    // automatically redirect the logged in user to the admin page without having to do login again:
    if (req.session && req.session.isAdmin) {   // if the user is an admin, show the admin page:
        res.redirect('/user/admin-page');
    } else {    // if not, show the login page:
        res.render('login', { title: 'Login Page' , message: ''});
    }
});

/////////

/**
 * This route is for validating the credentials of the login when trying to get to the admin page (when the user
 * clicks on "login", and redirecting to the relevant page:
 */
router.post('/admin-page', async (req, res) => {
     const { login, password } = req.body;
        try {
            const users = await db.User.findAll();  // getting all the users

            // checking if there's a match between the input credentials and one of the users:
            const admin = users.find(user => user.login === login && user.password === password);

            if (!admin) {   // if there wasn't a match:
                res.render('login', { title: 'Login Page', message: 'Invalid username or password' });
            } else {    // if there was a match:
                if (!req.session) {
                    req.session = {};   // initializng a session for the admin
                }
                req.session.isAdmin = true;     //  defining an 'isAdmin' attribute as 'true'
                res.render('loginSuccess', { title: 'Successful Login' });
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            res.status(500).send('Internal server error');
        }
})

////////////

/**
 * This function is a middleware for getting the admin page - it checks if a user is an admin or not
 * before redirecting them.
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
const isAdmin = (req, res, next) => {
    // checking if the user is an admin:
    if (req.session && req.session.isAdmin) {
        return next();      // continue to the next middleware function or routing
    } else {
        // redirecting the user to the login page with a relevant message:
        res.render('login', { title: 'Login Page', message: 'Need to log in as an admin first!' });
    }
};

//////////

/**
 * This route is for getting the admin page. It calls the middleware function isAdmin before redirecting
 * the user to the admin page.
 */
router.get('/admin-page', isAdmin, (req, res) => {
    // This line is for not allowing the user to get to the admin page after they logout and click on
    // the "back" button of the browser:
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    // showing the admin page:
    res.render('admin', { title: 'Admin Page' });
});

///////////

/**
 * This route is for deleting an ad - it's a routing for when an admin clicks on a "delete" button of an ad.
 */
router.delete('/delete/:adID', async (req, res) => {
    try {
        const adID = req.params.adID;
        // deleting the ad:
        const deletedAd = await db.Ad.destroy({ where: { id: adID } });

        if (deletedAd === 1) {
            res.status(200).send('Ad deleted successfully');
        } else {
            res.status(404).send('Ad not found');
        }
    } catch (error) {
        console.error('Error deleting ad:', error);
        res.status(500).send('Internal server error');
    }
});

////////////

/**
 * This route is for approving an ad - it's a routing for when an admin clicks on an "approve ad" button of an ad.
 */
router.patch('/approve/:adID', async (req, res) => {
    try {
        const adID = req.params.adID;

        // changing the 'approved' attribute of the ad to "true":
        const updatedAd = await db.Ad.update({ approved: true }, { where: { id: adID } });

        if (updatedAd[0] === 1) {
            res.status(200).send('Ad approved successfully');
        } else {
            res.status(404).send('Ad not found');
        }
    } catch (error) {
        console.error('Error approving ad:', error);
        res.status(500).send('Internal server error');
    }
});

//////////

/**
 * This route is for terminating the admin session when they click on the "logout" button, so they will not
 * be able to get to admin page without being logged in:
 */
router.get('/logout', (req, res) => {
    // destroy the user's session:
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal server error');
        } else {
            res.redirect('/');      // redirecting to the main page after logging out
        }
    });
});


module.exports = router;