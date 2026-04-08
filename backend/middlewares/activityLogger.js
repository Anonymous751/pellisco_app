// middlewares/activityLogger.js

import { createUserLog } from "../utils/createUserLog.js";

export const activityLogger = (action) => {
  return async (req, res, next) => {
    try {
      const originalJson = res.json;

      res.json = function (data) {
        // Run AFTER response (important)
        createUserLog({
          user: req.user?._id,
          action,
          req,
          metadata: {
            status: data?.success ? "SUCCESS" : "FAILED",
          },
        });

        return originalJson.call(this, data);
      };

      next();
    } catch (err) {
      next(err);
    }
  };
};
