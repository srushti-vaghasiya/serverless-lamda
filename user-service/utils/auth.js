const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET);
};

const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {
    principalId: principalId,
  };

  if (effect && resource) {
    authResponse.policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    };
  }

  return authResponse;
};

const verifyToken = async (event) => {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return generatePolicy("user", "Deny", event.methodArn);
  }
  try {
    const decoded = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET
    );
    // Generate policy document
    const policy = generatePolicy(
      decoded.sub || decoded.userId,
      "Allow",
      event.methodArn
    );

    // Add user context to be passed to Lambda functions
    policy.context = {
      userId: decoded.sub || decoded.userId || "",
      email: decoded.email || "",
      role: decoded.role || "user",
      // Add any other user properties you need
      username: decoded.username || "",
      // Pass the entire decoded token as JSON string if needed
      decodedToken: JSON.stringify(decoded),
    };

    return policy;
  } catch (error) {
    return generatePolicy("user", "Deny", event.methodArn);
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
