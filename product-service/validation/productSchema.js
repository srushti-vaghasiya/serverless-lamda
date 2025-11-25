const yup = require("yup");

const createProductSchema = yup.object({
  name: yup
    .string()
    .required("Product name is required")
    .max(255, "Product name must be less than 255 characters")
    .trim(),
  description: yup
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .trim(),
  price: yup
    .number()
    .required("Price is required")
    .positive("Price must be positive")
    .max(999999.99, "Price is too high"),
  stockQuantity: yup
    .number()
    .required("Stock quantity is required")
    .integer("Stock quantity must be an integer")
    .min(0, "Stock quantity cannot be negative"),
  category: yup
    .string()
    .max(100, "Category must be less than 100 characters")
    .trim(),
});

const updateProductSchema = yup.object({
  name: yup
    .string()
    .max(255, "Product name must be less than 255 characters")
    .trim(),
  description: yup
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .trim(),
  price: yup
    .number()
    .positive("Price must be positive")
    .max(999999.99, "Price is too high"),
  stockQuantity: yup
    .number()
    .integer("Stock quantity must be an integer")
    .min(0, "Stock quantity cannot be negative"),

  category: yup
    .string()
    .max(100, "Category must be less than 100 characters")
    .trim(),
});

const queryParamsSchema = yup.object({
  limit: yup
    .number()
    .integer()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(50),
  offset: yup.number().integer().min(0, "Offset cannot be negative").default(0),
  category: yup.string().trim(),
  search: yup.string().trim(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  queryParamsSchema,
};
