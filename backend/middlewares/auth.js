import { verifyToken } from "../utils/jwt.js";
import User from "../modules/user/user.model.js";
import ApiError from "../utils/ApiError.js";

// Verify JWT token and attach user to request
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Access denied. No token provided.");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, "User not found. Token is invalid.");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is deactivated. Contact admin.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token."));
    }
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token expired. Please login again."));
    }
    next(error);
  }
};

// Authorize specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required."));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You do not have permission to perform this action.")
      );
    }
    next();
  };
};
