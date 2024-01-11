// Schema for project submission
const mongoose = require('mongoose');

const projectSubmissionSchema = new mongoose.Schema({
    // Define the properties for project submission as needed
    // For example:
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming there is a User model, adjust as needed
      required: true,
    },
    submissionText: {
      type: String,
      required: true,
    },
    // Add more properties as needed
  }, { timestamps: true });


  const ProjectSubmissionModel = mongoose.model('ProjectSubmission', projectSubmissionSchema);
  module.exports = ProjectSubmissionModel;