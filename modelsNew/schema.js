const { default: mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const counterSchema = {
  id: {
    type: String
  },
  seq: {
    type: Number
  }
};

const RootUserSchema = Schema({
    ROOT_ID:{type:Number,required:true,unique:true},
    ROOT_USERNAME: { type: String, default: '', unique:true },
    ROOT_PASSWORD:{type:String,default:''},
    CREATE_COMPANY_LIST:{type:Array,default:[]}
});
const CompanySchema = new Schema({
    COMPANY_ID: { type: Number, required: true ,unique:true},
    COMPANY_ROOT_ID: { type: Number, required: true },
    COMPANY_ROOT_USERNAME: { type: String, required: true },
    COMPANY_ROLE: { type: String, default: '' },
    COMPANY_NAME: { type: String, required: true },
    COMPANY_PHONE: { type: Number, required: false, default: '' },
    COMPANY_EMAIL: { type: String, default: '' },
    COMPANY_ADD2: { type: String, default: '' },
    COMPANY_USERNAME: { type: String, required:true, unique:true },
    COMPANY_PASSWORD:{type:String,default:""},
    COMPANY_STATE: { type: String, default: '' },
    COMPANY_COUNTRY: { type: String, default: '' },
    COMPANY_CITY: { type: String, default: '' },
    COMPANY_UID :{type:String},
    COMPANY_EMPLOYIES: { type: Array, default: [] },
    COMPANY_SUBCONTRACTOR: { type: Array, default: [] },
    COMPANY_SUBSCRIPTION:{ type: String, default: '' },
    COMPANY_STATUS: { type: String, default: '' },
    
    COMPANY_ARCHIEVE:{
      type:String,
      enum : [true,false],
      default: false
    }
    // COMPANY_DOCS: { type: Array, default: [] },
  
  });

  // const CompanyNewSchema = new Schema({
  //   COMPANY_ID: { type: Number, required: true, unique:true },
  //   COMPANY_ROOT_ID: { type: Number, required: true },
  //   COMPANY_ROOT_USERNAME: { type: String, required: true,unique:true },
  //   COMPANY_USERNAME: { type: String, required:true, unique:true },
  //   COMPANY__PASSWORD:{type: String, default: ""},
  //   COMPANY_ROLE: { type: String, default: '' },
  //   COMPANY_NAME: { type: String, default: '' },
  //   COMPANY_PHONE: { type: Number, required: false, default: 0 },
  //   COMPANY_EMAIL: { type: String, default: '' },
  //   COMPANY_ADD2: { type: String, default: '' },
  //   COMPANY_STATE: { type: String, default: '' },
  //   uuid:{type:String},
  //   COMPANY_EMPLOYIES: { type: Array, default: [] },
  //   createdAt: {
  //     type: Date,
  //     default: Date.now,
  //   },
  //   updatedAt: {
  //     type: Date,
  //     default: Date.now,
  //   },

  //   ROOT_USER:{type:String,default:[]}
  //   // COMPANY_DOCS: { type: Array, default: [] },
  // });
   
  const EmployeeSchema = new Schema({
    EMPLOYEE_ID: { type: Number, required: true, unique:true },
    EMPLOYEE_COMPANY_ID: { type: Number, required: true },
    EMPLOYEE_COMPANY_USERNAME: { type: String, required: true },
    EMPLOYEE_ROOT_ID: { type: Number, required: true },
    EMPLOYEE_ROOT_USERNAME: { type: String, required: true },
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
    EMPLOYEE_ATTENDANCE_STATUS: {
      type: Object, default: {
        date: new Date(),
        IN: false,
        OUT: false,
        PROJECT_ID:0,
        ActualWorkingMoney:0,
        OvertimeMoney:0,
        TotalMoneyGain:0
      }
    },
    EmployeeBankDetail:{
      type: Object, default: {
      date: new Date(),
      AccountNo:"",
      Name:"",
      BankAchStatus:"",
      BankName:"",
      BankVerify:"",
      }
  
    },
    EMPLOYEE_ASSIGN: { type: Array, default: [] },
  });
  
  const AttendanceSchema = new Schema({
    ATTENDANCE_ID: { type: Number, required: true,unique:true },
    ATTENDANCE_ROOT_ID: { type: Number, required: true },
    ATTENDANCE_ROOT_USERNAME: { type: String, required: true },
    ATTENDANCE_COMPANY_ID: { type: Number, required: true },
    ATTENDANCE_COMPANY_USERNAME: { type: String, required: true },
    ATTENDANCE_EMPLOYEE_ID: { type: Number, required: true },
    ATTENDANCE_EMPLOYEE_USERNAME: { type: String, required: true },
    ATTENDANCE_DATE_ID: { type: String, required: true },
    ATTENDANCE_IN: { type: String, default: "" },
    ATTENDANCE_OUT: { type: String, default: "" },
    ATTENDANCE_PROJECT_ID:{ type: Number, default: 0},
    ATTENDANCE_OVERTIME:{type:Object,default:0},
    ATTENDANCE_WORKING_PER_HOURS:{type:Number,default:0},
   ATTENDANCE_OVERTIME_WORKING_PER_HOURS:{type:Number,default:0},
  });
  
  const ProjectSchema = new Schema({
    PROJECT_ID: { type: Number, required: true, unique:true },
    PROJECT_COMPANY_ID: { type: Number, required: true },
    PROJECT_COMPANY_USERNAME: { type: String, required: true },
    PROJECT_ROOT_ID: { type: Number, required: true },
    PROJECT_ROOT_USERNAME: { type: String, required: true },
    PROJECT_ROLE: { type: String, default: '' },
    PROJECT_NAME: { type: String, required: true },
    PROJECT_ACCOUNT: { type: Number, required: true},
    PROJECT_USERNAME: { type: String, required: true  },
    PROJECT_START_DATE: { type: String, default: '' },
    PROJECT_END_DATE: { type: String, default: '' },
    PROJECT_SUPERVISOR: { type: String, default: '' },
    PROJECT_ADD: { type: String, default: '' },
    PROJECT_TYPE: { type: String, default: '' },
    PROJECT_VALUE: { type: Number, required: false, default: '' },
    PROJECT_CURRENCY: { type: String, default: '' },
    PROJECT_CITY: { type: String, default: '' },
    PROJECT_COUNTRY: { type: String, default: '' },
    PROJECT_STATE: { type: String, default: '' },
    PROJECT_PROGRESS: { type: String, default: 90 },
    PROJECT_DOCUMENTS: { type: Array, default: [] },
    PROJECT_ASSIGN: { type: Array, default: [] },
    LONGITUDE:{ type: String, default: 0 },
    LATITUDE:{ type: String, default: 0 },
    AREA:{ type: String, default: 0 },
    LOCATION_NAME:{ type: String, default: 0 }
  })
  
  
  const SubContractorSchema = new Schema({
    SUBCONTRACTOR_ID: { type: Number, required: true, unique:true },
    SUBCONTRACTOR_COMPANY_ID: { type: Number, required: true },
    SUBCONTRACTOR_COMPANY_USERNAME: { type: String, required: true },
    SUBCONTRACTOR_ROOT_ID: { type: Number, required: true },
    SUBCONTRACTOR_ROOT_USERNAME: { type: String, required: true },
    SUBCONTRACTOR_ROLE: { type: String, default: '' },
    SUBCONTRACTOR_NAME: { type: String, default: '' },
    SUBCONTRACTOR_PHONE: { type: Number, required: false, default: '' },
    SUBCONTRACTOR_USERNAME: { type: String, default: '', unique:true },
    SUBCONTRACTOR_START_DATE: { type: String, required: true },
    SUBCONTRACTOR_END_DATE: { type: String, default: '' },
    SUBCONTRACTOR_SUPERVISOR: { type: String, default: '' },
    SUBCONTRACTOR_ADD: { type: String, default: '' },
    SUBCONTRACTOR_EMROLMNT_TYPE: { type: String, default: '' },
    SUBCONTRACTOR_CITY: { type: String, default: '' },
    SUBCONTRACTOR_COUNTRY: { type: String, default: '' },
    SUBCONTRACTOR_STATE: { type: String, default: '' },
    SUBCONTRACTOR_PROGRESS: { type: String, default: 90 },
    COMPANY_SUBCONTRACTOR_EMPLOYEE:{type:Array,default:[]}
    // SUBCONTRACTOR_DOCUMENTS: { type: Array, default: [] },
    // SUBCONTRACTOR_ASSIGN: { type: Array, default: [] },
  
  })
  const SUBCONTRACTOR_EMPLOYIES = new Schema({
    SUBCONTRACTOR_EMPLOYEE_ID: { type: Number, required: true, unique:true },
    SUBCONTRACTOR_EMPLOYEE_COMPANY_ID: { type: Number, required: true },
    SUBCONTRACTOR_EMPLOYEE_COMPANY_USERNAME: { type: String, required: true },
    SUBCONTRACTOR_EMPLOYEE_ROOT_ID: { type: Number, required: true },
    SUBCONTRACTOR_EMPLOYEE_ROOT_USERNAME: { type: String, required: true },
    SUBCONTRACTOR_EMPLOYEE_ROLE: { type: String, default: '' },
    SUBCONTRACTOR_EMPLOYEE_NAME: { type: String, default: '' },
    SUBCONTRACTOR_EMPLOYEE_PHONE: { type: Number, required: false, default: '' },
    SUBCONTRACTOR_EMPLOYEE_EMAIL: { type: String, default: '' },
    SUBCONTRACTOR_EMPLOYEE_USERNAME: { type: String, default: '', unique:true },
    SUBCONTRACTOR_EMPLOYEE_DOB: { type: String, default: '' },
   SUBCONTRACTOR_EMPLOYEE_EMPLMNTTYPE: { type: String, default: '' },
    SUBCONTRACTOR_EMPLOYEE_HIRE_DATE: { type: String, default: '' },
    SUBCONTRACTOR_EMPLOYEE_HOURLY_WAGE: { type: String, default: '' },
    SUBCONTRACTOR_EMPLOYEE_ADD: { type: String, default: '' },
    SUBCONTRACTOR_EMPLOYEE_COUNTRY: { type: String, default: '' },
    SUBCONTRACTOR_EMPLOYEE_STATE: { type: String, default: '' },
    SUBCONTRACTOR_EMPLOYEE_CITY: { type: String, default: '' },
    SUBCONTRACTOR_EMPLOYEE_PASSWORD: { type: String, default: '' },
    EMPLOYEE_ATTENDANCE_STATUS: {
      type: Object, default: {
        date: new Date(),
        IN: false,
        OUT: false,
        PROJECT_ID:0,
        ActualWorkingMoney:0,
        OvertimeMoney:0,
        TotalMoneyGain:0
      }
    },
    EmployeeBankDetail:{
      type: Object, default: {
      date: new Date(),
      AccountNo:"",
      Name:"",
      BankAchStatus:"",
      BankName:"",
      BankVerify:"",
      }
  
    },
    EMPLOYEE_ASSIGN: { type: Array, default: [] },
     
  })

  const SubContractorAttendance = new Schema({
    
      ATTENDANCE_ID: { type: Number, required: true,unique:true },
      ATTENDANCE_ROOT_ID: { type: Number, required: true },
      ATTENDANCE_ROOT_USERNAME: { type: String, required: true },
      ATTENDANCE_COMPANY_ID: { type: Number, required: true },
      ATTENDANCE_COMPANY_USERNAME: { type: String, required: true },
      ATTENDANCE_EMPLOYEE_ID: { type: Number, required: true },
      ATTENDANCE_EMPLOYEE_USERNAME: { type: String, required: true },
      ATTENDANCE_DATE: { type: String, required: true },
      ATTENDANCE_IN: { type: String, default: "" },
      ATTENDANCE_OUT: { type: String, default: "" },
      ATTENDANCE_PROJECT_ID:{ type: Number, default: 0},
      ATTENDANCE_OVERTIME:{type:Object,default:0},
      ATTENDANCE_WORKING_PER_HOURS:{type:Number,default:0},
     ATTENDANCE_OVERTIME_WORKING_PER_HOURS:{type:Number,default:0},
  })
  
  const DocumentSchema = new Schema({
    DOCUMENT_ID: { type: Number, unique: true, unique:true },
    DOCUMENT_REF_ID: { type: Number, required: true },
    DOCUMENT_ROOT_USERNAME: { type: String, required: true },
    DOCUMENT_FILEDATA: { type: Object },
    DOCUMENT_CREATE_DATE: { type: Date, default:new Date()},
    DOCUMENT_EXP_DATE: { type: Object, default:''},
  }, { timestamps: { createdAt: 'created', updatedAt: 'updated' } });
  
  const EmailTaskAutomation = new Schema({
    // Purpose:{type:String,default:""},
    Details: { type: Object }
  })
  
  
  const ProjectFileSchema = new Schema({
    PROJECT_FILE_ID: { type: Number, required: true, unique:true},
    PROJECT_FILE_COMPANY_ID: { type: Number, required: true },
    PROJECT_FILE_COMPANY_USERNAME: { type: String, required: true },
    PROJECT_FILE_ROOT_ID: { type: Number, required: true },
    PROJECT_FILE_ROOT_USERNAME: { type: String, required: true },
    PROJECT_FILE_ROLE: { type: String, default: '' },
    PROJECT_FILE_NAME: { type: String, default: '' },
    PROJECT_FILE_PHONE: { type: Number, required: false, default: '' },
    PROJECT_FILE_EMAIL: { type: String, default: '' },
    PROJECT_FILE_USERNAME: { type: String, default: '', unique:true },
    PROJECT_FILE_DOB: { type: String, default: '' },
    PROJECT_FILE_EMPLMNTTYPE: { type: String, default: '' },
    PROJECT_FILE_HIRE_DATE: { type: String, default: '' },
    PROJECT_FILE_HOURLY_WAGE: { type: String, default: '' },
    PROJECT_FILE_ADD: { type: String, default: '' },
    PROJECT_FILE_STATE: { type: String, default: '' },
    PROJECT_FILE_CITY: { type: String, default: '' },
    PROJECT_FILE_ATTENDANCE: { type: Array, default: [] },
  });
  
  const BankSchema = new Schema({
    BANK_ID: { type: Number, required: true,unique:true },
    BANK_ROOT_ID: { type: Number, required: true },
    BANK_ROOT_USERNAME: { type: String, required: true },
    BANK_COMPANY_ID: { type: Number, required: true },
    BANK_COMPANY_USERNAME: { type: String, required: true },
    BANK_EMPLOYEE_ID: { type: Number, required: true },
    BANK_EMPLOYEE_USERNAME: { type: String, required:true },
    BANK_EMPLOYEE_NIKENAME:{type:String,default:""},
    BANK_ACCOUNT_NUMBER:{type:Number,required:true},
    BANK_ACH_STATUS:{type:String,default:""},
    BANK_DATE:{type:String, required: true },
    BANK_NAME:{type:String,default:""},
    BANK_VERIFY:{type:String,default:""},
    BANK_CHEQUE_NUMBER:{type:String,default:""},
  
  })


  
  
  module.exports = mongoSchemaModel = {
  
    RootModel: (parm) => mongoose.model(`ROOT_USER`, RootUserSchema),//usermodel
    CompanyModel: (parm) => mongoose.model(`company_${parm}`, CompanySchema),//memberModel
    EmployeeModel: (parm) => mongoose.model(`employee_${parm}`, EmployeeSchema),//clientModel
    ProjectModel: (parm) => mongoose.model(`project_${parm}`, ProjectSchema),
    SubContractorModel: (parm) => mongoose.model(`subcontractor_${parm}`, SubContractorSchema),
    SubContractorEmployeeModel:(parm)=> mongoose.model(`SubcontractorEmployee_${parm}`,SUBCONTRACTOR_EMPLOYIES),
    SubContractorAttendanceModel:(parm)=> mongoose.model(`subcontractor_attendance_${parm}`,SubContractorAttendance),
    AttendanceModel: (parm) => mongoose.model(`attendance_${parm}`, AttendanceSchema),
    DocumentModel: (parm) => mongoose.model(`document_${parm}`, DocumentSchema),
    // ClientModel : (parm)=>mongoose.model(`contract_${parm}`,EmployeeSchema),
    countermodel: mongoose.model("counter", counterSchema),
    CompanySchema: CompanySchema,
    EmailTaskAutomation: mongoose.model(`EmailTaskAutomation`, EmailTaskAutomation),
    CompanyNewModel: (parm) => mongoose.model(`company_${parm}`, CompanyNewSchema),//memberModel
    BankModel:(parm)=> mongoose.model(`Bank_${parm}`,BankSchema) // bankMoel
  
  
  }
  



