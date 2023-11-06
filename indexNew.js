const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment");
const middlewareFunctions = require("./middlewareNew/middlewareFunction");
const multer = require("multer");
const app = express();
const axios = require("axios");
const session = require('express-session');
const admin = require('firebase-admin');
const fs = require("fs");
const jwt = require("jsonwebtoken")
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: "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",
});
const connectDb = require("./db/mongo_connection");
const firebaseConfig = require("./firebase.json")
connectDb();
const openai = new OpenAIApi(configuration);

const upload = multer({ dest: "uploads/" });
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    useNewUrlParser: true,
    parameterLimit: 50000,
    limit: "50mb",
  })
);

// Firebase Admin SDK service account key
admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
 
});

const mongoose = require("./db/mongo_connection");

const mongoSchemaModel = require("./modelsNew/schema");

const msgObject = require("./responseMsg.json");
// const employeeSchema = require("./models/registerEmolyeSchema");
// const attendance = require("./models/attendanceEmployeeSchema");
const Schema = mongoose.Schema;

app.post(
  "/createRootUser",
  middlewareFunctions.checkAuth,
  middlewareFunctions.verifying,
  (req, res) => {
    try {
      const Users = mongoSchemaModel.RootModel(req.body.ROOT_USERNAME);
      const user = Users.findOne({ ROOT_USERNAME: req.body.ROOT_USERNAME });
      // console.log("my name", user)
      result = req.body.ROOT_USERNAME === user.ROOT_USERNAME;

      if (!result) {
        // console.log(req.body)
        mongoSchemaModel.countermodel.findOneAndUpdate(
          { id: "autoval" },
          { $inc: { seq: 1 } },
          { new: true },
          (err, cd) => {
            // console.log("counter value : ", cd);

            let seqId;
            if (cd == null) {
              const newval = new mongoSchemaModel.countermodel({
                id: "autoval",
                seq: 1,
              });
              newval.save();
              seqId = 1;
            } else {
              seqId = cd.seq;
            }
            req.body.ROOT_ID = cd.seq;
            let RootModel = mongoSchemaModel.RootModel(
              req.body.ROOT_USERNAME
            );
            RootModel.insertMany(req.body, (err, response) => {
              if (err)
                res.json({
                  operation: msgObject.failed,
                  result: null,
                  errorMsg: err,
                });
              else
                res.json({
                  operation: msgObject.success,
                  result: response,
                  errorMsg: null,
                });
            });
          }
        );
      } else {
        res.status(400).json({
          error: "User Already exist",
        });
        console.log("exist");
      }
    } catch (error) {
      res.json({
        operation: msgObject.failed,
        result: null,
        errorMsg: error,
      });
    }
  }
);

//login admin routes

app.post("/login", async function (req, res) {
  try {
    // check if the user exists
    const Users = mongoSchemaModel.RootModel();
    const user = await Users.findOne({
      ROOT_USERNAME: req.body.ROOT_USERNAME,
    });
   
    if (user) {
        
      //check if password matches
      const passwordMatch= req.body.ROOT_PASSWORD === user.ROOT_PASSWORD;
    
      if (passwordMatch) {
        // Generate a JWT token
        

        res.json({
            operation: "successful",
            user: user,
        });
    
 
      } else {
        res.status(400).json({
          error: "Authentication failed",
        });
      }
    } else {
      res.status(400).json({
        error: "User doesn't exist",
      });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});


// //employee login

// app.post("/company_login", async (req, res) => {
//   try {
//     // First, authenticate the user with Firebase Authentication
//     const authUser = await admin.auth().getUserByEmail(
//       req.body.COMPANY_EMAIL,
    
//     );
//     console.log(authUser);

//     if (authUser) {
//       // If authentication with Firebase is successful, proceed to check MongoDB
//       const Users = mongoSchemaModel.CompanyModel(req.body.COMPANY_ROOT_USERNAME);

//       const user = await Users.findOne({
//         COMPANY_EMAIL: req.body.COMPANY_EMAIL,
//       });

//       if (user) {
//         // If a matching user is found in MongoDB, send a successful response
//         res.json({
//           operation: "success",
//           result: user,
//         });
//       } else {
//         res.status(400).json({
//           error: "User doesn't exist in your database",
//         });
//       }
//     } else {
//       res.status(400).json({
//         error: "Authentication failed",
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       operation: "failed",
//       result: null,
//       errorMsg: error,
//     });
//   }
// });
app.post('/company_login', async (req, res) => {
  try {
    const { COMPANY_EMAIL, COMPANY_PASSWORD } = req.body;

    // Check if the user exists in Firebase Authentication based on their email
    const userRecord = await admin.auth().getUserByEmail(COMPANY_EMAIL);
    console.log(userRecord);

    if (!userRecord) {
      return res.status(400).json({ error: 'User with the given email does not exist' });
    }

    // Implement password verification (you need to implement your own password checking logic here)
    // This example assumes you have a "password" field in your user document.
    const companys= mongoSchemaModel.CompanyModel(req.body.body);
    const company = await companys.findOne({
              COMPANY_EMAIL: req.body.COMPANY_EMAIL,
            });
      

    if (!company) {
      return res.status(400).json({ error: 'User not found in the database' });
    }

    if (company.PASSWORD !== COMPANY_PASSWORD) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.json({ operation: 'success', user: company });
  } catch (error) {
    console.error(error);
    res.status(500).json({ operation: 'failed', errorMsg: error.message });
  }
});




// Login API
// app.post('/company_login', async (req, res) => {
//   try {
//     // First, authenticate the user with Firebase Authentication
//     const user = await admin.auth().getUserByEmail(req.body.COMPANY_EMAIL);

//     if (!user) {
//       res.status(400).json({ error: 'Authentication failed. User not found.' });
//       return;
//     }

//     // Check user's credentials in MongoDB
//     const existingUser = await mongoSchemaModel.CompanyModel.findOne({ COMPANY_EMAIL: req.body.COMPANY_EMAIL });

//     if (!existingUser || existingUser.COMPANY_PASSWORD !== req.body.COMPANY_PASSWORD) {
//       res.status(400).json({ error: 'Authentication failed. Invalid credentials.' });
//       return;
//     }

//     res.json({ message: 'Authentication successful', user: existingUser });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Authentication failed', errorMsg: error.message });
//   }
// });





// //create company under admin

// app.post(
//   "/create_company",
//   middlewareFunctions.checkAuth,
  
//   (req, res) => {
//     try {
      
//       const Users = mongoSchemaModel.CompanyModel(
//         req.body.COMPANY_ROOT_USERNAME

//       );
//       const user = Users.findOne({
//         COMPANY_USERNAME: req.body.COMPANY_USERNAME,
//       });
//       result = req.body.COMPANY_USERNAME === user.COMPANY_USERNAME;

//       // console.log("body : ", req.body)
//       if (!result) {
//         mongoSchemaModel.countermodel.findOneAndUpdate(
//           { id: "autoval" },
//           { $inc: { seq: 1 } },
//           { new: true },
//           (err, cd) => {
//             // console.log("counter value : ", cd);

//             let seqId;
//             if (cd == null) {
//               const newval = new mongoSchemaModel.countermodel({
//                 id: "autoval",
//                 seq: 1,
//               });
//               newval.save();
//               seqId = 1;
//             } else {
//               seqId = cd.seq;
//             }
//             req.body.COMPANY_ID = cd.seq;

//             let CompanyModel = mongoSchemaModel.CompanyModel(
//               req.body.COMPANY_ROOT_USERNAME
//             );

//             CompanyModel.insertMany(req.body, (err, resp) => {
//               if (err)
//                 res.json({
//                   operation: msgObject.failed,
//                   result: null,
//                   errorMsg: err,
//                 });
//               else {
//                 let RootModel = mongoSchemaModel.RootModel(
//                   req.body.COMPANY_ROOT_USERNAME
//                 );

//                 RootModel.findOneAndUpdate(
//                   { ROOT_ID: resp[0].COMPANY_ROOT_ID },
//                   {
//                     $push: {
//                         CREATE_COMPANY_LIST:{
//                         COMPANY_ID: resp[0].COMPANY_ID,
//                         COMPANY_USERNAME: resp[0].COMPANY_USERNAME,
//                       },
//                     },
//                   },
//                   (error, re) => {
//                     if (error)
//                       res.json({
//                         operation: msgObject.failed,
//                         result: null,
//                         errorMsg: error,
//                       });
//                     else
//                       res.json({
//                         operation: msgObject.success,
//                         result: resp,
//                         errorMsg: null,
//                       });
//                   }
//                 );
//               }
//             });
//           }
//         );
//       } else {
//         res.status(400).json({
//           error: "User Already exist",
//         });
//         console.log("exist");
//       }
//     } catch (error) {
//       res.json({
//         operation: msgObject.failed,
//         result: null,
//         errorMsg: error,
//       });
//     }
//   }
// );

// app.post("/create_company", middlewareFunctions.checkAuth, async (req, res) => {
//   try {
//     // Create a Mongoose model for the company using the request body
//     const CompanyModel = mongoSchemaModel.CompanyModel(req.body.COMPANY_ROOT_USERNAME);

//     // Check if the company with the same username exists in the database
//     const existingCompany = await CompanyModel.findOne({ COMPANY_USERNAME: req.body.COMPANY_USERNAME });

//     if (existingCompany) {
//       res.status(400).json({ error: 'Company with the same username already exists' });
//     } else {
//       // Increment the sequence and set COMPANY_ID
//       const cd = await mongoSchemaModel.countermodel.findOneAndUpdate(
//         { id: "autoval" },
//         { $inc: { seq: 1 } },
//         { new: true }
//       );

//       let seqId;
//       if (!cd) {
//         const newval = new mongoSchemaModel.countermodel({
//           id: "autoval",
//           seq: 1,
//         });
//         await newval.save();
//         seqId = 1;
//       } else {
//         seqId = cd.seq;
//       }

//       req.body.COMPANY_ID = seqId;

//       // Create a new user with Firebase Authentication
//       admin.auth().createUser({
//         email: req.body.COMPANY_EMAIL,
//         password: req.body.COMPANY_PASSWORD,
//         displayName: req.body.COMPANY_USERNAME,
//       })
//       .then((newUser) => {
//         console.log("new user data:", newUser);
//         // Store the UID in your MongoDB document
//         req.body.COMPANY_UID = newUser.uid;

//         // Create a new company and save it to the database
//         const createdCompany = new CompanyModel(req.body);
//         createdCompany.save()
//           .then(savedCompany => {
//             console.log(savedCompany);
//             // Create the root user association
            
//             const RootModel = new mongoSchemaModel.RootModel(req.body.COMPANY_ROOT_USERNAME);
//             RootModel.findOneAndUpdate(
//               { ROOT_ID: req.body.COMPANY_ROOT_ID },
//               {
//                 $push: {
//                   CREATE_COMPANY_LIST: {
//                     COMPANY_ID: savedCompany.COMPANY_ID,
//                     COMPANY_USERNAME: savedCompany.COMPANY_USERNAME
//                   },
//                 }
//               },
//               { new: true }
//             )
//             .then(rootResult => {
//               res.json({
//                 operation: 'success',
//                 result: savedCompany,
//                 errorMsg: null,
//                 error:"no data found"
//               });
//             })
//             .catch(rootErr => {
//               res.status(500).json({
//                 operation: 'failed',
//                 result: null,
//                 errorMsg: rootErr,
//               });
//             });
//           })
//           .catch(companyErr => {
//             res.status(500).json({
//               operation: 'failed',
//               result: null,
//               errorMsg: companyErr,
             
//             });
//           });
//       })
//       .catch(authErr => {
//         res.status(500).json({
//           operation: 'failed',
//           result: null,
//           errorMsg: authErr,
//           err:"no data found"
//         });
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       operation: 'failed',
//       result: null,
//       errorMsg: error,
//       err:"no data found"
//     });
//   }
// });
app.post("/create_company", async (req, res) => {
  try {
    // Create a Mongoose model for the company using the request body
    const CompanyModel = mongoSchemaModel.CompanyModel(req.body.COMPANY_ROOT_USERNAME);

    // Check if the company with the same username exists in the database
    const existingCompany = await CompanyModel.findOne({ COMPANY_USERNAME: req.body.COMPANY_USERNAME });

    if (existingCompany) {
      return res.status(400).json({ error: 'Company with the same username already exists' });
    }

    // Increment the sequence and set COMPANY_ID
    const cd = await mongoSchemaModel.countermodel.findOneAndUpdate(
      { id: "autoval" },
      { $inc: { seq: 1 } },
      { new: true }
    );

    let seqId;
    if (!cd) {
      const newval = new mongoSchemaModel.countermodel({
        id: "autoval",
        seq: 1,
      });
      await newval.save();
      seqId = 1;
    } else {
      seqId = cd.seq;
    }

    req.body.COMPANY_ID = seqId;

    // Create a new user with Firebase Authentication
    const newUser = await admin.auth().createUser({
      email: req.body.COMPANY_EMAIL,
      password: req.body.COMPANY_PASSWORD,
      displayName: req.body.COMPANY_USERNAME,
    });
    console.log("new user data:", newUser);

    // Store the UID in your MongoDB document
    req.body.COMPANY_UID = newUser.uid;

    // Create a new company and save it to the database
    const createdCompany = await CompanyModel.create(req.body);

   let RootModel = mongoSchemaModel.RootModel(
                  req.body.COMPANY_ROOT_USERNAME
                );
    const rootResult = await RootModel.findOneAndUpdate(
      { ROOT_ID: req.body.COMPANY_ROOT_ID },
      {
        $push: {
          CREATE_COMPANY_LIST: {
            COMPANY_ID: createdCompany.COMPANY_ID,
            COMPANY_USERNAME: createdCompany.COMPANY_USERNAME
          },
        }
      },
      { new: true }
    );

    res.json({
      operation: 'success',
      result: createdCompany,
      errorMsg: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      operation: 'failed',
      result: null,
      errorMsg: error,
    });
  }
});


// app.post("/create_company", middlewareFunctions.checkAuth, async (req, res) => {
//   try {
//     const Users = mongoSchemaModel.CompanyModel(req.body.COMPANY_ROOT_USERNAME);
//     const user = await Users.findOne({ COMPANY_USERNAME: req.body.COMPANY_USERNAME });

//     if (user) {
//       res.status(400).json({ error: 'User Already exists' });
//     } else {
//       // Use Firebase Authentication to create a new user
//       const newUser = await admin.auth().createUser({
//         email: req.body.COMPANY_EMAIL,
//         password: req.body.COMPANY_PASSWORD,
//         displayName: req.body.COMPANY_USERNAME,
//       });

//       // Continue with your company creation and root user association
//       const Users = mongoSchemaModel.CompanyModel(req.body.COMPANY_ROOT_USERNAME);
//       const result = await Users.create(req.body);

//       // Add your root user association logic
//       const RootModel = mongoSchemaModel.RootModel(req.body.COMPANY_ROOT_USERNAME);
//       const rootResult = await RootModel.updateOne(
//         { ROOT_ID: req.body.COMPANY_ROOT_ID },
//         {
//           $push: {
//             CREATE_COMPANY_LIST: {
//               COMPANY_ID: result.COMPANY_ID,
//               COMPANY_USERNAME: result.COMPANY_USERNAME,
//             },
//           },
//         }
//       );

//       res.json({
//         operation: 'success',
//         result: result,
//         errorMsg: null,
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       operation: 'failed',
//       result: null,
//       errorMsg: error,
//     });
//   }
// });






app.get("/get_all_companies_new", (req, res) => {
  try {
    // Query all companies in the MongoDB collection
    mongoSchemaModel.CompanyModel.find({}, (err, companies) => {
      console.log(companies);
      if (err) {
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.status(200).json({ companies });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


 // update all company

app.put("/update_company", middlewareFunctions.checkAuth, (req, res) => {
  try {
    const Users = mongoSchemaModel.CompanyModel(
      req.body.COMPANY_ROOT_USERNAME
    );
    const user = Users.findOne({ COMPANY_USERNAME: req.body.COMPANY_ROOT_USERNAME });
    result = req.body.COMPANY_USERNAME ===  user.COMPANY_USERNAME;
  
    

    // console.log("body : ", req.body)
    if (!result) {
      let {
        COMPANY_ID,
        COMPANY_USERNAME,
        COMPANY_ROOT_USERNAME,
        COMPANY_DETAILS_FOR_UPDATE,
      } = req.body;
      let CompanyModel = mongoSchemaModel.CompanyModel(COMPANY_ROOT_USERNAME);

      CompanyModel.findOneAndUpdate(
        { COMPANY_ID, COMPANY_USERNAME },
        { ...COMPANY_DETAILS_FOR_UPDATE },
        { COMPANY_EMPLOYIES: 0 },
        (err, resp) => {
          console.log("resp : ", resp);
          if (err)
            res.json({
              operation: msgObject.failed,
              result: null,
              errorMsg: err,
            });
          else if (resp !== null) {
            res.json({
              operation: msgObject.success,
              result: resp,
              errorMsg: null,
            });
          } else {
            res.json({
              operation: msgObject.failed,
              result: null,
              errorMsg: "Company Not Exist",
            });
          }
        }
      );
    } else {
      res.status(400).json({
        error: "User Already exist",
      });
      console.log("exist");
    }
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: null,
      errorMsg: error,
    });
  }
});
// app.put("/update_company", middlewareFunctions.checkAuth, async (req, res) => {
//   try {
//     const {
//       COMPANY_ID,
//       COMPANY_USERNAME,
//       COMPANY_ROOT_USERNAME,
//       COMPANY_DETAILS_FOR_UPDATE,
//     } = req.body;

//     // Check if the company exists
//     const CompanyModel = mongoSchemaModel.CompanyModel(COMPANY_ROOT_USERNAME);
//     const existingCompany = await CompanyModel.findOne({
//       COMPANY_ID,
//       COMPANY_USERNAME,
//     });

//     if (!existingCompany) {
//       return res.status(400).json({
//         operation: msgObject.failed,
//         result: null,
//         errorMsg: "Company Not Exist",
//       });
//     }

//     // Update the company details
//     CompanyModel.findOneAndUpdate(
//       { COMPANY_ID, COMPANY_USERNAME },
//       { $set: COMPANY_DETAILS_FOR_UPDATE }, // Use $set to update fields
//       { fields: { COMPANY_EMPLOYEES: 0 }, new: true }, // Corrected the typo
//       (err, updatedCompany) => {
//         if (err) {
//           res.status(500).json({
//             operation: msgObject.failed,
//             result: null,
//             errorMsg: err,
//           });
//         } else if (updatedCompany !== null) {
//           res.status(200).json({
//             operation: msgObject.success,
//             result: updatedCompany,
//             errorMsg: null,
//           });
//         } else {
//           res.status(400).json({
//             operation: msgObject.failed,
//             result: null,
//             errorMsg: "Company Not Exist",
//           });
//         }
//       }
//     );
//   } catch (error) {
//     res.status(500).json({
//       operation: msgObject.failed,
//       result: null,
//       errorMsg: error,
//     });
//   }
// });


// app.put("/update_company", middlewareFunctions.checkAuth, async (req, res) => {
//   try {
//     const { COMPANY_ID, COMPANY_USERNAME, COMPANY_ROOT_USERNAME, COMPANY_DETAILS_FOR_UPDATE } = req.body;
     
//     // Check if the company exists
//     const CompanyModel = mongoSchemaModel.CompanyModel(COMPANY_ROOT_USERNAME);
//     const existingCompany = await CompanyModel.findOne({ COMPANY_ID, COMPANY_USERNAME });

//     if (!existingCompany) {
//       return res.status(400).json({
//         operation: msgObject.failed,
//         result: null,
//         errorMsg: "Company Not Exist",
//       });
//     }

//     // Update the company details
//     CompanyModel.findOneAndUpdate(
//       { COMPANY_ID, COMPANY_USERNAME },
//       { ...COMPANY_DETAILS_FOR_UPDATE },
//       { COMPANY_EMPLOYEES: 0 }, // It seems there was a typo here; it should be "COMPANY_EMPLOYEES"
//       { new: true },
//       (err, updatedCompany) => {
//         if (err) {
//           res.status(500).json({
//             operation: msgObject.failed,
//             result: null,
//             errorMsg: err,
//           });
//         } else if (updatedCompany !== null) {
//           res.status(200).json({
//             operation: msgObject.success,
//             result: updatedCompany,
//             errorMsg: null,
//           });
//         } else {
//           res.status(400).json({
//             operation: msgObject.failed,
//             result: null,
//             errorMsg: "Company Not Exist",
//           });
//         }
//       }
//     );
//   } catch (error) {
//     res.status(500).json({
//       operation: msgObject.failed,
//       result: null,
//       errorMsg: error,
//     });
//   }
// });


//create employee under company

app.post('/create_employee', middlewareFunctions.checkAuth, middlewareFunctions.vaildateClient, (req, res) => {
    try {
        if (!res.headersSent) res.set('Content-Type', 'application/json');
        // console.log("body : ", req.body)
        mongoSchemaModel.countermodel.findOneAndUpdate(
            { id: "autoval" },
            { "$inc": { "seq": 1 } },
            { new: true }, (err, cd) => {
                let seqId;
                if (cd == null) {
                    let newval = new mongoSchemaModel.countermodel({ id: "autoval", seq: 1 })
                    newval.save();
                    seqId = 1;
                } else {
                    seqId = cd.seq
                }
                req.body.EMPLOYEE_ID = cd.seq

                let EmployeeModels = mongoSchemaModel.EmployeeModel(req.body.EMPLOYEE_ROOT_USERNAME)
            

                EmployeeModels.insertMany(req.body, (err, resp) => {
                    console.log(resp);
                    if (err) res.json({
                        operation: msgObject.failed,
                        result: null,
                        errorMsg: err
                    })
                    
                    else {
                        let CompanyModels = mongoSchemaModel.CompanyModel(req.body.EMPLOYEE_ROOT_USERNAME)
          

                        CompanyModels.findOneAndUpdate({ COMPANY_ID: resp[0].EMPLOYEE_COMPANY_ID }, {
                        
                            $push: {
                                COMPANY_EMPLOYIES: {
                                    EMPLOYEE_ID: resp[0].EMPLOYEE_ID,
                                    EMPLOYEE_USERNAME: resp[0].EMPLOYEE_USERNAME,
                                },
                            }
                            
                        }, 
                        
                        (errorMember, resMember) => {
                            if (errorMember) res.json({
                                operation: msgObject.failed,
                                result: null,
                                errorMsg: errorMember
                            })
                            else {

                                // if(!res.headersSent) res.set('Content-Type', 'application/json');
                                res.json({
                                    operation: msgObject.success,
                                    result: resp,
                                    errorMsg: null
                                })
                            }
                        })
                    }
                })

            })
    } catch (error) {
        // console.log("error : ", error)
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error
        })
    }
})


// // create project under company

app.post(
  "/create_project",
  middlewareFunctions.checkAuth,
  middlewareFunctions.vaildateProject,
  (req, res) => {
    try {
      const Users = mongoSchemaModel.ProjectModel(
        req.body.PROJECT_ROOT_USERNAME
      );
      const user = Users.findOne({
        PROJECT_ROOT_USERNAME: req.body.PROJECT_ROOT_USERNAME,
      });
      result =
        req.body.PROJECT_ROOT_USERNAME ===
        user.PROJECT_ROOT_USERNAME;

      if (!result) {
        if (!res.headersSent) res.set("Content-Type", "application/json");

        mongoSchemaModel.countermodel.findOneAndUpdate(
          { id: "autoval" },
          { $inc: { seq: 1 } },
          { new: true },
          (err, cd) => {
            let seqId;
            if (cd == null) {
              let newval = new mongoSchemaModel.countermodel({
                id: "autoval",
                seq: 1,
              });
              newval.save();
              seqId = 1;
            } else {
              seqId = cd.seq;
            }
            req.body.PROJECT_ID = cd.seq;

            let ProjectModel = mongoSchemaModel.ProjectModel(
              req.body.PROJECT_ROOT_USERNAME
            );

            ProjectModel.insertMany(req.body, (err, resp) => {
              if (err)
                res.json({
                  operation: msgObject.failed,
                  result: null,
                  errorMsg: err,
                });
              else {
                let CompanyModel = mongoSchemaModel.CompanyModel(
                  req.body.PROJECT_COMPANY_USERNAME
                );

                CompanyModel.findOneAndUpdate(
                  { COMPANY_ID: resp[0].PROJECT_COMPANY_ID },
                  {
                    $push: {
                      COMPANY_PROJECTS: {
                        PROJECT_ID: resp[0].PROJECT_COMPANY_ID,
                        PROJECT_USERNAME: resp[0].PROJECT_COMPANY_USERNAME,
                      },
                    },
                  },
                  (errorMember, resMember) => {
                    if (errorMember)
                      res.json({
                        operation: msgObject.failed,
                        result: null,
                        errorMsg: errorMember,
                      });
                    else {
                      res.json({
                        operation: msgObject.success,
                        result: resp,
                        errorMsg: null,
                      });
                    }
                  }
                );
              }
            });
          }
        );
      } else {
        res.status(400).json({
          error: "User Already exist",
        });
        console.log("exist");
      }
    } catch (error) {
      // console.log("error : ", error)
      res.json({
        operation: msgObject.failed,
        result: null,
        errorMsg: error,
      });
    }
  }
);

// // create subordianate under company

// app.post(
//   "/create_subcontractor",
//   middlewareFunctions.checkAuth,middlewareFunctions.vaildateSubContractor,
//   (req, res) => {
//     try {
//       const Users = mongoSchemaModel.SubContractorModel(
//         req.body.SUBCONTRACTOR_ROOT_USERNAME
//       );
//       const user = Users.findOne({
//         SUBCONTRACTOR_ROOT_USERNAME:
//           req.body.SUBCONTRACTOR_ROOT_USERNAME,
//       });
//       result =
//         req.body.SUBCONTRACTOR_ROOT_USERNAME ===
//         user.SUBCONTRACTOR_ROOT_USERNAME;

//       if (!result) {
//         if (!res.headersSent) res.set("Content-Type", "application/json");

//         mongoSchemaModel.countermodel.findOneAndUpdate(
//           { id: "autoval" },
//           { $inc: { seq: 1 } },
//           { new: true },
//           (err, cd) => {
//             let seqId;
//             if (cd == null) {
//               let newval = new mongoSchemaModel.countermodel({
//                 id: "autoval",
//                 seq: 1,
//               });
//               newval.save();
//               seqId = 1;
//             } else {
//               seqId = cd.seq;
//             }
//             req.body.SUBCONTRACTOR_ID = cd.seq;

//             let SubContractorModel = mongoSchemaModel.SubContractorModel(
//               req.body.SUBCONTRACTOR_ROOT_USERNAME
//             );

//             SubContractorModel.insertMany(req.body, (err, resp) => {
//               console.log("resp",resp);
//               if (err)
//                 res.json({
//                   operation: msgObject.failed,
//                   result: null,
//                   errorMsg: err,
//                 });
//               else {
//                 let CompanyModel = mongoSchemaModel.CompanyModel(
//                   req.body.SUBCONTRACTOR_COMPANY_USERNAME
//                 );
//                 console.log("res baby :",resp)
//                 CompanyModel.findOneAndUpdate(
//                   { COMPANY_ID: resp[0].SUBCONTRACTOR_COMPANY_ID },
//                   {
                 
//                     $push: {
//                       COMPANY_SUBCONTRACTOR: {
//                         SUBCONTRACTOR_ID: resp[0].SUBCONTRACTOR_COMPANY_ID,
//                         SUBCONTRACTOR_USERNAME:
//                           resp[0].SUBCONTRACTOR_COMPANY_USERNAME,
//                       },
//                     },
//                   },
//                   (errorMember, resMember) => {
//                     console.log("resdataerror or reaponse:",errorMember,resMember);
                    
                   
//                     if (errorMember)
//                       res.json({
//                         operation: msgObject.failed,
//                         result: null,
//                         errorMsg: errorMember,
//                       });
//                     else {
//                       res.json({
//                         operation: msgObject.success,
//                         result: resp,
//                         errorMsg: null,
//                       });
//                     }
//                   }
//                 );
//               }
//             });
//           }
//         );
//       } else {
//         res.status(400).json({
//           error: "User Already exist",
//         });
//         console.log("exist");
//       }
//     } catch (error) {
//       // console.log("error : ", error)
//       res.json({
//         operation: msgObject.failed,
//         result: null,
//         errorMsg: error,
//       });
//     }
//   }
// );

app.post('/create_subcontractor', middlewareFunctions.vaildateSubContractor, (req, res) => {
  try {
      if (!res.headersSent) res.set('Content-Type', 'application/json');
      // console.log("body : ", req.body)
      mongoSchemaModel.countermodel.findOneAndUpdate(
          { id: "autoval" },
          { "$inc": { "seq": 1 } },
          { new: true }, (err, cd) => {
              let seqId;
              if (cd == null) {
                  let newval = new mongoSchemaModel.countermodel({ id: "autoval", seq: 1 })
                  newval.save();
                  seqId = 1;
              } else {
                  seqId = cd.seq
              }
              req.body.SUBCONTRACTOR_ID = cd.seq

              let SubcontractorModels = mongoSchemaModel.SubContractorModel(req.body.SUBCONTRACTOR_MEMBER_PARENT_USERNAME)
          

              SubcontractorModels.insertMany(req.body, (err, resp) => {
                  console.log(resp);
                  if (err) res.json({
                      operation: msgObject.failed,
                      result: null,
                      errorMsg: err
                  })
              
                  
                  else {
                      let CompanyModels = mongoSchemaModel.CompanyModel(req.body.SUBCONTRACTOR_PARENT_MEMBER_USERNAME)
        

                      CompanyModels.findOneAndUpdate({ COMPANY_ID: resp[0].SUBCONTRACTOR_MEMBER_ID }, {
                      
                          $push: {
                            COMPANY_SUBCONTRACTOR: {
                                  SUBCONTRACTOR_ID: resp[0].SUBCONTRACTOR_ID,
                                  SUBCONTRACTOR_USERNAME: resp[0].SUBCONTRACTOR_USERNAME,
                              },
                          }
                          
                      }, 
                      
                      (errorMember, resMember) => {
                          if (errorMember) res.json({
                              operation: msgObject.failed,
                              result: null,
                              errorMsg: errorMember
                          })
                          else {

                              // if(!res.headersSent) res.set('Content-Type', 'application/json');
                              res.json({
                                  operation: msgObject.success,
                                  result: resp,
                                  errorMsg: null
                              })
                          }
                      })
                  }
              })

          })
  } catch (error) {
      // console.log("error : ", error)
      res.json({
          operation: msgObject.failed,
          result: null,
          errorMsg: error
      })
  }
})
// app.post('/create_subcontractor',middlewareFunctions.vaildateSubContractor, (req, res) => {
//   try {
//       const Users = mongoSchemaModel.SubContractorModel(req.body.SUBCONTRACTOR_MEMBER_PARENT_USERNAME);
//       const user = Users.findOne({ SUBCONTRACTOR_MEMBER_PARENT_USERNAME: req.body.SUBCONTRACTOR_MEMBER_PARENT_USERNAME });
//       result = req.body.SUBCONTRACTOR_MEMBER_PARENT_USERNAME === user.SUBCONTRACTOR_MEMBER_PARENT_USERNAME;

//       if (!result) {

//           if (!res.headersSent) res.set('Content-Type', 'application/json');

//           mongoSchemaModel.countermodel.findOneAndUpdate(
//               { id: "autoval" },
//               { "$inc": { "seq": 1 } },
//               { new: true }, (err, cd) => {

//                   let seqId;
//                   if (cd == null) {
//                       let newval = new mongoSchemaModel.countermodel({ id: "autoval", seq: 1 })
//                       newval.save();
//                       seqId = 1;
//                   } else {
//                       seqId = cd.seq
//                   }
//                   req.body.SUBCONTRACTOR_ID = cd.seq

//                   let SubContractorModel = mongoSchemaModel.SubContractorModel
//                       (req.body.SUBCONTRACTOR_MEMBER_PARENT_USERNAME)

//                   SubContractorModel.insertMany(req.body, (err, resp) => {
//                       if (err) res.json({
//                           operation: msgObject.failed,
//                           result: null,
//                           errorMsg: err
//                       })
//                       else {
//                           let CompanyModel = mongoSchemaModel.CompanyModel(req.body.SUBCONTRACTOR_PARENT_USERNAME)

//                           CompanyModel.findOneAndUpdate({ COMPANY_ID: resp[0].SUBCONTRACTOR_PARENT_ID }, {
//                               $push: {
//                                   COMPANY_SUBCONTRACTOR: {
//                                       SUBCONTRACTOR_ID: resp[0].SUBCONTRACTOR_PARENT_ID,
//                                       SUBCONTRACTOR_USERNAME: resp[0].SUBCONTRACTOR_PARENT_USERNAME,
//                                   },
//                               }
//                           }, (errorMember, resMember) => {
//                               if (errorMember) res.json({
//                                   operation: msgObject.failed,
//                                   result: null,
//                                   errorMsg: errorMember
//                               })
//                               else {
//                                   res.json({
//                                       operation: msgObject.success,
//                                       result: resp,
//                                       errorMsg: null
//                                   })
//                               }
//                           })
//                       }
//                   })


//               })
//       } else {
//           res.status(400).json({
//               error: "User Already exist"
//           })
//           console.log("exist")
//       }

//   } catch (error) {
//       // console.log("error : ", error)
//       res.json({
//           operation: msgObject.failed,
//           result: null,
//           errorMsg: error
//       })
//   }
// })

app.post('/create_subcontractor_employee', middlewareFunctions.checkAuth,middlewareFunctions.vaildateEmployeeSubContractor,(req, res) => {
  try {
      if (!res.headersSent) res.set('Content-Type', 'application/json');
      // console.log("body : ", req.body)
      mongoSchemaModel.countermodel.findOneAndUpdate(
          { id: "autoval" },
          { "$inc": { "seq": 1 } },
          { new: true }, (err, cd) => {
              let seqId;
              if (cd == null) {
                  let newval = new mongoSchemaModel.countermodel({ id: "autoval", seq: 1 })
                  newval.save();
                  seqId = 1;
              } else {
                  seqId = cd.seq
              }
              req.body.SUBCONTRACTOR_EMPLOYEE_ID = cd.seq

              let SubcontractorModels = mongoSchemaModel.SubContractorEmployeeModel(req.body.SUBCONTRACTOR_EMPLOYEE_ROOT_USERNAME)
          

              SubcontractorModels.insertMany(req.body, (err, resp) => {
                  console.log(resp);
                  if (err) res.json({
                      operation: msgObject.failed,
                      result: null,
                      errorMsg: err
                  })
                  
                  else {
                      let subcontractorModels = mongoSchemaModel.SubContractorModel(req.body.SUBCONTRACTOR_EMPLOYEE_ROOT_USERNAME)
        

                      subcontractorModels.findOneAndUpdate({ SUBCONTRACTOR_COMPANY_ID: resp[0].SUBCONTRACTOR_EMPLOYEE_COMPANY_ID }, {
                      
                          $push: {
                            COMPANY_SUBCONTRACTOR_EMPLOYEE: {
                                  SUBCONTRACTOR_EMPLOYEE_ID: resp[0].SUBCONTRACTOR_EMPLOYEE_ID,
                                  SUBCONTRACTOR_EMPLOYEE_USERNAME: resp[0].SUBCONTRACTOR_EMPLOYEE_USERNAME,
                              },
                          }
                          
                      }, 
                      
                      (errorMember, resMember) => {
                          if (errorMember) res.json({
                              operation: msgObject.failed,
                              result: null,
                              errorMsg: errorMember
                          })
                          else {

                              // if(!res.headersSent) res.set('Content-Type', 'application/json');
                              res.json({
                                  operation: msgObject.success,
                                  result: resp,
                                  errorMsg: null
                              })
                          }
                      })
                  }
              })

          })
  } catch (error) {
      // console.log("error : ", error)
      res.json({
          operation: msgObject.failed,
          result: null,
          errorMsg: error
      })
  }
})


app.post("/create_sub_emp_attendance", middlewareFunctions.checkAuth, (req, res) => {
  try {
    console.log("body: ", req.body);

    let temp_body = { ...req.body };
    console.log("tempdata", temp_body);

    let AttendanceModel = mongoSchemaModel.SubContractorAttendanceModel(
      req.body.ATTENDANCE_ROOT_USERNAME
    );

    AttendanceModel.findOne(
      {
        ATTENDANCE_DATE: temp_body.ATTENDANCE_DATE,
        ATTENDANCE_EMPLOYEE_ID: temp_body.ATTENDANCE_EMPLOYEE_ID,
        ATTENDANCE_PROJECT_ID: temp_body.ATTENDANCE_PROJECT_ID,
      },
      (errAt, attendanceRecord) => {
        console.log(attendanceRecord);
        if (errAt) {
          res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: errAt,
          });
        } else {
          if (!attendanceRecord) {
            // Handle the case when there's no existing attendance record
            mongoSchemaModel.countermodel.findOneAndUpdate(
              { id: "autoval" },
              { $inc: { seq: 1 } },
              { new: true },
              (err, cd) => {
                console.log("counter value: ", cd);

                let seqId;
                if (cd == null) {
                  const newval = new mongoSchemaModel.countermodel({
                    id: "autoval",
                    seq: 1,
                  });
                  newval.save();
                  seqId = 1;
                } else {
                  seqId = cd.seq;
                }
                req.body.ATTENDANCE_ID = seqId;

                // Insert a new attendance record with "in" punch
                req.body.ATTENDANCE_IN = req.body.ATTENDANCE_IN;
                req.body.ATTENDANCE_OUT = ""; // Clear out "out" punch

                // Calculate total workhours
             
                const overtime= calculateSubOvertime(req.body);

                // Insert overtime into the request body
                req.body.ATTENDANCE_OVERTIME = overtime
                

                AttendanceModel.insertMany(req.body, (err, resp) => {
                  if (err)
                    res.json({
                      operation: msgObject.failed,
                      result: null,
                      errorMsg: err,
                    });
                  else {
                    updateSubEmployeeAttendanceStatus(req, res, "IN", req.body, overtime);
                  }
                });
              }
            );
          } else {
            if (attendanceRecord.ATTENDANCE_IN && !attendanceRecord.ATTENDANCE_OUT) {
              // Update the existing attendance record for the "out" punch
              AttendanceModel.findOneAndUpdate(
                { ATTENDANCE_ID: attendanceRecord.ATTENDANCE_ID },
                {
                  $set: {
                    ATTENDANCE_OUT: req.body.ATTENDANCE_OUT,
                    // Calculate overtime
                    ATTENDANCE_OVERTIME: calculateOvertime(req.body),
                  },
                },
                { new: true },
                (error, updatedAttendanceRecord) => {
                  if (error) {
                    res.json({
                      operation: msgObject.failed,
                      result: null,
                      errorMsg: error,
                    });
                  } else {
                    // Update overtime and employee attendance status
                    updateSubEmployeeAttendanceStatus(
                      req,
                      res,
                      "OUT",
                      updatedAttendanceRecord,
                      updatedAttendanceRecord.ATTENDANCE_OVERTIME,
                    
                      
                    );
                  }
                }
              );
            } else {
              res.json({
                operation: msgObject.failed,
                result: null,
                errorMsg: "Employee is not punched in for this project.",
              });
            }
          }
        }
      }
    );
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: null,
      errorMsg: error,
    });
  }
})

function calculateSubOvertime(attendanceRecord) {
  if (!attendanceRecord.ATTENDANCE_IN || !attendanceRecord.ATTENDANCE_OUT) {
    // No overtime if either in or out time is missing
    return 0;
  } else {
    // Calculate overtime in hours
    const inTime = moment(attendanceRecord.ATTENDANCE_IN, "HH:mm");
    const outTime = moment(attendanceRecord.ATTENDANCE_OUT, "HH:mm");
    const regularWorkingHours = 8; // Assuming 8 hours as regular working hours

    // Calculate the duration in hours
    const duration = moment.duration(outTime.diff(inTime));
    const workedHours = duration.asHours();

    // Calculate overtime
    const overtime = Math.max(0, workedHours - regularWorkingHours);

    return {overtime,workedHours}
    
  }
}
function updateSubEmployeeAttendanceStatus(req, res, punchType, attendanceRecord,overtime ){

  console.log(overtime);
  


  const ActualWorkingMoney = Number(attendanceRecord.ATTENDANCE_WORKING_PER_HOURS) * Number(overtime.workedHours);
  const OvertimeMoney = Number(attendanceRecord.ATTENDANCE_OVERTIME_WORKING_PER_HOURS) * Number(overtime.overtime);
 const totalwork = ActualWorkingMoney + OvertimeMoney
  // Update the employee's attendance status with total working hours and overtime
  let EmployeeModel = mongoSchemaModel.SubContractorEmployeeModel(
    req.body.ATTENDANCE_ROOT_USERNAME
  );

  EmployeeModel.findOneAndUpdate(
    {
      SUBCONTRACTOR_EMPLOYEE_ID: req.body.ATTENDANCE_EMPLOYEE_ID,
      SUBCONTRACTOR_EMPLOYEE_USERNAME: req.body.ATTENDANCE_EMPLOYEE_USERNAME,
    },
    {
      $set: {
        EMPLOYEE_ATTENDANCE_STATUS: {
          date: attendanceRecord.ATTENDANCE_DATE,
          [punchType]: true,
          PROJECT_ID: req.body.ATTENDANCE_PROJECT_ID,
          TOTAL_WORKING_HOURS:overtime.workedHours,
          OVERTIME: overtime.overtime,
          ActualWorkingMoney:ActualWorkingMoney,
         OvertimeMoney:OvertimeMoney,
         TotalMoneyGain:totalwork
          


        },
      },
    },
    { new: true },
    (emp_err, emp_x) => {
      console.log("emp_x: ", emp_x);
      if (emp_err) {
        res.json({
          operation: msgObject.failed,
          result: null,
          errorMsg: emp_err,
        });
      } else {
        res.json({
          operation: msgObject.success,
          result: attendanceRecord,
          errorMsg: null,
        });
      }
    }
  );
}


app.put("/subemp", middlewareFunctions.checkAuth, (req, res) => {
  try {
    let RootModel = mongoSchemaModel.RootModel(
      req.body.SUBCONTRACTOR_EMPLOYEE_ROOT_USERNAME
    );

    RootModel.find(
      {
        ROOT_USERNAME: req.body.SUBCONTRACTOR_EMPLOYEE_ROOT_USERNAME,
        ROOT_ID: req.body.SUBCONTRACTOR_EMPLOYEE_ROOT_ID,
      },
      (err, x) => {
        console.log("employee data : ", x);
        if (x.length === 1) {
          const EmployeeModel = mongoSchemaModel.SubContractorEmployeeModel(
            req.body.SUBCONTRACTOR_EMPLOYEE_ROOT_USERNAME
          );

          EmployeeModel.find(
            {
              SUBCONTRACTOR_EMPLOYEE_COMPANY_USERNAME: req.body.SUBCONTRACTOR_EMPLOYEE_COMPANY_USERNAME,
              SUBCONTRACTOR_EMPLOYEE_COMPANY_ID: req.body.SUBCONTRACTOR_EMPLOYEE_COMPANY_ID,
            },
            (errorcontract, recontract) => {
              if (errorcontract) {
                res.json({
                  operation: msgObject.failed,
                  result: recontract,
                  errorMsg: "Error in finding employee in the specified company",
                });
              } else if (recontract.length > 0) {
                res.json({
                  operation: msgObject.success,
                  result: recontract,
                  errorMsg: "Employee already exists in the specified company",
                });
              } else {
                res.json({
                  operation: msgObject.failed,
                  result: [],
                  errorMsg: "Employee does not exist in the specified company",
                });
              }
            }
          );
        } else {
          res.json({
            operation: msgObject.failed,
            result: x,
            errorMsg: "Invalid employee or root data",
          });
        }
      }
    );
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: [],
      errorMsg: error,
    });
  }
});
app.put("/getSubAttendance", middlewareFunctions.checkAuth, (req, res) => {
  try {
    let EmpModel = mongoSchemaModel.SubContractorEmployeeModel(
      req.body.ATTENDANCE_ROOT_USERNAME
    );

    EmpModel.find(
      { SUBCONTRACTOR_EMPLOYEE_USERNAME: req.body.ATTENDANCE_EMPLOYEE_USERNAME },
      (err, employeeData) => {
        console.log(employeeData);
        if (err) {
          return res.json({
            operation: msgObject.failed,
            result: [],
            errorMsg: "Error finding employee data",
          });
        }

        if (employeeData.length === 1) {
          const AttendanceModel = mongoSchemaModel.SubContractorAttendanceModel(
            req.body.ATTENDANCE_ROOT_USERNAME
          );

          AttendanceModel.find(
            {
              ATTENDANCE_EMPLOYEE_USERNAME: req.body.ATTENDANCE_EMPLOYEE_USERNAME,
              ATTENDANCE_DATE: {
                $gte: req.body.ATTENDANCE_START_DATE,
                $lte: req.body.ATTENDANCE_END_DATE,
              },
            },
            (error_attendance, attendanceData) => {
              console.log("attendancerecord :",attendanceData);
              if (error_attendance) {
                return res.json({
                  operation: msgObject.failed,
                  result: [],
                  errorMsg: "Error finding attendance data",
                });
              }

              if (attendanceData.length > 0) {
                return res.json({
                  operation: msgObject.success,
                  result: attendanceData,
                  errorMsg: null,
                });
              } else {
                return res.json({
                  operation: msgObject.failed,
                  result: [],
                  errorMsg: "No attendance data found for the specified period",
                });
              }
            }
          );
        } else {
          return res.json({
            operation: msgObject.failed,
            result: [],
            errorMsg: "Invalid employee data",
          });
        }
      }
    );
  } catch (error) {
    return res.json({
      operation: msgObject.failed,
      result: [],
      errorMsg: error.message || "An error occurred",
    });
  }
});




app.post( "/attendance",
  middlewareFunctions.checkAuth,
  middlewareFunctions.vaildateMember,
  (req, res) => {
    try {
      const { employeeId, timeIn, timeOut } = req.body;

      // Create a new attendance record
      const attendance = new mongoSchemaModel.AttendanceModel({
        employeeId,
        timeIn,
        timeOut,
      });

      // Save the attendance record to the database
      attendance.save((err, record) => {
        if (err) {
          res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: err,
          });
        } else {
          res.json({
            operation: msgObject.success,
            result: record,
            errorMsg: null,
          });
        }
      });
    } catch (error) {
      res.json({
        operation: msgObject.failed,
        result: null,
        errorMsg: error,
      });
    }
  }
);

//get all admin detail

app.put("/get_admin", middlewareFunctions.checkAuth, (req, res) => {
  try {
    let RootModel = mongoSchemaModel.RootModel(req.body.ROOT_USERNAME);
    RootModel.find(
      {
        ROOT_USERNAME: req.body.ROOT_USERNAME,
        ROOT_EMAIL: req.body.ROOT_EMAIL,
      },
      (err, x) => {
        // console.log("user data : ", x)
        if (x.length > 0) {
          res.json({
            operation: msgObject.success,
            result: x,
            errorMsg: null,
          });
        } else {
          res.json({
            operation: msgObject.failed,
            result: x,
            errorMsg: msgObject.invalid,
          });
        }
      }
    );
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: [],
      errorMsg: error,
    });
  }
});

//get all valid user using username

app.get(
  "/getvalidateusername/:username",
  middlewareFunctions.checkAuth,
  (req, res) => {
    try {
      // console.log("req.body : ", req.params)

      mongoose.on("error", console.error.bind(console, "connection error:"));
      mongoose.once("open", function () {
        // We're connected!
        // console.log("Connected to MongoDB");

        // Check if a collection exists
        mongoose.mongoose.collection(
          "myCollection",
          function (err, collection) {
            if (err || !collection) {
              // console.log("myCollection does not exist");
            } else {
              // console.log("myCollection exists");
            }
          }
        );
      });

      let RootModel = mongoSchemaModel.RootModel(req.body.ROOT_USERNAME);
      RootModel.find({ ROOT_USERNAME: req.body.ROOT_USERNAME }, (err, x) => {
        // console.log("user data : ", x)
        if (x.length > 0) {
          res.json({
            operation: msgObject.success,
            result: x,
            errorMsg: null,
          });
        } else {
          res.json({
            operation: msgObject.failed,
            result: x,
            errorMsg: msgObject.invalid,
          });
        }
      });
    } catch (error) {
      res.json({
        operation: msgObject.failed,
        result: null,
        errorMsg: error,
      });
    }
  }
);

// //get all company detail parentusername means admin 

// app.put("/get_company", middlewareFunctions.checkAuth, (req, res) => {
//   try {
//     let RootModel = mongoSchemaModel.RootModel(
//       req.body.COMPANY_ROOT_USERNAME
//     );

//     RootModel.find(
//       {
//       ROOT_USERNAME: req.body.COMPANY_ROOT_USERNAME,
//         ROOT_ID: req.body.COMPANY_ROOT_ID,
//       },
//       (err, x) => {
//         // console.log("user data : ", x)
//         if (x.length == 1) {
//           const CompanyModel = mongoSchemaModel.CompanyModel(
//             req.body.COMPANY_ROOT_USERNAME
//           );

//           CompanyModel.find(
//             {
//               COMPANY_ROOT_ID: req.body.COMPANY_ROOT_ID,
//               COMPANY_ROOT_USERNAME: req.body.COMPANY_ROOT_USERNAME,
//               COMPANY_ID: req.body.COMPANY_ID,
//               COMPANY_USERNAME: req.body.COMPANY_USERNAME,
//             },
//             (error, re) => {
//               if (re.length > 0) {
//                 res.json({
//                   operation: msgObject.success,
//                   result: re,
//                   errorMsg: null,
//                 });
//               } else {
//                 res.json({
//                   operation: msgObject.failed,
//                   result: null,
//                   errorMsg: msgObject.invalid,
//                 });
//               }
//             }
//           );
//         } else {
//           res.json({
//             operation: msgObject.failed,
//             result: x,
//             errorMsg: msgObject.invalid,
//           });
//         }
//       }
//     );
//   } catch (error) {
//     res.json({
//       operation: msgObject.failed,
//       result: null,
//       errorMsg: error,
//     });
//   }
// });

app.put("/get_company", middlewareFunctions.checkAuth, async (req, res) => {
  try {
    const rootUser = await mongoSchemaModel.RootModel.findOne({
      ROOT_USERNAME: req.body.COMPANY_ROOT_USERNAME,
      ROOT_ID: req.body.COMPANY_ROOT_ID,
    });

    if (rootUser) {
      const company = await mongoSchemaModel.CompanyModel.findOne({
        COMPANY_ROOT_ID: req.body.COMPANY_ROOT_ID,
        COMPANY_ROOT_USERNAME: req.body.COMPANY_ROOT_USERNAME,
        COMPANY_ID: req.body.COMPANY_ID,
        COMPANY_USERNAME: req.body.COMPANY_USERNAME,
      });

      if (company) {
        res.status(200).json({
          operation: "success",
          result: company,
          errorMsg: null,
        });
      } else {
        res.status(404).json({
          operation: "failed",
          result: null,
          errorMsg: "Invalid company parameters",
        });
      }
    } else {
      res.status(404).json({
        operation: "failed",
        result: null,
        errorMsg: "Invalid root user parameters",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      operation: "failed",
      result: null,
      errorMsg: "Internal server error",
    });
  }
});


// //get all company using user params

app.put("/get_companies/:user", middlewareFunctions.checkAuth, (req, res) => {
  try {
    let RootModel = mongoSchemaModel.RootModel(
      req.body.COMPANY_ROOT_USERNAME
    );

    RootModel.find(
      {
        ROOT_USERNAME: req.body.COMPANY_ROOT_USERNAME,
        ROOT_ID: req.body.COMPANY_ROOT_ID,
      },
      (err, x) => {
        // console.log("user data : ", x)
        if (x.length == 1) {
          const CompanyModel = mongoSchemaModel.CompanyModel(
            req.body.COMPANY_ROOT_USERNAME
          );

          CompanyModel.find(
            {
              COMPANY_ROOT_ID: req.body.COMPANY_ROOT_ID,
              COMPANY_ROOT_USERNAME: req.body.COMPANY_ROOT_USERNAME,
              COMPANY_USERNAME: req.params.user,
            },
            (error, re) => {
              if (re.length > 0) {
                res.json({
                  operation: msgObject.success,
                  result: re,
                  errorMsg: null,
                });
              } else {
                res.json({
                  operation: msgObject.failed,
                  result: null,
                  errorMsg: msgObject.invalid,
                });
              }
            }
          );
        } else {
          res.json({
            operation: msgObject.failed,
            result: x,
            errorMsg: msgObject.invalid,
          });
        }
      }
    );
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: null,
      errorMsg: error,
    });
  }
});

//query chatgpt means chat

app.post("/querytochatgpt", async (req, res) => {
  try {
    // console.log("trigger : /querytochatgpt")

    // let text = req.body.query.replace(/[\r\n]/g, "\\n")
    let text = `can you anlyze given message what the purpose of that '${req.body.query
      .replace(/[\r\n]/g, "\\n")
      .replaceAll(/[\n]+/g, "\\n")}' and give the output in json`;
    // console.log("body : ", text)

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      // prompt: `i give you two object fill key's value according to the second object {\n      'first':\"\",\n      'father name':\"\",\n      'phone number':\"\"\n    },{\n      \"Class : \": \"BCA 3rd \",\n      \"Name : \": \"DEEPANSHU \",\n      \"Father's Name : \": \"KARAN SINGH \",\n      \"Roll No. : \": \"1360610094 \",\n      \"Mobile No. : \": \"7206685433 \",\n      \"Address: : \": \"SANJAY COLONY, ROHTAK \",\n      \"Ph.: \": \"01262-274190 \",\n      \"Session \": \"2019-20 \"\n  }\n  and give the output in json format\n\n{\n    'first': \"DEEPANSHU\",\n    'father name': \"KARAN SINGH\",\n    'phone number': \"7206685433\"\n}`,

      // prompt: `can you anlyze given message what the purpose of that "Dear vikash, I hope this email finds you well. I am writing to let you know that I have attached the invoice for invoice pdf to this email. Please find the invoice attached and review it at your convenience. If you have any questions or concerns about the invoice, please do not hesitate to reach out to me. I will be more than happy to provide you with any further information that you may need. Thank you for your business and prompt payment. I appreciate your cooperation and look forward to working with you again in the future. Best regards, Deepanshu" and give the output in json`,
      prompt: `can you anlyze given message what the purpose of '${text}' and give the output in json`,
      max_tokens: 3000,
      temperature: 0,
      top_p: 1,
      // frequency_penalty: 0,
      // presence_penalty: 0,
      // stop: ["\n"],
    });
    let finaldata = response.data.choices[0].text;
    let index = finaldata.indexOf("{");
    let index2 = finaldata.lastIndexOf("}");
    // console.log("result  : ", finaldata, "end")
    // console.log("result  : ", JSON.parse(finaldata.slice(index, (index2 + 1))), "end")

    let data = JSON.parse(finaldata.slice(index, index2 + 1));

    mongoSchemaModel.EmailTaskAutomation.insertMany(
      [{ Details: data }],
      (err, x) => {
        if (err) {
          res.status(400).json({
            success: false,
            error: "There was an issue on the mongo server",
          });
        } else {
          res.status(200).json({
            success: true,
            data: response.data.choices[0].text,
            json_data: JSON.parse(finaldata.slice(index, index2 + 1)),
            fulldata: response.data,
          });
        }
      }
    );

//     // res.status(200).json({
//     //     success: true,
//     //     data: response.data.choices[0].text,
//     //     json_data: JSON.parse(finaldata.slice(index, (index2 + 1))),
//     //     fulldata: response.data
//     // });
  } catch (error) {
    // console.log("error : ", error)
    res.status(400).json({
      success: false,
      error: error.response
        ? error.response.data
        : "There was an issue on the server",
    });
  }
});

// get all task

app.get("/getalltask", (req, res) => {
  try {
    // console.log("trigger : /getalltask")
    mongoSchemaModel.EmailTaskAutomation.find(
      {},
      { _id: 0, __v: 0 },
      (err, x) => {
        if (err)
          return res.send({
            success: false,
            error: "something gonna wrong with mongo",
          });
        else
          return res.send({
            success: true,
            data: x,
            error: "no",
          });
      }
    );
  } catch (error) {
    return res.send({
      success: false,
      data: "something gonna wrong",
    });
  }
});

// get all tasks

app.get("/getalltasks", (req, res) => {
  try {
    // console.log("trigger : /getalltask")
    let EmpAttendance = mongoSchemaModel.EmployeeModel(
      req.body.ATTENDANCE_ROOT_USERNAME
    );
    EmpAttendance.find({}, (err, x) => {
      console.log();
      if (err)
        return res.send({
          success: false,
          error: "something gonna wrong with mongo",
        });
      else
        return res.send({
          success: true,
          data: x,
          error: "no",
        });
    });
  } catch (error) {
    return res.send({
      success: false,
      data: "something gonna wrong",
    });
  }
});

// get company employee

app.put("/get_employee", middlewareFunctions.checkAuth, (req, res) => {
  try {
    let RootModel = mongoSchemaModel.RootModel(
      req.body.EMPLOYEE_ROOT_USERNAME
    );

    RootModel.find(
      {
        ROOT_USERNAME: req.body.EMPLOYEE_ROOT_USERNAME,
        ROOT_ID: req.body.EMPLOYEE_ROOT_ID,
      },
      (err, x) => {
        // console.log("employee data : ", x)
        if (x.length == 1) {
          const EmployeeModel = mongoSchemaModel.EmployeeModel(
            req.body.EMPLOYEE_ROOT_USERNAME
          );

          EmployeeModel.find(
            {
              EMPLOYEE_COMPANY_USERNAME: req.body.EMPLOYEE_COMPANY_USERNAME,
              EMPLOYEE_COMPANY_ID: req.body.EMPLOYEE_COMPANY_ID,
            },
            (errorcontract, recontract) => {
              if (errorcontract)
                res.json({
                  operation: msgObject.failed,
                  result: recontract,
                  errorMsg: msgObject.invalid,
                });
              else if (recontract.length > 0) {
                res.json({
                  operation: msgObject.success,
                  result: recontract,
                  errorMsg: [],
                });
              } else {
                res.json({
                  operation: msgObject.failed,
                  result: [],
                  errorMsg: msgObject.invalid,
                });
              }
            }
          );
        } else {
          res.json({
            operation: msgObject.failed,
            result: x,
            errorMsg: msgObject.invalid,
          });
        }
      }
    );
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: [],
      errorMsg: error,
    });
  }
});

//get all employee

app.put("/getdatatest", (req, res) => {
  try {
    console.log("hoin");
  } catch (error) {
    return res.send({
      success: false,
      data: "something gonna wrong",
    });
  }
});

// //update employee detail

app.put("/update_employee", middlewareFunctions.checkAuth, (req, res) => {
  try {
    console.log("update_employee body : ", req.body);

    let {
      EMPLOYEE_ID,
      EMPLOYEE_COMPANY_ID,
      EMPLOYEE_COMPANY_USERNAME,
      EMPLOYEE_ROOT_ID,
      EMPLOYEE_ROOT_USERNAME,
      EMPLOYEE_DETAILS_FOR_UPDATES,
    } = req.body;
    const EmployeeModel = mongoSchemaModel.EmployeeModel(
      EMPLOYEE_ROOT_USERNAME
    );

    EmployeeModel.findOneAndUpdate(
      {
        EMPLOYEE_ID,
        EMPLOYEE_COMPANY_ID,
        EMPLOYEE_COMPANY_USERNAME,
        EMPLOYEE_ROOT_ID,
        EMPLOYEE_ROOT_USERNAME,
      },
      { ...EMPLOYEE_DETAILS_FOR_UPDATES },
      (error_emp, x_emp) => {
        if (error_emp)
          res.json({
            operation: msgObject.failed,
            result: recontract,
            errorMsg: msgObject.invalid,
          });
        else if (x_emp !== null) {
          res.json({
            operation: msgObject.success,
            result: x_emp,
            errorMsg: [],
          });
        } else {
          res.json({
            operation: msgObject.failed,
            result: [],
            errorMsg: "Employee Not Exist",
          });
        }
      }
    );
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: [],
      errorMsg: error,
    });
  }
});

//get all employee attendance

app.put(
  "/get_employee_for_employee",
  middlewareFunctions.checkAuth,
  (req, res) => {
    try {
      let RootModel = mongoSchemaModel.RootModel(
        req.body.EMPLOYEE_ROOT_USERNAME
      );

      RootModel.find(
        { ROOT_USERNAME: req.body.EMPLOYEE_ROOT_USERNAME },
        (err, x) => {
          // console.log("employee data : ", x)
          if (x.length == 1) {
            const EmployeeModel = mongoSchemaModel.EmployeeModel(
              req.body.EMPLOYEE_ROOT_USERNAME
            );

            EmployeeModel.find(
              {
                EMPLOYEE_USERNAME: req.body.EMPLOYEE_USERNAME,
                EMPLOYEE_EMAIL: req.body.EMPLOYEE_EMAIL,
              },
              (errorcontract, recontract) => {
                if (errorcontract)
                  res.json({
                    operation: msgObject.failed,
                    result: recontract,
                    errorMsg: msgObject.invalid,
                  });
                else if (recontract.length > 0) {
                  res.json({
                    operation: msgObject.success,
                    result: recontract,
                    errorMsg: [],
                  });
                } else {
                  res.json({
                    operation: msgObject.failed,
                    result: [],
                    errorMsg: msgObject.invalid,
                  });
                }
              }
            );
          } else {
            res.json({
              operation: msgObject.failed,
              result: x,
              errorMsg: msgObject.invalid,
            });
          }
        }
      );
    } catch (error) {
      res.json({
        operation: msgObject.failed,
        result: [],
        errorMsg: error,
      });
    }
  }
);

//get all task

app.get("/getalltasks", (req, res) => {
  try {
    // console.log("trigger : /getalltask")
    mongoSchemaModel.EmailTaskAutomation.find(
      {},
      { _id: 0, __v: 0 },
      (err, x) => {
        if (err)
          return res.send({
            success: false,
            error: "something gonna wrong with mongo",
          });
        else
          return res.send({
            success: true,
            data: x,
            error: "no",
          });
      }
    );
  } catch (error) {
    return res.send({
      success: false,
      data: "something gonna wrong",
    });
  }
});

//update employee attendance

app.put(
  "/get_employee_all_for_attendence",
  middlewareFunctions.checkAuth,
  (req, res) => {
    try {
      // console.log("req : ", req.body)
      let EmpModel = mongoSchemaModel.EmployeeModel(
        req.body.ATTENDANCE_ROOT_USERNAME
      );

      EmpModel.find(
        { EMPLOYEE_USERNAME: req.body.ATTENDANCE_EMPLOYEE_USERNAME },
        (err, x) => {
          // console.log("employee data : ", x)
          if (x.length == 1) {
            const AttendanceModel = mongoSchemaModel.AttendanceModel(
              req.body.ATTENDANCE_ROOT_USERNAME
            );

            AttendanceModel.find(
              {
                ATTENDANCE_EMPLOYEE_USERNAME:
                  req.body.ATTENDANCE_EMPLOYEE_USERNAME,
                ATTENDANCE_DATE_ID: {
                  $gte: req.body.ATTENDANCE_START_DATE,
                  $lte: req.body.ATTENDANCE_END_DATE,
                },
              },
              (error_attendance, x_attendance) => {
                // console.log("x_attendance : ", x_attendance, error_attendance)
                if (error_attendance)
                  res.json({
                    operation: msgObject.failed,
                    result: recontract,
                    errorMsg: msgObject.invalid,
                  });
                else if (x_attendance.length > 0) {
                  res.json({
                    operation: msgObject.success,
                    result: x_attendance,
                    errorMsg: null,
                  });
                } else {
                  res.json({
                    operation: msgObject.failed,
                    result: [],
                    errorMsg: msgObject.invalid,
                  });
                }
              }
            );
          } else {
            res.json({
              operation: msgObject.failed,
              result: [],
              errorMsg: msgObject.invalid,
            });
          }
        }
      );
    } catch (error) {
      res.json({
        operation: msgObject.failed,
        result: [],
        errorMsg: error,
      });
    }
  }
);

//get all project

app.put("/get_projects", middlewareFunctions.checkAuth, (req, res) => {
  try {
    let RootModel = mongoSchemaModel.RootModel(
      req.body.PROJECT_ROOT_USERNAME
    );

    RootModel.find(
      {
        ROOT_USERNAME: req.body.PROJECT_ROOT_USERNAME,
        ROOT_ID: req.body.PROJECT_ROOT_ID,
      },
      (err, x) => {
        // console.log("Project data : ", x)
        if (x.length == 1) {
          const ProjectModel = mongoSchemaModel.ProjectModel(
            req.body.PROJECT_ROOT_USERNAME
          );

          ProjectModel.find(
            {
              PROJECT_PARENT_ID: req.body.PROJECT_COMPANY_ID,
              PROJECT_PARENT_USERNAME: req.body.PROJECT_COMPANY_USERNAME,
            },
            (errorcontract, recontract) => {
              if (errorcontract)
                res.json({
                  operation: msgObject.failed,
                  result: recontract,
                  errorMsg: msgObject.invalid,
                });
              else if (recontract.length > 0) {
                res.json({
                  operation: msgObject.success,
                  result: recontract,
                  errorMsg: [],
                });
              } else {
                res.json({
                  operation: msgObject.failed,
                  result: [],
                  errorMsg: msgObject.invalid,
                });
              }
            }
          );
        } else {
          res.json({
            operation: msgObject.failed,
            result: x,
            errorMsg: msgObject.invalid,
          });
        }
      }
    );
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: [],
      errorMsg: error,
    });
  }
});

// get one project only

app.put("/get_projects_one", middlewareFunctions.checkAuth, (req, res) => {
  try {
    let RootModel = mongoSchemaModel.RootModel(
      req.body.PROJECT_ROOT_USERNAME
    );

    RootModel.find(
      {
        ROOT_USERNAME: req.body.PROJECT_ROOT_USERNAME,
        ROOT_ID: req.body.PROJECT_ROOT_ID,
      },
      (err, x) => {
        // console.log("Project data : ", x)
        if (x.length == 1) {
          const ProjectModel = mongoSchemaModel.ProjectModel(
            req.body.PROJECT_ROOT_USERNAME
          );

          ProjectModel.find(
            {
              PROJECT_ID: req.body.PROJECT_ID,
            },
            (errorcontract, recontract) => {
              if (errorcontract)
                res.json({
                  operation: msgObject.failed,
                  result: recontract,
                  errorMsg: msgObject.invalid,
                });
              else if (recontract.length > 0) {
                res.json({
                  operation: msgObject.success,
                  result: recontract,
                  errorMsg: [],
                });
              } else {
                res.json({
                  operation: msgObject.failed,
                  result: [],
                  errorMsg: msgObject.invalid,
                });
              }
            }
          );
        } else {
          res.json({
            operation: msgObject.failed,
            result: x,
            errorMsg: msgObject.invalid,
          });
        }
      }
    );
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: [],
      errorMsg: error,
    });
  }
});

//get all sudcontractor detail

app.put("/get_subcontractor", middlewareFunctions.checkAuth, (req, res) => {
  try {
    let RootModel = mongoSchemaModel.RootModel(
      req.body.SUBCONTRACTOR_ROOT_USERNAME
    );

    RootModel.find(
      {
        ROOT_USERNAME: req.body.SUBCONTRACTOR_ROOT_USERNAME,
        ROOT_ID: req.body.SUBCONTRACTOR_ROOT_ID,
      },
      (err, x) => {
        // console.log("Project data : ", x)
        if (x.length == 1) {
          const SubContractorModel = mongoSchemaModel.SubContractorModel(
            req.body.SUBCONTRACTOR_ROOT_USERNAME
          );

          SubContractorModel.find(
            {
              SUBCONTRACTOR_PARENT_ID: req.body.SUBCONTRACTOR_COMPANY_ID,
              SUBCONTRACTOR_COMPANY_USERNAME:
                req.body.SUBCONTRACTOR_COMPANY_USERNAME,
            },
            (errorcontract, recontract) => {
              if (errorcontract)
                res.json({
                  operation: msgObject.failed,
                  result: recontract,
                  errorMsg: msgObject.invalid,
                });
              else if (recontract.length > 0) {
                res.json({
                  operation: msgObject.success,
                  result: recontract,
                  errorMsg: [],
                });
              } else {
                res.json({
                  operation: msgObject.failed,
                  result: [],
                  errorMsg: msgObject.invalid,
                });
              }
            }
          );
        } else {
          res.json({
            operation: msgObject.failed,
            result: x,
            errorMsg: msgObject.invalid,
          });
        }
      }
    );
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: [],
      errorMsg: error,
    });
  }
});

//update project

app.put("/update_projects", middlewareFunctions.checkAuth, (req, res) => {
  try {
    console.log("update_projects body : ", req.body);

    let {
      PROJECT_ID,
      PROJECT_COMPANY_ID,
      PROJECT_COMPANY_USERNAME,
      PROJECT_ROOT_ID,
      PROJECT_ROOT_USERNAME,
      PROJECT_DETAILS_FOR_UPDATES,
    } = req.body;

    if (PROJECT_DETAILS_FOR_UPDATES) {
      const ProjectModel = mongoSchemaModel.ProjectModel(
        PROJECT_ROOT_USERNAME
      );

      ProjectModel.findOneAndUpdate(
        {
          PROJECT_ID,
          PROJECT_COMPANY_ID,
          PROJECT_COMPANY_USERNAME,
          PROJECT_ROOT_ID,
          PROJECT_ROOT_USERNAME,
        },
        { ...PROJECT_DETAILS_FOR_UPDATES },
        (error_project, x_project) => {
          console.log("x_project : ", x_project);
          if (error_project)
            res.json({
              operation: msgObject.failed,
              result: error_project,
              errorMsg: msgObject.invalid,
            });
          else if (x_project !== null) {
            res.json({
              operation: msgObject.success,
              result: x_project,
              errorMsg: [],
            });
          } else {
            res.json({
              operation: msgObject.failed,
              result: [],
              errorMsg: "Project Not Exist",
            });
          }
        }
      );
    } else {
      res.json({
        operation: msgObject.failed,
        result: [],
        errorMsg: "Details Missing",
      });
    }
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: [],
      errorMsg: error,
    });
  }
});

//get all company detail

// app.put("/get_all_company", middlewareFunctions.checkAuth, (req, res) => {
//   try {
//     let AdminModel = mongoSchemaModel.AdminModel(
//       req.body.COMPANY_PARENT_USERNAME
//     );

//     AdminModel.find(
//       {
//         ADMIN_USERNAME: req.body.COMPANY_PARENT_USERNAME,
//         ADMIN_ID: req.body.COMPANY_PARENT_ID,
//       },
//       (err, x) => {
//         // console.log("user data : ", x)
//         if (x.length == 1) {
//           const CompanyModel = mongoSchemaModel.CompanyModel(
//             req.body.COMPANY_PARENT_USERNAME
//           );

//           CompanyModel.find({}, (error, re) => {
//             if (re.length > 0) {
//               res.json({
//                 operation: msgObject.success,
//                 result: re,
//                 errorMsg: [],
//               });
//             } else {
//               res.json({
//                 operation: msgObject.failed,
//                 result: [],
//                 errorMsg: msgObject.invalid,
//               });
//             }
//           });
//         } else {
//           res.json({
//             operation: msgObject.failed,
//             result: x,
//             errorMsg: msgObject.invalid,
//           });
//         }
//       }
//     );
//   } catch (error) {
//     res.json({
//       operation: msgObject.failed,
//       result: [],
//       errorMsg: error,
//     });
//   }
// });

// // create employee attendance working

// app.post(
//   "/create_emp_attendence",
//   middlewareFunctions.checkAuth,
//   (req, res) => {
//     try {
//       console.log("body : ", req.body);

//       let temp_body = { ...req.body };
//       console.log("tempdata",temp_body);

//       delete temp_body.ATTENDANCE_IN;
//       delete temp_body.ATTENDANCE_OUT;


    
     

//       let AttendanceModel = mongoSchemaModel.AttendanceModel(
//         req.body.ATTENDANCE_ADMIN_USERNAME
//       );

//       AttendanceModel.find(
//         {
//           ATTENDANCE_DATE_ID: temp_body.ATTENDANCE_DATE_ID,
//           ATTENDANCE_EMPLOYEE_ID: temp_body.ATTENDANCE_EMPLOYEE_ID,
//           ATTENDANCE_PROJECT_ID:temp_body.ATTENDANCE_PROJECT_ID,



//         },
//         (errAt, x) => {
//           console.log(x);
//           if (errAt)
//             res.json({
//               operation: msgObject.failed,
//               result: null,
//               errorMsg: errAt,
//             });
//           else {
//             console.log("x : ", x);
//             let EmployeeModel = mongoSchemaModel.EmployeeModel(
//               req.body.ATTENDANCE_ADMIN_USERNAME
//             );
//             if (x.length > 0) {
//               AttendanceModel.findOneAndUpdate(
//                 { ATTENDANCE_ID: x[0].ATTENDANCE_ID },
              
//                 {
//                   $set: {
//                     ATTENDANCE_OUT: req.body.ATTENDANCE_OUT,
//                     // ATTENDANCE_IN: req.body.ATTENDANCE_IN,
//                     ATTENDANCE_PROJECT_ID:req.body. ATTENDANCE_PROJECT_ID,

//                   },
//                 },
//                 { new: true },
//                 (error, re) => {
//                   console.log("re : ", re);
//                   if (error)
//                     res.json({
//                       operation: msgObject.failed,
//                       result: null,
//                       errorMsg: error,
//                     });
//                   else {
//                     EmployeeModel.findOneAndUpdate(
//                       {
//                         EMPLOYEE_ID: req.body.ATTENDANCE_EMPLOYEE_ID,
//                         EMPLOYEE_USERNAME:
//                           req.body.ATTENDANCE_EMPLOYEE_USERNAME,
//                       },
//                       {
//                         $set: {
//                           EMPLOYEE_ATTENDANCE_STATUS: {
//                             date: req.body.ATTENDANCE_DATE_ID,
//                             IN: true,
//                             OUT: true,
//                           },
//                         },
//                       },
//                       { new: true },
//                       (emp_err, emp_x) => {
//                         console.log("emp_x : ", emp_x);
//                         if (emp_err)
//                           res.json({
//                             operation: msgObject.failed,
//                             result: null,
//                             errorMsg: emp_err,
//                           });
//                         else
//                           res.json({
//                             operation: msgObject.success,
//                             result: re,
//                             errorMsg: null,
//                           });
//                       }
//                     );
//                   }
//                 }
//               );
//             } else {
//               mongoSchemaModel.countermodel.findOneAndUpdate(
//                 { id: "autoval" },
//                 { $inc: { seq: 1 } },
//                 { new: true },
//                 (err, cd) => {
//                   console.log("counter value : ", cd);

//                   let seqId;
//                   if (cd == null) {
//                     const newval = new mongoSchemaModel.countermodel({
//                       id: "autoval",
//                       seq: 1,
//                     });
//                     newval.save();
//                     seqId = 1;
//                   } else {
//                     seqId = cd.seq;
//                   }
//                   req.body.ATTENDANCE_ID = cd.seq;

//                   AttendanceModel.insertMany(req.body, (err, resp) => {
//                     if (err)
//                       res.json({
//                         operation: msgObject.failed,
//                         result: null,
//                         errorMsg: err,
//                       });
//                     else {
//                       EmployeeModel.findOneAndUpdate(
//                         {
//                           EMPLOYEE_ID: req.body.ATTENDANCE_EMPLOYEE_ID,
//                           EMPLOYEE_USERNAME:
//                             req.body.ATTENDANCE_EMPLOYEE_USERNAME,
//                         },
//                         {
//                           $set: {
//                             EMPLOYEE_ATTENDANCE_STATUS: {
//                               date: req.body.ATTENDANCE_DATE_ID,
//                               IN: true,
//                               OUT: false,
//                               PROJECTED_ID:req.body.ATTENDANCE_PROJECT_ID,
//                             },
//                           },
//                         },
//                         { new: true },
//                         (emp_err, emp_x) => {
//                           console.log("emp_x : ", emp_x);
//                           if (emp_err)
//                             res.json({
//                               operation: msgObject.failed,
//                               result: null,
//                               errorMsg: emp_err,
//                             });
//                           else
//                             res.json({
//                               operation: msgObject.success,
//                               result: resp,
//                               errorMsg: null,
//                             });
//                         }
//                       );
//                     }
//                   });
//                 }
//               );
//             }
//           }
//         }
//       );
//     } catch (error) {
//       res.json({
//         operation: msgObject.failed,
//         result: null,
//         errorMsg: error,
//       });
//     }
//   }
// );

// // get all attendance working

app.put("/get_emp_attendence", middlewareFunctions.checkAuth, (req, res) => {
  try {
    let RootModel = mongoSchemaModel.RootModel(
      req.body.ATTENDANCE_ROOT_USERNAME
    );

    RootModel.find(
      {
        ROOT_USERNAME: req.body.ATTENDANCE_ROOT_USERNAME,
        ROOT_ID: req.body.ATTENDANCE_ROOT_ID,
      },
      (err, x) => {
        // console.log("employee data : ", x)
        if (x.length == 1) {
          const AttendanceModel = mongoSchemaModel.AttendanceModel(
            req.body.ATTENDANCE_ROOT_USERNAME
          );

          AttendanceModel.find({}, (errorcontract, recontract) => {
            if (errorcontract)
              res.json({
                operation: msgObject.failed,
                result: recontract,
                errorMsg: msgObject.invalid,
              });
            else if (recontract.length > 0) {
              res.json({
                operation: msgObject.success,
                result: recontract,
                errorMsg: [],
              });
            } else {
              res.json({
                operation: msgObject.failed,
                result: [],
                errorMsg: msgObject.invalid,
              });
            }
          });
        } else {
          res.json({
            operation: msgObject.failed,
            result: x,
            errorMsg: msgObject.invalid,
          });
        }
      }
    );
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: [],
      errorMsg: error,
    });
  }
});

// Required Api's
// Edit Project, Edit Subcontract, Delete Project, Delete Subcontract,

//test dumy post

app.post("/testapi", (req, res) => {
  try {
    return res.json({
      success: true,
      dataReceived: req.body,
    });
  } catch (error) {
    return res.json({
      success: false,
      dataReceived: "error",
    });
  }
});

// //create document
// 
app.post(
  "/create_document",
  middlewareFunctions.checkAuth,
  upload.single("file"),
  (req, res) => {
    try {
      const fileData = fs.readFileSync(req.file.path);

      if (!res.headersSent) res.set("Content-Type", "application/json");
      mongoSchemaModel.countermodel.findOneAndUpdate(
        { id: "autoval" },
        { $inc: { seq: 1 } },
        { new: true },
        (err, cd) => {
          // // console.log("counter value : ", cd);

          let seqId;
          if (cd == null) {
            let newval = new mongoSchemaModel.countermodel({
              id: "autoval",
              seq: 1,
            });
            newval.save();
            seqId = 1;
          } else {
            seqId = cd.seq;
          }
          req.body.DOCUMENT_ID = cd.seq;

          let DocumentModel = mongoSchemaModel.DocumentModel(
            req.body.DOCUMENT_ROOT_USERNAME
          );

          DocumentModel.insertMany(
            {
              ...req.body,
              ["DOCUMENT_FILEDATA"]: {
                ...req.file,
                ["base64"]: fileData.toString("base64"),
              },
            },
            { new: true },
            (err, resp) => {
              if (err)
                res.json({
                  operation: msgObject.failed,
                  result: null,
                  errorMsg: err,
                });
              else {
                fs.unlink(req.file.path, (err) => {
                  if (err) {
                    console.error("Error deleting file:", err);
                  } else {
                    // console.log('File deleted successfully');
                  }
                });
                res.json({
                  operation: msgObject.success,
                  result: resp,
                  errorMsg: null,
                });
              }
            }
          );
        }
      );
    } catch (error) {
      // console.log("error : ", error)
      res.json({
        operation: msgObject.failed,
        result: null,
        errorMsg: error,
      });
    }
  }
);

// // Delete Document
// // Assuming you already have the required dependencies and middleware functions imported and defined.

// // delete document

app.delete(
  "/delete_document/:DOCUMENT_ID",
  middlewareFunctions.checkAuth,
  (req, res) => {
    try {
      const documentId = req.params.DOCUMENT_ID;
      console.log("delete_document : ", documentId);

      let DocumentModel = mongoSchemaModel.DocumentModel(
        req.body.DOCUMENT__USERNAME
      );

      // First, check if the document exists before attempting to delete it.
      DocumentModel.findOne({ DOCUMENT_ID: documentId }, (err, document) => {
        if (err) {
          res.json({
            operation: msgObject.failed,
            errorMsg: err,
          });
        } else if (!document) {
          res.json({
            operation: msgObject.failed,
            errorMsg: "Document not found.",
          });
        } else {
          // Document found, proceed with deletion.
          DocumentModel.deleteOne(
            { DOCUMENT_ID: documentId },
            (err, result) => {
              if (err) {
                res.json({
                  operation: msgObject.failed,
                  errorMsg: err,
                });
              } else {
                res.json({
                  operation: msgObject.success,
                  result: result,
                  errorMsg: null,
                });
              }
            }
          );
        }
      });
    } catch (error) {
      res.json({
        operation: msgObject.failed,
        errorMsg: error,
      });
    }
  }
);

// // not in use yet
// // app.delete('/delete_emp/:EMPLOYEE_ID', middlewareFunctions.checkAuth, (req, res) => {
// //     try {
// //         const employeeId = req.params.EMPLOYEE_ID;
// //         console.log("delete_employeeId : ", employeeId)

// //         let EmployeeModel = mongoSchemaModel.EmployeeModel(req.body.EMPLOYEE_ADMIN_USERNAME)

// //         // First, check if the document exists before attempting to delete it.
// //         EmployeeModel.findOne({ EMPLOYEE_ID: employeeId }, (err, resQuery) => {
// //             if (err) {
// //                 res.json({
// //                     operation: msgObject.failed,
// //                     errorMsg: err
// //                 });
// //             } else if (!resQuery) {
// //                 res.json({
// //                     operation: msgObject.failed,
// //                     errorMsg: "Employee not found."
// //                 });
// //             } else {
// //                 // Document found, proceed with deletion.
// //                 EmployeeModel.deleteOne({ EMPLOYEE_ID: employeeId }, (err, result) => {
// //                     if (err) {
// //                         res.json({
// //                             operation: msgObject.failed,
// //                             errorMsg: err
// //                         });
// //                     } else {
// //                         res.json({
// //                             operation: msgObject.success,
// //                             result: result,
// //                             errorMsg: null
// //                         });
// //                     }
// //                 });
// //             }
// //         });
// //     } catch (error) {
// //         res.json({
// //             operation: msgObject.failed,
// //             errorMsg: error
// //         });
// //     }
// // });

// //download document

app.put("/download_document", (req, res) => {
  try {
    // console.log("body : ", req.body)

    let DocumentModel = mongoSchemaModel.DocumentModel(
      req.body.DOCUMENT_ROOT_USERNAME
    );

    DocumentModel.find({ DOCUMENT_ID: req.body.DOCUMENT_ID }, (err, x) => {
      // console.log("DOCUMENT data : ", x.length)
      if (x.length == 1) {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${x[0].DOCUMENT_FILEDATA.originalname}`
        );
        res.setHeader("Content-Type", x[0].DOCUMENT_FILEDATA.mimetype);

        // res.download(Buffer.from(x[0].DOCUMENT_FILEDATA.base64, 'base64'));
        res.send(x[0].DOCUMENT_FILEDATA.base64);
      } else {
        res.json({
          operation: msgObject.failed,
          result: x,
          errorMsg: msgObject.invalid,
        });
      }
    });
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: [],
      errorMsg: error,
    });
  }
});

// get all document

app.put("/get_all_document", (req, res) => {
  try {
    // console.log("body : ", req.body)

    let DocumentModel = mongoSchemaModel.DocumentModel(
      req.body.DOCUMENT_ROOT_USERNAME
    );

    DocumentModel.find(
      { DOCUMENT_REF_ID: req.body.DOCUMENT_REF_ID },
      { DOCUMENT_FILEDATA: { base64: 0 } },
      (err, x) => {
        // console.log("DOCUMENT data : ", x)
        if (x.length > 0) {
          res.json({
            operation: msgObject.success,
            result: x,
            errorMsg: [],
          });
        } else {
          res.json({
            operation: msgObject.failed,
            result: x,
            errorMsg: msgObject.invalid,
          });
        }
      }
    );
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: [],
      errorMsg: error,
    });
  }
});

// // app.put('/get_attendance_acc_to_emp', middlewareFunctions.checkAuth, (req, res) => {
// //     try {

// //         let EmployeeModel = mongoSchemaModel.EmployeeModel(req.body.ADMIN_USERNAME)

// //         EmployeeModel.find({}, (err, x) => {
// //             console.log("emp data : ", x)

// //         let AttendanceModel = mongoSchemaModel.AttendanceModel(req.body.ADMIN_USERNAME)

// //         let data = []
// //         x.map((e,i)=>{

// //             AttendanceModel.find({ATTENDANCE_EMPLOYEE_ID:x[i].EMPLOYEE_ID},(attendance_err,attendance_x)=>{
// //                 data.push({...x,EMPLOYEE_ATTENDANCE:attendance_x})
// //             })
// //         })
// //             console.log("data >> : ",data)
// //         })
// //     } catch (error) {
// //         res.json({
// //             operation: msgObject.failed,
// //             result: [],
// //             errorMsg: error
// //         })
// //     }
// // })

// //assign project
app.post("/assign_project", (req, res) => {
  try {
    console.log("body : ", req.body);
    let {
      PROJECT_ID,
      PROJECT_COMPANY_ID,
      PROJECT_ROOT_ID,
      PROJECT_ROOT_USERNAME,
      PROJECT_USERNAME,
      EMPLOYEE_ID,
      EMPLOYEE_COMPANY_ID,
      EMPLOYEE_COMPANY_USERNAME,
      EMPLOYEE_ROOT_ID,
      EMPLOYEE_ROOT_USERNAME,
    } = req.body;

    let EmployeeModel = mongoSchemaModel.EmployeeModel(
      EMPLOYEE_ROOT_USERNAME
    );
    EmployeeModel.findOneAndUpdate(
      {
        EMPLOYEE_ID,
        EMPLOYEE_COMPANY_ID,
        EMPLOYEE_COMPANY_USERNAME,
        EMPLOYEE_ROOT_ID,
        EMPLOYEE_ROOT_USERNAME,
        EMPLOYEE_ASSIGN: {
          $not: {
            $elemMatch: {
              EMPLOYEE_ID: EMPLOYEE_ID,
              PROJECT_ID: PROJECT_ID,
            },
          },
        },
      },
      {
        $push: {
          EMPLOYEE_ASSIGN: {
            EMPLOYEE_ID,
            PROJECT_ID,
            PROJECT_COMPANY_ID,
            PROJECT_ROOT_ID,
            PROJECT_ROOT_USERNAME,
            PROJECT_USERNAME,
          },
        },
      },
      (err_emp, x_emp) => {
        console.log("EmployeeModel : ", x_emp, err_emp);
        if (x_emp) {
          let ProjectModel = mongoSchemaModel.ProjectModel(
            PROJECT_ROOT_USERNAME
          );

          ProjectModel.findOneAndUpdate(
            {
              PROJECT_ID,
              PROJECT_COMPANY_ID,
              PROJECT_ROOT_ID,
              PROJECT_ROOT_USERNAME,
              PROJECT_USERNAME,
              PROJECT_ASSIGN: {
                $not: {
                  $elemMatch: {
                    PROJECT_ID: PROJECT_ID,
                    EMPLOYEE_ID: EMPLOYEE_ID,
                  },
                },
              },
            },
            {
              $push: {
                PROJECT_ASSIGN: {
                  PROJECT_ID,
                  EMPLOYEE_ID,
                  EMPLOYEE_COMPANY_ID,
                  EMPLOYEE_COMPANY_USERNAME,
                  EMPLOYEE_ROOT_ID,
                  EMPLOYEE_ROOT_USERNAME,
                },
              },
            },
            (err, x) => {
              // console.log("ProjectModel : ", x)
              if (err)
                res.json({
                  operation: msgObject.failed,
                  result: [],
                  errorMsg: err,
                });
              else if (x !== null) {
                res.json({
                  operation: msgObject.success,
                  result: x,
                  errorMsg: null,
                });
              } else {
                res.json({
                  operation: msgObject.failed,
                  result: [],
                  errorMsg:
                    "May be Employee Already Assigned OR Project Not Exist",
                });
              }
            }
          );
        } else {
          res.json({
            operation: msgObject.failed,
            result: [],
            errorMsg: "Employee Not Exist OR Project Already Assigned",
          });
        }
      }
    );
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: [],
      errorMsg: error,
    });
  }
});

// app.post('/assign_project', (req, res) => {
//     try {

//         // console.log("body : ", req.body)
//         let { PROJECT_ID,
//             PROJECT_PARENT_ID,
//             PROJECT_MEMBER_PARENT_ID,
//             PROJECT_MEMBER_PARENT_USERNAME,
//             PROJECT_USERNAME,
//             EMPLOYEE_ID,
//             EMPLOYEE_PARENT_ID,
//             EMPLOYEE_PARENT_USERNAME,
//             EMPLOYEE_MEMBER_PARENT_ID,
//             EMPLOYEE_MEMBER_PARENT_USERNAME } = req.body

//         let EmployeeModel = mongoSchemaModel.EmployeeModel(EMPLOYEE_MEMBER_PARENT_USERNAME)
//         EmployeeModel.find({
//             EMPLOYEE_ID,
//             EMPLOYEE_PARENT_ID,
//             EMPLOYEE_PARENT_USERNAME,
//             EMPLOYEE_MEMBER_PARENT_ID,
//             EMPLOYEE_MEMBER_PARENT_USERNAME
//         }, (err_emp, x_emp) => {
//             // console.log("EmployeeModel : ", x_emp)
//             if (x_emp.length > 0) {
//                 let ProjectModel = mongoSchemaModel.ProjectModel(PROJECT_MEMBER_PARENT_USERNAME)

//                 ProjectModel.findOneAndUpdate({
//                     PROJECT_ID,
//                     PROJECT_PARENT_ID,
//                     PROJECT_MEMBER_PARENT_ID,
//                     PROJECT_MEMBER_PARENT_USERNAME,
//                     PROJECT_USERNAME,
//                     PROJECT_ASSIGN: {
//                         $not: {
//                             $elemMatch: {
//                                 EMPLOYEE_ID: EMPLOYEE_ID
//                             }
//                         }
//                     }
//                 }, {
//                     $push: {
//                         PROJECT_ASSIGN: {
//                             EMPLOYEE_ID,
//                             EMPLOYEE_PARENT_ID,
//                             EMPLOYEE_PARENT_USERNAME,
//                             EMPLOYEE_MEMBER_PARENT_ID,
//                             EMPLOYEE_MEMBER_PARENT_USERNAME
//                         }
//                     }
//                 }, (err, x) => {
//                     // console.log("ProjectModel : ", x)
//                     if (err) res.json({
//                         operation: msgObject.failed,
//                         result: [],
//                         errorMsg: err
//                     })
//                     else if (x !== null) {

//                         res.json({
//                             operation: msgObject.success,
//                             result: x,
//                             errorMsg: null
//                         })
//                     } else {
//                         res.json({
//                             operation: msgObject.failed,
//                             result: [],
//                             errorMsg: 'May be Employee Already Assigned OR Project Not Exist'
//                         })
//                     }
//                 })

//             } else {
//                 res.json({
//                     operation: msgObject.failed,
//                     result: [],
//                     errorMsg: "Employee Not Exist"
//                 })
//             }
//         })

//     } catch (error) {
//         res.json({
//             operation: msgObject.failed,
//             result: [],
//             errorMsg: error
//         })
//     }
// })

// Made By Varun For Attendence Page Getting All Employees Values;

app.put(
  "/get_employee_details_for_attendence",
  middlewareFunctions.checkAuth,
  (req, res) => {
    console.log(req.body.ROOT_USERNAME, "req.body.ROOT_USERNAME");
    try {
      let data = [];
      console.log("req is", req.body);

      let AttendanceModel = mongoSchemaModel.AttendanceModel(
        req.body.EMPLOYEE_ROOT_USERNAME
      );
      const EmployeeModel = mongoSchemaModel.EmployeeModel(
        req.body.EMPLOYEE_ROOT_USERNAME
      );

      EmployeeModel.find(
        { EMPLOYEE_COMPANY_USERNAME: req.body.ROOT_USERNAME },
        (errorcontract, recontract) => {
          if (errorcontract)
            res.json({
              operation: msgObject.failed,
              result: recontract,
              errorMsg: msgObject.invalid,
            });
          else if (recontract.length > 0) {
            console.log("employee details", recontract.length);

            let respData = [];
            let counter = 0;
            function recursion_fun() {
              // recontract[counter]
              AttendanceModel.find({
                ATTENDANCE_EMPLOYEE_ID: recontract[counter].EMPLOYEE_ID,
              })
                .then((employees) => {
                  console.log(
                    "Employees List",
                    employees.length,
                    "<<>>",
                    recontract[counter].EMPLOYEE_ID
                  );

                  respData.push({
                    ...recontract[counter],
                    AttendanceData: employees,
                  });

                  counter++;
                  if (counter < recontract.length) {
                    recursion_fun();
                  } else {
                    console.log("recursion ended");
                    console.log("respData : ", respData);
                    res.json({
                      operation: msgObject.success,
                      result: respData,
                      errorMsg: [],
                    });
                  }
                })
                .catch((err) => {
                  console.error("Error fetching employee details:", err);
                });
            }

            recursion_fun();

//             // Promise.all(recontract.map(e => {
//             //     AttendanceModel.find({
//             //         ATTENDANCE_EMPLOYEE_ID: e.EMPLOYEE_ID,
//             //     })
//             //         .then((employees) => {
//             //             console.log("Employees List", employees, "<<>>", e.EMPLOYEE_ID);

//             //             respData.push({ ...e, AttendanceData: employees })

//             //             // if(employees.length > 0 ){
//             //             //     data = employees;
//             //             //     console.log("data", data);
//             //             //     data.forEach((emp) => {
//             //             //         // Access individual properties of each emp object
//             //             //         const attendanceDateId = emp.ATTENDANCE_DATE_ID;
//             //             //         // Debugging logs
//             //             //         console.log('emp forEach', emp,typeof Object.keys(emp));
//             //             //          // Check if the property exists and has a value
//             //             //         if (attendanceDateId !== undefined) {
//             //             //             console.log('Attendance Date ID is valid:', attendanceDateId);
//             //             //         } else {
//             //             //             console.log('Attendance Date ID is undefined or missing.');
//             //             //         }
//             //             //     });
//             //             // }
//             //         })
//             //         .catch((err) => {
//             //             console.error('Error fetching employee details:', err);
//             //         });
//             // }))
          } else {
            res.json({
              operation: msgObject.failed,
              result: [],
              errorMsg: msgObject.invalid,
            });
          }
        }
      );
    } catch (error) {
      res.json({
        operation: msgObject.failed,
        result: [],
        errorMsg: error,
      });
    }
  }
);

// update subcontractor

app.put("/update_subcontructor", middlewareFunctions.checkAuth, (req, res) => {
  try {
    console.log("update_subcontructor body : ", req.body);

    let {
      SUBCONTRACTOR_ID,
      SUBCONTRACTOR_COMPANY_ID,
      SUBCONTRACTOR_COMPANY_USERNAME,
      SUBCONTRACTOR_ROOT_ID,
      SUBCONTRACTOR_ROOT_USERNAME,
      SUBCONTRACTOR_DETAILS_FOR_UPDATES,
    } = req.body;
    const SubContractorModel = mongoSchemaModel.SubContractorModel(
      SUBCONTRACTOR_ROOT_USERNAME
    );

    SubContractorModel.findOneAndUpdate(
      {
        SUBCONTRACTOR_ID,
        SUBCONTRACTOR_COMPANY_ID,
        SUBCONTRACTOR_COMPANY_USERNAME,
        SUBCONTRACTOR_ROOT_ID,
        SUBCONTRACTOR_ROOT_USERNAME,
      },
      { ...SUBCONTRACTOR_DETAILS_FOR_UPDATES },
      (error_emp, x_emp) => {
        if (error_emp)
          res.json({
            operation: msgObject.failed,
            result: recontract,
            errorMsg: msgObject.invalid,
          });
        else if (x_emp !== null) {
          res.json({
            operation: msgObject.success,
            result: x_emp,
            errorMsg: [],
          });
        } else {
          res.json({
            operation: msgObject.failed,
            result: [],
            errorMsg: "Subcontractor Not Exist",
          });
        }
      }
    );
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: [],
      errorMsg: error,
    });
  }
});

// //create emp attendancd working

app.post("/create_emp_attendance", middlewareFunctions.checkAuth, (req, res) => {
  try {
    console.log("body: ", req.body);

    let temp_body = { ...req.body };
    console.log("tempdata", temp_body);

    let AttendanceModel = mongoSchemaModel.AttendanceModel(
      req.body.ATTENDANCE_ROOT_USERNAME
    );

    AttendanceModel.findOne(
      {
        ATTENDANCE_DATE_ID: temp_body.ATTENDANCE_DATE_ID,
        ATTENDANCE_EMPLOYEE_ID: temp_body.ATTENDANCE_EMPLOYEE_ID,
        ATTENDANCE_PROJECT_ID: temp_body.ATTENDANCE_PROJECT_ID,
      },
      (errAt, attendanceRecord) => {
        console.log(attendanceRecord);
        if (errAt) {
          res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: errAt,
          });
        } else {
          if (!attendanceRecord) {
            // Handle the case when there's no existing attendance record
            mongoSchemaModel.countermodel.findOneAndUpdate(
              { id: "autoval" },
              { $inc: { seq: 1 } },
              { new: true },
              (err, cd) => {
                console.log("counter value: ", cd);

                let seqId;
                if (cd == null) {
                  const newval = new mongoSchemaModel.countermodel({
                    id: "autoval",
                    seq: 1,
                  });
                  newval.save();
                  seqId = 1;
                } else {
                  seqId = cd.seq;
                }
                req.body.ATTENDANCE_ID = seqId;

                // Insert a new attendance record with "in" punch
                req.body.ATTENDANCE_IN = req.body.ATTENDANCE_IN;
                req.body.ATTENDANCE_OUT = ""; // Clear out "out" punch

                // Calculate total workhours
             
                const overtime= calculateOvertime(req.body);

                // Insert overtime into the request body
                req.body.ATTENDANCE_OVERTIME = overtime
                

                AttendanceModel.insertMany(req.body, (err, resp) => {
                  if (err)
                    res.json({
                      operation: msgObject.failed,
                      result: null,
                      errorMsg: err,
                    });
                  else {
                    updateEmployeeAttendanceStatus(req, res, "IN", req.body, overtime);
                  }
                });
              }
            );
          } else {
            if (attendanceRecord.ATTENDANCE_IN && !attendanceRecord.ATTENDANCE_OUT) {
              // Update the existing attendance record for the "out" punch
              AttendanceModel.findOneAndUpdate(
                { ATTENDANCE_ID: attendanceRecord.ATTENDANCE_ID },
                {
                  $set: {
                    ATTENDANCE_OUT: req.body.ATTENDANCE_OUT,
                    // Calculate overtime
                    ATTENDANCE_OVERTIME: calculateOvertime(req.body),
                  },
                },
                { new: true },
                (error, updatedAttendanceRecord) => {
                  if (error) {
                    res.json({
                      operation: msgObject.failed,
                      result: null,
                      errorMsg: error,
                    });
                  } else {
                    // Update overtime and employee attendance status
                    updateEmployeeAttendanceStatus(
                      req,
                      res,
                      "OUT",
                      updatedAttendanceRecord,
                      updatedAttendanceRecord.ATTENDANCE_OVERTIME,
                    
                      
                    );
                  }
                }
              );
            } else {
              res.json({
                operation: msgObject.failed,
                result: null,
                errorMsg: "Employee is not punched in for this project.",
              });
            }
          }
        }
      }
    );
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: null,
      errorMsg: error,
    });
  }
})

function calculateOvertime(attendanceRecord) {
  if (!attendanceRecord.ATTENDANCE_IN || !attendanceRecord.ATTENDANCE_OUT) {
    // No overtime if either in or out time is missing
    return 0;
  } else {
    // Calculate overtime in hours
    const inTime = moment(attendanceRecord.ATTENDANCE_IN, "HH:mm");
    const outTime = moment(attendanceRecord.ATTENDANCE_OUT, "HH:mm");
    const regularWorkingHours = 8; // Assuming 8 hours as regular working hours

    // Calculate the duration in hours
    const duration = moment.duration(outTime.diff(inTime));
    const workedHours = duration.asHours();

    // Calculate overtime
    const overtime = Math.max(0, workedHours - regularWorkingHours);

    return {overtime,workedHours}
    
  }
}
function updateEmployeeAttendanceStatus(req, res, punchType, attendanceRecord,overtime ){

  console.log(overtime);
  


  const ActualWorkingMoney = Number(attendanceRecord.ATTENDANCE_WORKING_PER_HOURS) * Number(overtime.workedHours);
  const OvertimeMoney = Number(attendanceRecord.ATTENDANCE_OVERTIME_WORKING_PER_HOURS) * Number(overtime.overtime);
 const totalwork = ActualWorkingMoney + OvertimeMoney
  // Update the employee's attendance status with total working hours and overtime
  let EmployeeModel = mongoSchemaModel.EmployeeModel(
    req.body.ATTENDANCE_ROOT_USERNAME
  );

  EmployeeModel.findOneAndUpdate(
    {
      EMPLOYEE_ID: req.body.ATTENDANCE_EMPLOYEE_ID,
      EMPLOYEE_USERNAME: req.body.ATTENDANCE_EMPLOYEE_USERNAME,
    },
    {
      $set: {
        EMPLOYEE_ATTENDANCE_STATUS: {
          date: attendanceRecord.ATTENDANCE_DATE_ID,
          [punchType]: true,
          PROJECT_ID: req.body.ATTENDANCE_PROJECT_ID,
          TOTAL_WORKING_HOURS:overtime.workedHours,
          OVERTIME: overtime.overtime,
          ActualWorkingMoney:ActualWorkingMoney,
         OvertimeMoney:OvertimeMoney,
         TotalMoneyGain:totalwork
          


        },
      },
    },
    { new: true },
    (emp_err, emp_x) => {
      console.log("emp_x: ", emp_x);
      if (emp_err) {
        res.json({
          operation: msgObject.failed,
          result: null,
          errorMsg: emp_err,
        });
      } else {
        res.json({
          operation: msgObject.success,
          result: attendanceRecord,
          errorMsg: null,
        });
      }
    }
  );
}

//get all attendance data

// // app.put('/get_employee_all_for_attendance1', middlewareFunctions.checkAuth, (req, res) => {
// //   try {
// //       const AttendanceModel = mongoSchemaModel.AttendanceModel(req.body.ATTENDANCE_ADMIN_USERNAME);

// //       AttendanceModel.find({
// //           ATTENDANCE_EMPLOYEE_USERNAME: req.body.ATTENDANCE_EMPLOYEE_USERNAME,
// //           ATTENDANCE_DATE_ID: {
// //               $gte: new Date(req.body.ATTENDANCE_START_DATE), // Convert to Date object
// //               $lte: new Date(req.body.ATTENDANCE_END_DATE)   // Convert to Date object
// //           }
// //       }, (error_attendance, x_attendance) => {
// //           if (error_attendance) {
// //               res.json({
// //                   operation: msgObject.failed,
// //                   result: [],
// //                   errorMsg: msgObject.invalid
// //               });
// //           } else {
// //               res.json({
// //                   operation: msgObject.success,
// //                   result: x_attendance,
// //                   errorMsg: null
// //               });
// //           }
// //       });
// //   } catch (error) {
// //       res.json({
// //           operation: msgObject.failed,
// //           result: [],
// //           errorMsg: error
// //       });
// //   }
// // });

app.get('/get_employee_all_for_attendance1', middlewareFunctions.checkAuth, (req, res) => {
  try {
      const AttendanceModel = mongoSchemaModel.AttendanceModel(req.query.ATTENDANCE_ROOT_USERNAME);

      const startDate = new Date(req.query.start_date);
      const endDate = new Date(req.query.end_date);

      AttendanceModel.find({
          ATTENDANCE_EMPLOYEE_USERNAME: req.query.ATTENDANCE_EMPLOYEE_USERNAME,
          ATTENDANCE_DATE_ID: {
              $gte: startDate,
              $lte: endDate
          }
      }, (error_attendance, x_attendance) => {
          if (error_attendance) {
              res.json({
                  operation: msgObject.failed,
                  result: [],
                  errorMsg: msgObject.invalid
              });
          } else {
              res.json({
                  operation: msgObject.success,
                  result: x_attendance,
                  errorMsg: null
              });
          }
      });
  } catch (error) {
      res.json({
          operation: msgObject.failed,
          result: [],
          errorMsg: error
      });
  }
});


// // check user exist or not
// //     try {
// //         const Users = mongoSchemaModel.AdminModel(req.body.ADMIN_USERNAME);
// //         const user = await Users.findOne({ ADMIN_USERNAME: req.body.ADMIN_USERNAME });

// //         if (!user) {
// //             mongoSchemaModel.countermodel.findOneAndUpdate(
// //                 { id: "autoval" },
// //                 { "$inc": { "seq": 1 } },
// //                 { new: true },
// //                 async (err, cd) => {
// //                     if (err) {
// //                         return res.json({
// //                             operation: msgObject.failed,
// //                             result: null,
// //                             errorMsg: err
// //                         });
// //                     }

// //                     let seqId;
// //                     if (!cd) {
// //                         const newval = new mongoSchemaModel.countermodel({ id: "autoval", seq: 1 });
// //                         await newval.save();
// //                         seqId = 1;
// //                     } else {
// //                         seqId = cd.seq;
// //                     }
// //                     req.body.ADMIN_ID = seqId;

// //                     const AdminModel = mongoSchemaModel.AdminModel(req.body.ADMIN_USERNAME);

// //                     // Insert the new admin user
// //                     try {
// //                         await AdminModel.insertMany(req.body);

// //                         // Send an email
// //                         const transporter = nodemailer.createTransport({
// //                             service: 'Gmail', // Use your email service
// //                             auth: {
// //                                 user: 'your_email@gmail.com', // Your email address
// //                                 pass: 'your_password' // Your email password or app password if enabled
// //                             }
// //                         });

// //                         const mailOptions = {
// //                             from: 'your_email@gmail.com', // Your email address
// //                             to: req.body.ADMIN_EMAIL, // Email address of the new admin
// //                             subject: 'Welcome to Your App',
// //                             text: 'Congratulations, your admin account has been created!'
// //                         };

// //                         transporter.sendMail(mailOptions, (error, info) => {
// //                             if (error) {
// //                                 console.error('Error sending email: ', error);
// //                             } else {
// //                                 console.log('Email sent: ' + info.response);
// //                             }
// //                         });

// //                         res.json({
// //                             operation: msgObject.success,
// //                             result: response,
// //                             errorMsg: null
// //                         });
// //                     } catch (error) {
// //                         res.json({
// //                             operation: msgObject.failed,
// //                             result: null,
// //                             errorMsg: error
// //                         });
// //                     }
// //                 }
// //             );
// //         } else {
// //             res.status(400).json({
// //                 error: "User Already exists"
// //             });
// //         }
// //     } catch (error) {
// //         res.json({
// //             operation: msgObject.failed,
// //             result: null,
// //             errorMsg: error
// //         });
// //     }
// // });

app.post('/check_user', middlewareFunctions.checkAuth, middlewareFunctions.verifying, async (req, res) => {
  try {
      const Users = mongoSchemaModel.RootModel(req.body.ROOT_USERNAME);
      const user = await Users.findOne({ ROOT_USERNAME: req.body.ROOT_USERNAME });

      if (user) {
          // User does not exist
          res.json({
              exists: true,
              message: "User does not exist",
          });
      } else {
          // User already exists
          res.json({
              exists:false,
              message: "User already exists",
          });
      }
  } catch (error) {
      res.json({
          operation: msgObject.failed,
          result: null,
          errorMsg: error,
      });
  }
});

//create admin not working

// app.post('/create_admin1', middlewareFunctions.checkAuth, middlewareFunctions.verifying, async (req, res) => {
//     try {
//         const Users = mongoSchemaModel.AdminModel(req.body.ADMIN_USERNAME);
//         const user = await Users.findOne({ ADMIN_USERNAME: req.body.ADMIN_USERNAME });

//         if (!user) {
//             mongoSchemaModel.countermodel.findOneAndUpdate(
//                 { id: "autoval" },
//                 { "$inc": { "seq": 1 } },
//                 { new: true },
//                 async (err, cd) => {
//                     if (err) {
//                         return res.json({
//                             operation: msgObject.failed,
//                             result: null,
//                             errorMsg: err
//                         });
//                     }

//                     let seqId;
//                     if (!cd) {
//                         const newval = new mongoSchemaModel.countermodel({ id: "autoval", seq: 1 });
//                         await newval.save();
//                         seqId = 1;
//                     } else {
//                         seqId = cd.seq;
//                     }
//                     req.body.ADMIN_ID = seqId;

//                     const AdminModel = mongoSchemaModel.AdminModel(req.body.ADMIN_USERNAME);

//                     // Insert the new admin user
//                     try {
//                         await AdminModel.insertMany(req.body);

//                         // Send an email
//                         const transporter = nodemailer.createTransport({
//                             service: 'Gmail', 
//                             auth: {
//                                 user: 'your_email@gmail.com', 
//                                 pass: 'your_password' 
//                             }
//                         });

//                         const mailOptions = {
//                             from: "viveksnh933@gmail.cm", // Your email addres
//                             to: req.body.ADMIN_EMAIL, // Email address of the new admin
//                             subject: 'Welcome to Your App',
//                             text: 'Congratulations, your admin account has been created!'
//                         };

//                         transporter.sendMail(mailOptions, (error, info) => {
//                             if (error) {
//                                 console.error('Error sending email: ', error);
//                             } else {
//                                 console.log('Email sent: ' + info.response);
//                             }
//                         });

//                         res.json({
//                             operation: msgObject.success,
//                             result: response,
//                             errorMsg: null
//                         });
//                     } catch (error) {
//                         res.json({
//                             operation: msgObject.failed,
//                             result: null,
//                             errorMsg: error
//                         });
//                     }
//                 }
//             );
//         } else {
//             res.status(400).json({
//                 error: "User Already exists"
//             });
//         }
//     } catch (error) {
//         res.json({
//             operation: msgObject.failed,
//             result: null,
//             errorMsg: error
//         });
//     }
// });
//   // bankDEtail post
  
app.post("/bankDetail",(req,res)=> {
  try{
    const tempBody = {...req.body};
    console.log("tempbody:",tempBody);
    let BankModel= mongoSchemaModel.BankModel(
      req.body.BANK_ROOT_USERNAME
    );
    BankModel.find(
      {
        BANK_DATE: tempBody.BANK_DATE,
       BANK_ACCOUNT_NUMBER:tempBody.BANK_ACCOUNT_NUMBER,
       BANK_EMPLOYEE_ID:tempBody.BANK_EMPLOYEE_ID
      },
      (errAt, x) => {
        console.log(x);
        if (errAt)
          res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: errAt,
          });
        else {
          console.log("x : ", x);
          let EmployeeModel = mongoSchemaModel.EmployeeModel(
            req.body.BANK_ROOT_USERNAME,
    );
  
     
          if (x.length > 0) {
            BankModel.findOneAndUpdate(
              {BANK_ID:x[0].BANK_ID},
            
              {
                $set :{
                  AccountNo:req.body.BANK_ACCOUNT_NUMBER,
                  },
              },
              { new: true },
              (error, re) => {
                console.log("re : ", re);
                if (error)
                  res.json({
                    operation: msgObject.failed,
                    result: null,
                    errorMsg: error,
                  });
                else {
                  EmployeeModel.findOneAndUpdate(
                    {
                      EMPLOYEE_ID: req.body.BANK_EMPLOYEE_ID,
                      EMPLOYEE_USERNAME:
                        req.body.BANK_EMPLOYEE_USERNAME
                    },
                    {
                      $set: {
                        EmployeeBankDetail: {
                          date:req.body.BANK_DATE,
                          AccountNo:req.body.BANK_ACCOUNT_NUMBER,
                          Name:req.body.BANK_EMPLOYEE_USERNAME,
                          BankAchStatus:req.body.BANK_ACH_STATUS,
                          BankName:req.body.BANK_NAME,
                          BankVerify:req.body.BANK_VERIFY,
                          BankCheckNO:req.body.BANK_CHEQUE_NUMBER
                        },
                      },
                    },
                    { new: true },
                    (emp_err, emp_x) => {
                      console.log("emp_x : ", emp_x);
                      if (emp_err)
                        res.json({
                          operation: msgObject.failed,
                          result: null,
                          errorMsg: emp_err,
                        });
                      else
                        res.json({
                          operation: msgObject.success,
                          result: re,
                          errorMsg: null,
                        });
                    }
                  );
                }
              }
            );
          } else {
            mongoSchemaModel.countermodel.findOneAndUpdate(
              { id: "autoval" },
              { $inc: { seq: 1 } },
              { new: true },
              (err, cd) => {
                console.log("counter value : ", cd);

                let seqId;
                if (cd == null) {
                  const newval = new mongoSchemaModel.countermodel({
                    id: "autoval",
                    seq: 1,
                  });
                  newval.save();
                  seqId = 1;
                } else {
                  seqId = cd.seq;
                }
                req.body.BankID= cd.seq;

              BankModel.insertMany(req.body, (err, resp) => {
                  if (err)
                    res.json({
                      operation: msgObject.failed,
                      result: null,
                      errorMsg: err,
                    });
             
                });
              }
            );
          }
        }
      }
      
 
    )

     
  }
  catch(error){
    res.json({
      operation: msgObject.failed,
      result: null,
      errorMsg: error,
    });
  }

})

// get all bank data by employee

app.put("/getallbankdetailofemployee",(req,res)=> {
  try {
    let RootModel = mongoSchemaModel.RootModelModel(
      req.body.BANK_ROOT_USERNAME
    );

    RootModel.find(
      {
        ROOT_USERNAME: req.body.BANK_ROOT_USERNAME,
        ROOT_ID: req.body.BANK_ROOT_ID,
      },
      (err, x) => {
        // console.log("employee data : ", x)
        if (x.length == 1) {
          const AttendanceModel = mongoSchemaModel.BankModel(
            req.body.BANK_ROOT_USERNAME
          );

          AttendanceModel.find({}, (errorcontract, recontract) => {
            if (errorcontract)
              res.json({
                operation: msgObject.failed,
                result: recontract,
                errorMsg: msgObject.invalid,
              });
            else if (recontract.length > 0) {
              res.json({
                operation: msgObject.success,
                result: recontract,
                errorMsg: [],
              });
            } else {
              res.json({
                operation: msgObject.failed,
                result: [],
                errorMsg: msgObject.invalid,
              });
            }
          });
        } else {
          res.json({
            operation: msgObject.failed,
            result: x,
            errorMsg: msgObject.invalid,
          });
        }
      }
    );
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: [],
      errorMsg: error,
    });
  }

})

// get one bank detail

app.put("/getonebankdetail", (req, res) => {
  try {
    let RootModel = mongoSchemaModel.RootModel(
      req.body.BANK_ROOT_USERNAME
    );

    RootModel.find(
      {
        ROOT_USERNAME: req.body.BANK_ROOT_USERNAME,
        ROOT_ID: req.body.BANK_ROOT_ID,
      },
      (err, x) => {
        if (x.length === 1) {
          const BankModel = mongoSchemaModel.BankModel(
            req.body.BANK_ROOT_USERNAME
          );

          // Extract the bankName from the request body
          const BANK_NAME = req.body.BANK_NAME;

          // Query the database for bank records with the specified name
          BankModel.find({ BANK_NAME: BANK_NAME }, (error, result) => {
            if (error) {
              res.json({
                operation: msgObject.failed,
                result: [],
                errorMsg: error,
              });
            } else if (result.length > 0) {
              res.json({
                operation: msgObject.success,
                result: result,
                errorMsg: [],
              });
            } else {
              res.json({
                operation: msgObject.failed,
                result: [],
                errorMsg: msgObject.invalid,
              });
            }
          });
        } else {
          res.json({
            operation: msgObject.failed,
            result: x,
            errorMsg: msgObject.invalid,
          });
        }
      }
    );
  } catch (error) {
    res.json({
      operation: msgObject.failed,
      result: [],
      errorMsg: error,
    });
  }
});


//check user exist or not only;






let PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server Running on => `, PORT);
});








