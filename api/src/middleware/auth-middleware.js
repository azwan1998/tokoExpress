// auth-middleware.js
import jwt from "jsonwebtoken";
import { ResponseError } from "../error/response-error.js";

const authenticateToken = (req, res, next) => {

  if (req.url.startsWith("/public/uploads/")) {
    return next();
  }
  
  const token = req.headers["authorization"];

  if (!token) {
    return next(new ResponseError(401, "Token not provided"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(new ResponseError(401, "Invalid token"));
    }
    req.user = user;
    next();
  });
};

const checkUserRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user && req.user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return next(new ResponseError(403, "Access forbidden. Insufficient role."));
    }

      next();
  };
};

export { 
  authenticateToken,
  checkUserRole,
};
