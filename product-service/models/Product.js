const pool = require("../config/database");

class Product {
  static async create(productData) {
    const { name, description, price, stockQuantity, category, createdBy } =
      productData;

    const query = `
      INSERT INTO products (name, description, price, stock_quantity, category,created_by)
      VALUES ($1, $2, $3, $4, $5,$6)
      RETURNING *
    `;

    const values = [
      name,
      description,
      price,
      stockQuantity,
      category,
      createdBy,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findProducts(
    searchTerm = null,
    limit = 50,
    offset = 0,
    category = null
  ) {
    let query = `SELECT * FROM products WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) FROM products WHERE 1=1`;

    const values = [];
    let paramIndex = 1;

    // Add searchTerm filter
    if (searchTerm) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`;
      countQuery += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`;
      values.push(`%${searchTerm}%`);
      paramIndex++;
    }
    // Add category filter
    if (category) {
      query += ` AND category = $${paramIndex}`;
      countQuery += ` AND category = $${paramIndex}`;
      values.push(category);
      paramIndex++;
    }

    // Add limit and offset
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`;
    values.push(limit, offset);

    // Query results
    const result = await pool.query(query, values);

    // Query count (only use relevant values)
    const countValues = values.slice(0, paramIndex - 1);
    const countResult = await pool.query(countQuery, countValues);

    return {
      products: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset,
      ...(searchTerm && { searchTerm }),
      ...(category && { category }),
    };
  }

  static async findById(id) {
    const query = "SELECT * FROM products WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, productData) {
    const { name, description, price, stockQuantity, category } = productData;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (name) {
      fields.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (description) {
      fields.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (price) {
      fields.push(`price = $${paramIndex++}`);
      values.push(price);
    }
    if (stockQuantity) {
      fields.push(`stock_quantity = $${paramIndex++}`);
      values.push(stockQuantity);
    }
    if (category) {
      fields.push(`category = $${paramIndex++}`);
      values.push(category);
    }

    // Always update the timestamp
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add the ID at the end
    const idParam = `$${paramIndex}`;
    values.push(id);

    const query = `
    UPDATE products 
    SET ${fields.join(", ")} 
    WHERE id = ${idParam}
    RETURNING *;
  `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = "DELETE FROM products WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getCategories() {
    const query = `
      SELECT DISTINCT category 
      FROM products 
      WHERE category IS NOT NULL 
      ORDER BY category
    `;

    const result = await pool.query(query);
    return result.rows.map((row) => row.category);
  }
}

module.exports = Product;
