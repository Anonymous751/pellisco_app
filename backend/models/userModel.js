  import mongoose from "mongoose";
  import validator from "validator";
  import bcryptjs from "bcryptjs";
  import jwt from "jsonwebtoken";
  import crypto from "crypto";

  const userSchema = new mongoose.Schema(
  {
    // User full name: Displayed in profile, orders and account information
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name should contain at least 3 characters"],
      maxlength: [25, "Name cannot exceed 25 characters"],
      trim: true,
      index: true // ADDED: Optimization for searching customers in Admin Panel
    },

    // User email address: Used for authentication and communication
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please enter a valid email"]
    },

    // User password: Stored as hashed value; hidden from queries by default
  googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple users to have 'null' (those who didn't use Google)
    },
    password: {
      type: String,
      required: function() {
        // Only require a password if googleId doesn't exist
        return !this.googleId;
      },
      minlength: [8, "Password must be at least 8 characters"],
      select: false
    },
    // Optional phone number: Used for shipping or verification
    phone: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple users without phone numbers while keeping existing ones unique
      index: true,
      validate: {
        validator: function (v) {
          // IMPROVED: Only validates if a value is actually provided
          return !v || /^[0-9]{10}$/.test(v);
        },
        message: "Please enter a valid 10 digit phone number"
      }
    },

    // --- 2FA SECURITY FIELDS ---
      twoFactorSecret: {
        type: String,
        select: false, // Security: Never send to frontend by default
        index: true    // Optimization: Fast lookup during verification
      },
      twoFactorEnabled: {
        type: Boolean,
        default: false,
        index: true    // Optimization: Check during login flow
      },
      twoFactorBackupCodes: {
        type: [String],
        select: false  // Security: Keep backup codes hidden
      },

    // --- ADDED: CUSTOMER TIERING (Pellisco Ritualists) ---
  tier: {
      type: String,
      enum: ["Brown", "Silver", "Gold", "Platinum"],
      default: "Brown"
    },

    // Add these to your userSchema

    city: {
      type: String,
      default: "Not Specified",
      trim: true
    },
    numOfOrders: {
      type: Number,
      default: 0
    },

    points: {
      type: Number,
      default: 0,
      index: true
    },
    totalSpent: {
      type: Number,
      default: 0
    },

    // Email verification flag
    isVerified: {
      type: Boolean,
      default: false,
      index: true
    },

    isSubscribed: {
  type: Boolean,
  default: false,
  index: true
},

    // Token sent to email for account verification
    emailOTPVerificationToken: {
      type: String,
      select: false // Security: Hidden from standard API responses
    },

    // Expiry time for email verification token
    emailOTPVerificationExpire: {
      type: Date,
      select: false
    },

    // Number of OTP verification attempts
    otpAttempts: {
      type: Number,
      default: 0
    },

    // User avatar information (Cloudinary)
    avatar: {
      public_id: {
        type: String,
        default: ""
      },
      url: {
        type: String,
        default: ""
      }
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },

    // Role-based access control
    role: {
      type: String,
    enum: ["user", "admin", "verified"],
      default: "user",
      index: true
    },

    // Account moderation status
    accountStatus: {
      type: String,
      enum: ["active", "blocked", "suspended"],
      default: "active",
      index: true
    },

    // --- ADDED: REGIONAL PREFERENCE ---
    preferredCurrency: {
      type: String,
      default: "INR",
      uppercase: true
    },

    // Stores the last successful login timestamp
    lastLogin: {
      type: Date,
      default: null
    },

    // Password reset token
    resetPasswordToken: {
      type: String,
      select: false
    },

    // Expiration time for password reset token
    resetPasswordExpire: {
      type: Date,
      select: false
    },

    // Number of consecutive failed login attempts
    loginAttempts: {
      type: Number,
      default: 0,
      required: true
    },

    // Time until which account is locked
    lockUntil: {
      type: Date
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt
  }
  );

  // --- MIDDLEWARE ---

  // Hash password before saving
  userSchema.pre("save", async function () {
    if (!this.isModified("password")) return ;

    const spent = this.totalSpent || 0;

    if (spent >= 100000) {
      this.tier = "Platinum";
    } else if (spent >= 50000) {
      this.tier = "Gold";
    } else if (spent >= 10000) {
      this.tier = "Silver";
    } else {
      this.tier = "Brown";
    }
    this.password = await bcryptjs.hash(this.password, 10);

  });

  // --- METHODS ---

  // Compare password for login
  userSchema.methods.comparePassword  = async function (enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password);
  };

  // Generate JWT token
  userSchema.methods.getJWTToken = function () {
    return jwt.sign(
      { id: this._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_EXPIRE
      }
    );
  };

  // Generate Reset Password Token
  userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and save in DB
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expiry (15 minutes)
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
  };

  // Virtual Helper: Check if account is locked
  userSchema.methods.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
  };

  export default mongoose.model("User", userSchema);
