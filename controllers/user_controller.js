const db = require("../config/db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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



  const loginUser= async(req,res)=>{
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({
            success: false,
            message: 'Please provide all fields'
        });
    }

    try {
        // Check if the user exists
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).send({
                success: false,
                message: 'Invalid username'
            });
        }

        const user = users[0];

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).send({
                success: false,
                message: 'Invalid password'
            });
        }

        // Optionally, create a token for user authentication
        const token = jwt.sign({ userId: user.user_id }, 'your_jwt_secret', { expiresIn: '1h' });

        res.status(200).send({
            success: true,
            message: 'Login successful',
            token: token // Return the token if using JWT
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        });
    }

  };
  module.exports={registerUser,loginUser}