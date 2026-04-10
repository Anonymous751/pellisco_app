import Subscriber from "../models/subscriberModel.js";
import User from "../models/userModel.js";

// ✅ SUBSCRIBE
export const subscribeUser = async (req, res) => {
  try {
    let { email } = req.body;

    if (req.user?.email) {
      email = req.user.email;
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    email = email.toLowerCase().trim();

    let subscriber = await Subscriber.findOne({ email });

    if (subscriber) {
      if (subscriber.isActive) {
        return res.json({ success: true, message: "Already subscribed" });
      }

      subscriber.isActive = true;
      subscriber.unsubscribedAt = null;

      if (req.user) {
        subscriber.user = req.user._id;
        subscriber.source = "user";

        await User.findByIdAndUpdate(req.user._id, {
          isSubscribed: true,
        });
      }

      await subscriber.save();

      return res.json({
        success: true,
        message: "Resubscribed successfully",
      });
    }

    const user = await User.findOne({ email });

    await Subscriber.create({
      email,
      user: req.user?._id || user?._id || null,
      source: req.user || user ? "user" : "guest",
    });

    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        isSubscribed: true,
      });
    }

    res.status(201).json({
      success: true,
      message: "Subscribed successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};


// ❌ UNSUBSCRIBE
export const unsubscribeUser = async (req, res) => {
  try {
    let { email } = req.body;

    if (req.user?.email) {
      email = req.user.email;
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    email = email.toLowerCase().trim();

    const subscriber = await Subscriber.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found" });
    }

    if (!subscriber.isActive) {
      return res.json({ message: "Already unsubscribed" });
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = Date.now();

    await subscriber.save();

    await User.findOneAndUpdate(
      { email },
      { isSubscribed: false }
    );

    res.json({
      success: true,
      message: "Unsubscribed successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};


// 👑 ADMIN: GET ALL
export const getAllSubscribers = async (req, res) => {
  const subscribers = await Subscriber.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    count: subscribers.length,
    subscribers,
  });
};


// 🗑 ADMIN: DELETE
export const deleteSubscriber = async (req, res) => {
  await Subscriber.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Subscriber deleted",
  });
};
