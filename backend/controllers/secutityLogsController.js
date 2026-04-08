import userLog from "../models/userLogModel.js";

export const getLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      userId,
      search,
    } = req.query;

    const query = {};

    // 🎯 Filter by action
    if (action) {
      query.action = action;
    }

    // 👤 Filter by user
    if (userId) {
      query.user = userId;
    }

    // 🔍 Search (orderId, paymentId, etc.)
    if (search) {
      query.$or = [
        { "metadata.orderId": search },
        { "metadata.paymentId": search },
        { ipAddress: search },
      ];
    }

    const skip = (page - 1) * limit;

    const logs = await userLog
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("user", "name email")
      .populate("performedBy", "name email");

    const total = await userLog.countDocuments(query);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      logs,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch logs",
    });
  }
};
