const User = require("../models/User");
const { generateToken } = require("../utils/auth");
const { successResponse, errorResponse } = require("../utils/response");
const { registerSchema, loginSchema } = require("../validation/userSchema");

const register = async (event) => {
  try {
    const body = JSON.parse(event.body);

    // Validate input

    const validateData = await registerSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Check if user already exists
    const existingUser = await User.findByEmail(validateData.email);
    if (existingUser) {
      return errorResponse("User already exists with this email", 409);
    }

    // Create new user
    const user = await User.create(validateData);

    return successResponse(user, 201);
  } catch (error) {
    console.error("Registration error:", error);

    if (error.name === "ValidationError") {
      return errorResponse(error.errors.join(", "), 400);
    }

    return errorResponse("Internal server error", 500);
  }
};

const login = async (event) => {
  try {
    const body = JSON.parse(event.body);

    // Validate input
    const validateData = await loginSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Find user
    const user = await User.findByEmail(validateData.email);
    if (!user) {
      return errorResponse("Invalid credentials", 401);
    }

    // Validate password
    const isValidPassword = await User.validatePassword(
      validateData.password,
      user.password
    );
    if (!isValidPassword) {
      return errorResponse("Invalid credentials", 401);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });
    const { password, ...rest } = user;
    return successResponse({
      user: rest,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    if (error.name === "ValidationError") {
      return errorResponse(error.errors.join(", "), 400);
    }

    return errorResponse("Internal server error", 500);
  }
};

module.exports = {
  register,
  login,
};
