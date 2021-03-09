const config = require('config');
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User')

//@route    GET api/users
//@desc     Test router
//@access   Public

//Note to self: in many cases these middlewares are organized into policies.
//Here we are using express-validator/check, but other validation libraries like joi are also common

router.post('/', [
    check('name', 'Name is required')
        .not()
        .isEmpty(),
    check('email', 'Invalid email')
        .normalizeEmail()
        .isEmail()
    ,
    check('password', 'Your password must be at least 8 characters, contain special characters, and have lower and upper case alphabet')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
], async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    const {name, email, password} = req.body;
    try {
        // See if user exists. Mongoose queries returns promise
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: [ {msg: 'User already exists'} ]});
        };
        // Get users gravatar. s = default size, r = rated pg, d: default image mm = user icon
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });

        // Create user
        user = new User({
            name,
            email,
            avatar,
            password
        })

        // Encrypt Password. Bcrypt .genSalt returns promise. Salt is a random string that makes hash unpredictable
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user to database. calling save method stores user in database and returns promise with additional info like id
        await user.save();

        // Return jsonwebtoken so user stays signed in
        // JWT standard flow: user submits credentials to auth server -> auth server validates creds and creates JWT token with payload and exp stamp
        // Auth server takes private key, signs jwt token, and sends it back to browser. Browser starts sending each http requests with signed JWT
        // App server checks JWT to  identify person. App knows request is coming from user because auth server only signs token after successful validation
        const payload = {
            user: {id: user.id}
        };
        jwt.sign(
            payload,
            config.get('jwtSecret'),
            {expiresIn: 36000},
            (err, token) => {
                if(err) throw err;
                res.json({ token })
            }
        );

    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;