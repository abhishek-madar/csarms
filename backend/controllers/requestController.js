const User = require('../models/User');
const { sendEscalationEmail } = require('../utils/emailService');

// Helper to get all emails of a specific role
const getEmailsByRole = async (role) => {
  const users = await User.find({ role }).select('email');
  return users.map(u => u.email).join(', ');
};

const requestAccess = async (req, res) => {
  const { 
    requesterEmail, 
    requestedRole, 
    name, 
    usnOrEmpId, 
    reason,
    collegeName,    // For HOD
    subjectName,    // For Faculty
    className,      // For Student
    year,           // For Student
    contactEmail    // For Student
  } = req.body;

  try {
    let targetEmails = 'abhishekbadagi06@gmail.com';
    let subjectLine = '';
    let extraFieldsHtml = '';

    switch (requestedRole) {
      case 'Student':
        subjectLine = 'Student Access Request';
        extraFieldsHtml = `
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Class:</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${className}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Year:</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${year}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Contact Email:</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${contactEmail}</td></tr>
        `;
        break;
      case 'Faculty':
        subjectLine = 'Teacher/Faculty Access Request';
        extraFieldsHtml = `
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Subject:</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${subjectName}</td></tr>
        `;
        break;
      case 'HOD':
        subjectLine = 'HOD Registration Request';
        extraFieldsHtml = `
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>College Name:</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${collegeName}</td></tr>
        `;
        break;
      case 'Admin':
        subjectLine = 'System Admin Access Request';
        break;
      default:
        return res.status(400).json({ message: 'Invalid role requested.' });
    }

    const htmlContent = `
      <div style="font-family: serif; color: #2d3748; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #10b981;">Access Request: ${requestedRole}</h2>
        <p>A new user is requesting access to the CSARMS platform.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Name:</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${name}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${requesterEmail}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Requested Role:</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${requestedRole}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>ID (USN/EMP):</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${usnOrEmpId || 'N/A'}</td></tr>
          ${extraFieldsHtml}
        </table>
        <p style="margin-top: 20px;"><strong>Message/Reason:</strong></p>
        <blockquote style="border-left: 4px solid #10b981; padding-left: 10px; color: #718096; font-style: italic;">
          ${reason || 'No additional notes.'}
        </blockquote>
        <p style="margin-top: 30px;">Please login to the CSARMS dashboard (as Admin/HOD/Faculty) to add this user if authorized.</p>
      </div>
    `;

    await sendEscalationEmail({
      to: targetEmails,
      subject: subjectLine,
      htmlContent
    });

    const successMessage = requestedRole === 'HOD' 
      ? 'You will be added within 24 Hours, thank you.' 
      : 'Access request submitted successfully. You will be notified once approved.';

    res.status(200).json({ message: successMessage });
  } catch (error) {
    console.error('Escalation error:', error);
    res.status(500).json({ message: 'Failed to submit request.' });
  }
};

module.exports = { requestAccess };
