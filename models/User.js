const mongoose = require("mongoose");
var validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      minlength: [3, "Name must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Please provide a email"],
      unique: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Invalid email address",
      },
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: false,
      validate: {
        validator: (value) => value.toString().length <= 10,
        message: "Phone number must be at most 10 digits",
      },
    },
    photo: {
      type: String,
      required: false,
      default: "https://i.postimg.cc/c15MbgrZ/pngwing-com.png",
    },
    domain: {
      type: String,
      required: false,
      enum: [
        "Programming",
        "Web Club",
        "Android Club",
        "Flutter Dev",
        "Design Club",
        "ML Club",
      ],
    },
    year: {
      type: String,
      required: false,
      enum: ["1", "2"],
    },
    admissionNumber: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // Add sparse: true here
    },
    resume: {
      type: String,
      required: false,
      default:
        "https://i.postimg.cc/pTq7XH1y/d35ee5d3eec5fef6c7d0c899ef224365.jpg", // default demo resume
    },
    socialLinks: {
      github: {
        type: String,
        required: false,
      },
      linkedin: {
        type: String,
        required: false,
      },
      behance: {
        type: String,
        required: false,
      },
      hackerrank: {
        type: String,
        required: false,
      },
      leetcode: {
        type: String,
        required: false,
      },
      dribble: {
        type: String,
        required: false,
      },
      portfolio: {
        type: String,
        required: false,
      },
    },
    reviewStatus: {
      type: Boolean,
      required: false,
      default: false,
    },
    ShortList: {
      type: Boolean,
      required: false,
      default: false,
    },
    interviewStatus: {
      type: Boolean,
      required: false, // cleared (true)
      default: false,
    },
    projectStatus: {
      type: Boolean,
      required: false,
      default: false,
    },
    quizzesTaken: [
      {
        quizId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Quiz",
        },
        totalScore: {
          type: Number,
          default: 0,
        },
      },
    ],
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Middleware to automatically clear resetPasswordToken and resetPasswordExpires after 15 minutes
userSchema.statics.clearResetTokenAfterTimeout = function (token, callback) {
  const time = 15 * 60 * 1000; // 15 minutes in milliseconds
  const clearToken = () => {
    this.findOneAndUpdate(
      { resetPasswordToken: token },
      { $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 } },
      { new: true },
      callback
    );
  };

  // Set timeout to clear the token after 15 minutes
  setTimeout(clearToken, time);
};

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
