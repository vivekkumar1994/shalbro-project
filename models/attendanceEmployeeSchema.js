const { default: mongoose } = require("mongoose");



const AttendanceSchema = new mongoose.Schema({
    ATTENDANCE_ID: { type: Number, required: true,unique:true },
    ATTENDANCE_ADMIN_ID: { type: Number, required: true },
    ATTENDANCE_ADMIN_USERNAME: { type: String, required: true },
    ATTENDANCE_COMPANY_ID: { type: Number, required: true },
    ATTENDANCE_COMPANY_USERNAME: { type: String, required: true },
    ATTENDANCE_EMPLOYEE_ID: { type: Number, required: true },
    ATTENDANCE_EMPLOYEE_USERNAME: { type: String, required: true },
    ATTENDANCE_DATE_ID: { type: String, required: true },
    ATTENDANCE_IN: { type: String, default: "" },
    ATTENDANCE_OUT: { type: String, default: "" },
  });

  const attendance= mongoose.model('attendance', AttendanceSchema );

  module.exports = attendance