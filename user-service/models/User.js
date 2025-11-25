const pool = require("../config/database");
const bcrypt = require("bcryptjs");

const imageUrl = "http://localhost:5000/";

class User {
  static async create(userData) {
    const { email, password, firstName, lastName } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (email, password, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, first_name, last_name,CASE 
        WHEN avatar IS NOT NULL THEN CONCAT('${imageUrl}', avatar)
        ELSE NULL
      END AS avatar, created_at
    `;

    const values = [email, hashedPassword, firstName, lastName];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id, email, first_name, last_name, CASE 
        WHEN avatar IS NOT NULL THEN CONCAT('${imageUrl}', avatar)
        ELSE NULL
      END AS avatar,created_at, updated_at 
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, userData) {
    const { firstName, lastName, avatar } = userData;
    const query = `
      UPDATE users 
      SET first_name = $1, last_name = $2,avatar= $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, email, first_name, last_name,  CASE 
        WHEN avatar IS NOT NULL THEN CONCAT('${imageUrl}', avatar)
        ELSE NULL
      END AS avatar,updated_at
    `;
    const values = [firstName, lastName, avatar, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
