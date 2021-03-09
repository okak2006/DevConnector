const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

//@route    GET api/profile/me
//@desc     Get Current users profile
//@access   Private
router.get('/me', auth, async (req, res)=>{
    try {
        // Get profile of user and additional user information (specified in arr) from the 'user' collection using populate method
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        if(!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

//@route    POST api/profile
//@desc     Create or Update User Profile
//@access   Private

// passes auth and check. [middlware , [checkers]]
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]], async(req, res) => {
    try {
        const errors = validationResult(req);
        
        // careful: errors. we use isEmpty to check
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        

    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})

module.exports = router;