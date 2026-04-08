import handleAsyncError from "../middlewares/handleAsyncError.js";
import { Partnership } from "../models/partnerShipModel.js";
import User from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import HandleError from "../utils/handleError.js";

/**
 * 1. SUBMIT APPLICATION
 * Logic: Increments user attempt count and creates a pending inquiry.
 */
export const handlePartnershipInquiry = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new HandleError("User not found", 404));

  // Guard: Check if blocked or limit reached
  if (user.isPartnershipBlocked || user.partnershipRequestCount >= 5) {
    return next(new HandleError("Maximum application limit reached.", 403));
  }

  // 1. Update User attempts immediately
  user.partnershipRequestCount = (user.partnershipRequestCount || 0) + 1;
  await user.save();

  // 2. Create Inquiry
  const inquiry = await Partnership.create({
    user: user._id,
    ...req.body,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    message: "Application submitted successfully.",
    attemptsLeft: Math.max(0, 5 - user.partnershipRequestCount),
    currentAttempt: user.partnershipRequestCount
  });
});

/**
 * 2. GET STATUS (For User Dashboard)
 */
export const getMyInquiryStatus = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const inquiry = await Partnership.findOne({ user: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    status: inquiry ? inquiry.status : "none",
    requestCount: user.partnershipRequestCount || 0,
    isBlocked: user.isPartnershipBlocked,
    role: user.role
  });
});

/**
 * 3. UPDATE STATUS & SEND EMAIL (Admin Only)
 * Logic: Updates status, modifies User role if verified, and triggers emails.
 */
export const updateInquiryStatus = handleAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const updatedStatus = status?.toLowerCase();

  // 1. Find Inquiry and User
  const inquiry = await Partnership.findById(id).populate("user");
  if (!inquiry) return next(new HandleError("Inquiry record not found", 404));

  const user = inquiry.user;
  if (!user) return next(new HandleError("Linked User not found", 404));

  // 2. Safety Check: Ensure count is a number to avoid NaN
  const currentCount = Number(user.partnershipRequestCount) || 0;
  const totalAllowed = 5;

  // 3. Update Inquiry Status
  inquiry.status = updatedStatus;
  await inquiry.save();

  // 4. Handle Logic & Email Preparation
  let emailSubject = "";
  let emailMessage = "";

  if (updatedStatus === "verified") {
    user.role = "verified";
    user.partnershipRequestCount = 0; // Reset on success
    user.isPartnershipBlocked = false;
    await user.save();

    emailSubject = "Pellisco Pro | Partnership Approved";
    emailMessage = `Hello ${inquiry.salonName || "Partner"},\n\nYour clinical partnership has been verified. You now have full access to the Pellisco Pro catalog.`;
  }

  else if (updatedStatus === "rejected") {
    // If they hit 5, officially block them
    if (currentCount >= totalAllowed) {
      user.isPartnershipBlocked = true;
    }
    await user.save();

    // 🛑 FIXING THE NaN HERE:
    const remaining = Math.max(0, totalAllowed - currentCount);

    emailSubject = "Pellisco Pro | Application Update";
    emailMessage = `Hello ${inquiry.salonName || "Partner"},\n\nThank you for your interest. Unfortunately, your application has been declined at this time. You have ${remaining} attempts remaining.`;
  }

  // 5. Send Email
  if (emailSubject) {
    try {
      await sendEmail({
        email: inquiry.email, // Ensure your Partnership model has an email field
        subject: emailSubject,
        message: emailMessage,
      });
    } catch (err) {
      console.error("Email failed to send:", err.message);
    }
  }

  res.status(200).json({
    success: true,
    message: `Application has been ${updatedStatus}`,
    inquiry,
  });
});

/**
 * 4. GET ALL (Admin Only)
 */
export const getAllInquiries = handleAsyncError(async (req, res, next) => {
  const inquiries = await Partnership.find()
    .populate("user", "name role partnershipRequestCount isPartnershipBlocked")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: inquiries.length,
    inquiries
  });
});
