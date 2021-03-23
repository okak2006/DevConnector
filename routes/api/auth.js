const config = require('config');
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');

//@route    GET api/auth
//@desc     Get User Info
//@access   Public
//route protected through auth middleware
router.get('/', auth, async (req, res)=>{
    try {
        //auth middleware sets req.user after jwt identification. We don't want password so -password select
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

//@route    POST api/auth
//@desc     Authenticate user and sign jwt token
//@access   Public

router.post('/', [
    check('email', 'Invalid email')
        .normalizeEmail()
        .isEmail()
    ,
    check('password', 'Your password must be at least 8 characters, contain special characters, and have lower and upper case alphabet')
        .exists()
    ], async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        try {
            // See if user exists. Mongoose queries returns promise
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ errors: [ {msg: 'User does not exist or there is no matching credentials'} ]});
            };

            // Validate password. Hashes provided password and compares it against password in database
            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch) {
                return res.status(400).json({ errors: [ {msg: 'User does not exist or there is no matching credentials'} ]});
            }

            // Return jsonwebtoken so user stays signed in
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
    };
});

module.exports = router;