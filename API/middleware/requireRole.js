export const requireRole =
  (...roles) =>
  (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      console.warn(
        `[RBAC] Access denied — userId="${req.user?.userId}" role="${userRole}" attempted ${req.method} ${req.originalUrl}`,
      );
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
