const Product = require("../models/Product");
const { successResponse, errorResponse } = require("../utils/response");
const {
  createProductSchema,
  updateProductSchema,
  queryParamsSchema,
} = require("../validation/productSchema");

// Get all products with filtering and pagination
const getAllProducts = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};

    // Validate query parameters
    const validatedParams = await queryParamsSchema.validate({
      limit: queryParams.limit ? parseInt(queryParams.limit) : undefined,
      offset: queryParams.offset ? parseInt(queryParams.offset) : undefined,
      category: queryParams.category,
      search: queryParams.search,
    });

    const result = await Product.findProducts(
      validatedParams.search,
      validatedParams.limit,
      validatedParams.offset,
      validatedParams.category
    );

    return successResponse({
      ...result,
      hasMore: result.offset + result.limit < result.total,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    if (error.name === "ValidationError") {
      return errorResponse(error.errors.join(", "), 400);
    }

    return errorResponse("Failed to fetch products", 500);
  }
};

// Get product by ID
const getProductById = async (event) => {
  try {
    const { id } = event.pathParameters;

    if (!id || isNaN(parseInt(id))) {
      return errorResponse("Invalid product ID", 400);
    }

    const product = await Product.findById(parseInt(id));

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return errorResponse("Failed to fetch product", 500);
  }
};

// Create new product (requires authentication)
const createProduct = async (event) => {
  try {
    const { userId } = event.requestContext.authorizer;

    // Parse request body
    const requestBody = JSON.parse(event.body);

    // Validate request data
    const validatedData = await createProductSchema.validate(requestBody);

    // Create product
    const product = await Product.create({
      ...validatedData,
      createdBy: userId,
    });

    return successResponse(product, 201);
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.name === "ValidationError") {
      return errorResponse(error.errors.join(", "), 400);
    }

    return errorResponse("Failed to create product", 500);
  }
};

// Update product (requires authentication)
const updateProduct = async (event) => {
  try {
    const { userId } = event.requestContext.authorizer;

    const { id } = event.pathParameters;
    if (!id || isNaN(Number(id))) {
      return errorResponse("Invalid product ID", 400);
    }

    // Check if product exists
    const existingProduct = await Product.findById(parseInt(id));
    if (!existingProduct) {
      return errorResponse("Product not found", 404);
    }
    if (existingProduct.created_by != userId) {
      return errorResponse("Permission denied!!", 403);
    }
    // Parse request body
    const requestBody = JSON.parse(event.body);

    // Validate request data
    const validatedData = await updateProductSchema.validate(requestBody);
    // Update product
    const updatedProduct = await Product.update(parseInt(id), validatedData);

    return successResponse(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.name === "ValidationError") {
      return errorResponse(error.errors.join(", "), 400);
    }

    return errorResponse("Failed to update product", 500);
  }
};

// Delete product (requires authentication)
const deleteProduct = async (event) => {
  try {
    const { userId } = event.requestContext.authorizer;

    const { id } = event.pathParameters;

    if (!id || isNaN(parseInt(id))) {
      return errorResponse("Invalid product ID", 400);
    }

    // Check if product exists
    const existingProduct = await Product.findById(parseInt(id));
    if (!existingProduct) {
      return errorResponse("Product not found", 404);
    }
    if (existingProduct.created_by != userId) {
      return errorResponse("Permission denied!!", 403);
    }
    // Delete product
    await Product.delete(parseInt(id));

    return successResponse({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return errorResponse("Failed to delete product", 500);
  }
};

// Get product categories
const getCategories = async (event) => {
  try {
    const categories = await Product.getCategories();
    return successResponse(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return errorResponse("Failed to fetch categories", 500);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};
