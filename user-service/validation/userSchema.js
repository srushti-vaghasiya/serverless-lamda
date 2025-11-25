const yup = require("yup");

const registerSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required")
    .max(255, "Email must be less than 255 characters"),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  firstName: yup
    .string()
    .required("First name is required")
    .max(100, "First name must be less than 100 characters")
    .trim(),

  lastName: yup
    .string()
    .required("Last name is required")
    .max(100, "Last name must be less than 100 characters")
    .trim(),
});

const loginSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),

  password: yup.string().required("Password is required"),
});

const updateProfileSchema = yup.object({
  firstName: yup
    .string()
    .required("First name is required")
    .max(100, "First name must be less than 100 characters")
    .trim(),

  lastName: yup
    .string()
    .required("Last name is required")
    .max(100, "Last name must be less than 100 characters")
    .trim(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
};
