import Settings from "../models/settingsModel.js";

// =========================
// 📥 GET SETTINGS
// =========================
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // If no settings exist, create default
    if (!settings) {
      settings = await Settings.create({
        supportEmail: "support@example.com",
      });
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// ✏️ UPDATE SETTINGS
// =========================
export const updateSettings = async (req, res) => {
  try {
    const updates = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(updates);
    } else {
      Object.assign(settings, updates);
      await settings.save();
    }

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
