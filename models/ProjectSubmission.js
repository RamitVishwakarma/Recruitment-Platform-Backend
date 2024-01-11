// Schema for project submission
const mongoose = require('mongoose');

const projectSubmissionSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',             // User model
      required: true,
    },
    submissionLink: {
      type: String,
      required: true,
    },

  }, { timestamps: true });


  const ProjectSubmissionModel = mongoose.model('ProjectSubmission', projectSubmissionSchema);
  module.exports = ProjectSubmissionModel;