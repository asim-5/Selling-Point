const db = require("../config/db");
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).send({
        success: false,
        message: 'Please provide all fields'
      });
    }
  
    try {
      // Check if username already exists
      const [existingUser] = await db.query(
        'SELECT username FROM users WHERE username = ?',
        [username]
      );
  
      if (existingUser.length > 0) {
        return res.status(400).send({
          success: false,
          message: 'Username is already taken'
        });
      }
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insert the new user into the database
      const [result] = await db.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword]
      );

  
      res.status(201).send({
        success: true,
        message: 'User registered successfully'
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).send({
        success: false,
        message: 'Internal Server Error'
      });
    }
  };
  module.exports={registerUser}