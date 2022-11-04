const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');
const File = require('../models/File');
const authMiddleware = require('../middleware/auth.middleware');
const fileService = require('../services/fileService');

const router = express.Router();
router.post(
  '/registration',

  check('email', 'Email is incorrect.').isEmail(),
  check('password', 'Password is invaled').isLength({ min: 4 }),

  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Incorrect email!.', errors });
      }
      const { email, password } = req.body;
      const userExist = await User.findOne({ email });

      if (userExist) {
        return res.status(400).json({ message: 'This user already exist!' });
      }

      const hashPassword = await bcrypt.hash(password, 5);
      const newUser = new User({ email, password: hashPassword });
      await newUser.save();
      await fileService.createDir(new File({ user: newUser._id, name: '' }));

      return res.json({ message: 'User has been created.' });
    } catch (error) {
      console.log(error);
      res.json({ message: 'Server error.' });
    }
  }
);

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }
    const isPasswordValied = bcrypt.compareSync(password, user.password);
    if (!isPasswordValied) {
      return res.status(400).json({ message: 'Invalied password.' });
    }
    const token = jwt.sign({ id: user.id }, config.get('priveteKey'), {
      expiresIn: '1h',
    });
    return res
      .json({
        token,
        user: {
          id: user.id,
          email: user.email,
          diskSpace: user.diskSpace,
          usedSpace: user.usedSpace,
          avatar: user.avatar,
        },
      })
      .send('okkk');
  } catch (error) {
    console.log(error);
    res.send({ message: 'Server Error.' });
  }
});

router.get('/auth', authMiddleware, async (req, res) => {
  try {
    const user = User.findOne({ _id: req.user.id });
    const token = jwt.sign({ id: user.id }, config.get('priveteKey'), {
      expiresIn: '1h',
    });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        diskSpace: user.diskSpace,
        usedSpace: user.usedSpace,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.log(error);
    res.send({ message: 'Server Error.' });
  }
});

module.exports = router;
