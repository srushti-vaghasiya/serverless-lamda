const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/response");
const { updateProfileSchema } = require("../validation/userSchema");
const { parseForm, removeFile } = require("../utils/fileStore");

const getProfile = async (event) => {
  try {
    const { userId } = event.requestContext.authorizer;

    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse(user);
  } catch (error) {
    console.error("Get profile error:", error);
    return errorResponse("Internal server error", 500);
  }
};

const updateProfile = async (event) => {
  try {
    const { userId } = event.requestContext.authorizer;
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return errorResponse("User not found", 404);
    }
    // Parse multipart form (fields + file)
    const { fields, files } = await parseForm(event);

    // Validate input fields
    const validateData = await updateProfileSchema.validate(fields, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (files.avatar) {
      // Remove old avatar if exists
      if (currentUser.avatar) {
        await removeFile(currentUser.avatar);
      }
    }
    // Update user profile
    const updatedUser = await User.update(userId, {
      ...validateData,
      avatar: files.avatar ? files.avatar.url : null,
    });
    if (!updatedUser) {
      return errorResponse("User not found", 404);
    }

    return successResponse(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    if (error.name === "ValidationError") {
      return errorResponse(error.errors.join(", "), 400);
    }
    return errorResponse("Internal server error", 500);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
