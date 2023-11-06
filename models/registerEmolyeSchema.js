const { default: mongoose } = require("mongoose");





const EmployeeSchema = new  mongoose.Schema({
    EMPLOYEE_ID: { type: Number, required: true, unique:true },
    EMPLOYEE_PARENT_ID: { type: Number, required: true },
    EMPLOYEE_PARENT_USERNAME: { type: String, required: true },
    EMPLOYEE_MEMBER_PARENT_ID: { type: Number, required: true },
    EMPLOYEE_MEMBER_PARENT_USERNAME: { type: String, required: true },
    EMPLOYEE_ROLE: { type: String, default: '' },
    EMPLOYEE_NAME: { type: String, default: '' },
    EMPLOYEE_PHONE: { type: Number, required: false, default: '' },
    EMPLOYEE_EMAIL: { type: String, default: '' },
    EMPLOYEE_USERNAME: { type: String, default: '', unique:true },
    EMPLOYEE_DOB: { type: String, default: '' },
    EMPLOYEE_EMPLMNTTYPE: { type: String, default: '' },
    EMPLOYEE_HIRE_DATE: { type: String, default: '' },
    EMPLOYEE_HOURLY_WAGE: { type: String, default: '' },
    EMPLOYEE_ADD: { type: String, default: '' },
    EMPLOYEE_COUNTRY: { type: String, default: '' },
    EMPLOYEE_STATE: { type: String, default: '' },
    EMPLOYEE_CITY: { type: String, default: '' },
    EMPLOYEE_PASSWORD: { type: String, default: '' },
    attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'attendance' }],
    EMPLOYEE_ATTENDANCE_STATUS: {
      type: Object, default: {
        date: new Date(),
        IN: false,
        OUT: false
      }
    },
    EMPLOYEE_ASSIGN: { type: Array, default: [] },
  });

  const employeeSchema = mongoose.model('employee', EmployeeSchema);

  module.exports = employeeSchema