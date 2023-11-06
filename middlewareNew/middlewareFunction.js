const mongoose = require('../db/mongo_connection')
const mongoSchemaModel = require('../modelsNew/schema')
require("dotenv").config();
const Schema = mongoose.Schema;
const msgObject = require('../responseMsg.json')


module.exports = middlewareFunctions = {
    checkAuth: (req, res, next) => {
        try {
            console.log("header : ", req.headers.authorization_key)
            if (req.headers.authorization_key == process.env.API_KEY) {
                next()
            } else {
                res.json({
                    operation: msgObject.failed,
                    result: null,
                    errorMsg: 'Invaild User'
                })
            }
        } catch (error) {
            res.json({
                operation: msgObject.failed,
                result: null,
                errorMsg: error
            })
        }

    },

    verifying: (req, res, next) => {
        try {
            console.log('verifying : ', req.body)
            let RootModel = mongoSchemaModel.RootModel(req.body.ROOT_USERNAME)
            RootModel .find({}, (err, x) => {
                console.log("user data : ", x)
                if (x.length > 0) {
                    res.json({
                        operation: msgObject.failed,
                        result: x,
                        errorMsg: msgObject.userAlreadyExist
                    })
                } else {

                    next()
                }
            }).limit(2)

        } catch (error) {
            console.log("error : ", error)
            res.json({
                operation: msgObject.failed,
                result: null,
                errorMsg: error
            })
        }
    },

    vaildateMember: (req, res, next) => {
        try {
            console.log('vaildateMember : ', req.body)
            let RootModel = mongoSchemaModel.RootModel(req.body.COMPANY_ROOT_USERNAME);
            console.log(RootModel);

            RootModel.find({ ROOT_USERNAME: req.body.COMPANY_ROOT_USERNAME, ROOT_ID: req.body.COMPANY_ROOT_ID }, (err, x) => {
                console.log("user data : ", x)
                if (x.length == 1) {
                    const CompanyModel = mongoSchemaModel.CompanyModel(req.body.COMPANY_ROOT_USERNAME)

                    CompanyModel.find({ COMPANY_USERNAME: req.body.EMPLOYEE_USERNAME }, (error, re) => {
                        if (re.length > 0) {
                            res.json({
                                operation: msgObject.failed,
                                result: x,
                                errorMsg: msgObject.memberAlreadyExist
                            })
                        } else {

                            next()
                        }
                    })
                } else {
                    res.json({
                        operation: msgObject.failed,
                        result: x,
                        errorMsg: msgObject.invalid
                    })

                }
            })
        } catch (error) {
            res.json({
                operation: msgObject.failed,
                result: null,
                errorMsg: error
            })
        }
    },

    vaildateEmpAttendance: (req, res, next) => {
        try {
            console.log('vaildateEmpAttendance : ', req.body, msgObject)
            let RootModel = mongoSchemaModel.RootModel(req.body.EMPLOYEE_MEMBER_PARENT_USERNAME)

            RootModel.find({ ROOT_USERNAME: req.body.EMPLOYEE_ROOT_USERNAME, ROOT_ID: req.body.EMPLOYEE_ROOT_ID }, (err, x) => {
                console.log("user data : ", x)
                if (x.length == 1) {
                    const EmployeeModel = mongoSchemaModel.EmployeeModel(req.body.EMPLOYEE_COMPANY_USERNAME)

                    EmployeeModel.find({ EMPLOYEE_USERNAME: req.body.EMPLOYEE_USERNAME }, (error, re) => {
                        if (re.length > 0) {
                            res.json({
                                operation: msgObject.failed,
                                result: x,
                                errorMsg: msgObject.memberAlreadyExist
                            })
                        } else {

                            next()
                        }
                    })
                } else {
                    res.json({
                        operation: msgObject.failed,
                        result: x,
                        errorMsg: msgObject.invalid
                    })

                }
            })
        } catch (error) {
            res.json({
                operation: msgObject.failed,
                result: null,
                errorMsg: error
            })
        }
    },

    vaildateClient: (req, res, next) => {
        try {
            console.log('vaildateClient : ', req.body, msgObject)
            let RootModels = mongoSchemaModel.RootModel(req.body.EMPLOYEE_ROOT_USERNAME)
          

            RootModels.find({ROOT_USERNAME: req.body.EMPLOYEE_ROOT_USERNAME, ROOT_ID: req.body.EMPLOYEE_ROOT_ID }, (err, x) => {
                console.log("user data : ", x)
                if (err) res.json({
                    operation: msgObject.failed,
                    result: null,
                    errorMsg: err
                })
                else if (x.length == 1) {
                    let CompanyModels = mongoSchemaModel.CompanyModel(req.body.EMPLOYEE_ROOT_USERNAME);
                   
                    CompanyModels.find({ COMPANY_USERNAME: req.body.EMPLOYEE_COMPANY_USERNAME, COMPANY_IDMPANY_ID: req.body.EMPLOYEE_COMPANY_ID }, (errMember, resMember) => {
                        console.log("companymodel : ", resMember,errMember)
                        if (errMember) res.json({
                            operation: msgObject.failed,
                            result: null,
                            errorMsg: err
                        })
                        else if (resMember.length > 0) {
                            let EmployeeModels = mongoSchemaModel.EmployeeModel(req.body.EMPLOYEE_ROOT_USERNAME)
                            EmployeeModels.find({ EMPLOYEE_USERNAME: req.body.EMPLOYEE_USERNAME }, (errorClient, resClient) => {
                                console.log("EmployeeModel : ", resClient)

                                if (errorClient) res.json({
                                    operation: msgObject.failed,
                                    result: null,
                                    errorMsg: errorClient
                                })
                                if (resClient.length > 0) {
                                    // if(!res.headersSent) res.set('Content-Type', 'application/json');
                                    res.json({
                                        operation: msgObject.failed,
                                        result: x,
                                        errorMsg: msgObject.clinetAlreadyExist
                                    })
                                } else {

                                    next()
                                }
                            })


                        } else {
                            res.json({
                                operation: msgObject.failed,
                                result: x,
                                errorMsg: msgObject.invalid
                            })

                        }
                    })


                } else {
                    res.json({
                        operation: msgObject.failed,
                        result: x,
                        errorMsg: msgObject.invalid
                    })

                }
            })
        } catch (error) {
            res.json({
                operation: msgObject.failed,
                result: null,
                errorMsg: error
            })
        }
    },

    vaildateProject: (req, res, next) => {
        try {
            console.log('vaildateClient : ', req.body, msgObject,)
            let AdminModel = mongoSchemaModel.RootModel(req.body.PROJECT_ROOT_USERNAME)

            AdminModel.find({ ROOT_USERNAME: req.body.PROJECT_ROOT_USERNAME, ROOT_ID: req.body.PROJECT_ROOT_ID }, (err, x) => {
                console.log("user data : ", x)
                if (err) res.json({
                    operation: msgObject.failed,
                    result: null,
                    errorMsg: err
                })
                else if (x.length == 1) {
                    let CompanyModel = mongoSchemaModel.CompanyModel(req.body.PROJECT_ROOT_USERNAME)
                    CompanyModel.find({ COMPANY_USERNAME: req.body.PROJECT_COMPANY_USERNAME, COMPANY_ID: req.body.PROJECT_COMPANY_ID }, (errMember, resMember) => {
                        console.log("companymodel : ", resMember,errMember)
                        if (errMember) res.json({
                            operation: msgObject.failed,
                            result: null,
                            errorMsg: err
                        })
                        else if (resMember.length > 0) {
                            let ProjectModel = mongoSchemaModel.ProjectModel(req.body.PROJECT_ROOT_USERNAME)
                            ProjectModel.find({ PROJECT_USERNAME: req.body.PROJECT_USERNAME }, (errorClient, resClient) => {
                                console.log("EmployeeModel : ", resClient)

                                if (errorClient) res.json({
                                    operation: msgObject.failed,
                                    result: null,
                                    errorMsg: errorClient
                                })
                                if (resClient.length > 0) {
                                    // if(!res.headersSent) res.set('Content-Type', 'application/json');
                                    res.json({
                                        operation: msgObject.failed,
                                        result: x,
                                        errorMsg: msgObject.ProjectExists
                                    })
                                } else {

                                    next()
                                }
                            })


                        } else {
                            res.json({
                                operation: msgObject.failed,
                                result: x,
                                errorMsg: msgObject.invalid
                            })

                        }
                    })


                } else {
                    res.json({
                        operation: msgObject.failed,
                        result: x,
                        errorMsg: msgObject.invalid
                    })

                }
            })
        } catch (error) {
            res.json({
                operation: msgObject.failed,
                result: null,
                errorMsg: error
            })
        }
    },

    // vaildateSubContractor: (req, res, next) => {
    //     try {
    //         console.log('vaildatesubContractor : ', req.body, msgObject)
    //         let RootModel = mongoSchemaModel.RootModel(req.body.EMPLOYEE_ROOT_USERNAME)

    //         RootModel.find({ ROOT_USERNAME: req.body.EMPLOYEE_ROOT_USERNAME, ROOT_ID: req.body.EMPLOYEE_ROOT_ID }, (err, x) => {
    //             console.log("user data : ", x)
    //             if (err) res.json({
    //                 operation: msgObject.failed,
    //                 result: null,
    //                 errorMsg: err
    //             })
    //             else if (x.length == 1) {
    //                 let CompanyModel = mongoSchemaModel.CompanyModel(req.body.EMPLOYEE_ROOT_USERNAME)
    //                 CompanyModel.find({ COMPANY_USERNAME: req.body.EMPLOYEE_COMPANY_USERNAME, COMPANY_ID: req.body.EMPLOYEE_COMPANY_ID }, (errMember, resMember) => {
    //                     console.log("companymodel : ", resMember,errMember)
    //                     if (errMember) res.json({
    //                         operation: msgObject.failed,
    //                         result: null,
    //                         errorMsg: err
    //                     })
    //                     else if (resMember.length > 0) {
    //                         let EmployeeModel = mongoSchemaModel.EmployeeModel(req.body.EMPLOYEE_ROOT_USERNAME)
    //                         EmployeeModel.find({ EMPLOYEE_USERNAME: req.body.EMPLOYEE_USERNAME }, (errorClient, resClient) => {
    //                             console.log("EmployeeModel : ", resClient)

    //                             if (errorClient) res.json({
    //                                 operation: msgObject.failed,
    //                                 result: null,
    //                                 errorMsg: errorClient
    //                             })
    //                             if (resClient.length > 0) {
    //                                 // if(!res.headersSent) res.set('Content-Type', 'application/json');
    //                                 res.json({
    //                                     operation: msgObject.failed,
    //                                     result: x,
    //                                     errorMsg: msgObject.clinetAlreadyExist
    //                                 })
    //                             } else {

    //                                 next()
    //                             }
    //                         })


    //                     } else {
    //                         res.json({
    //                             operation: msgObject.failed,
    //                             result: x,
    //                             errorMsg: msgObject.invalid
    //                         })

    //                     }
    //                 })


    //             } else {
    //                 res.json({
    //                     operation: msgObject.failed,
    //                     result: x,
    //                     errorMsg: msgObject.invalid
    //                 })

    //             }
    //         })
    //     } catch (error) {
    //         res.json({
    //             operation: msgObject.failed,
    //             result: null,
    //             errorMsg: error
    //         })
    //     }
    // },

    vaildateSubContractor: (req, res, next) => {
        try {
            console.log('vaildateClient : ', req.body, msgObject)
            let RootModel = mongoSchemaModel.RootModel(req.body.SUBCONTRACTOR_ROOT_USERNAME)

            RootModel.find({ ROOT_USERNAME: req.body.SUBCONTRACTOR_ROOT_USERNAME, ROOT_ID: req.body.SUBCONTRACTOR_ROOT_ID }, (err, x) => {
                console.log("user data : ", x)
                if (err) res.json({
                    operation: msgObject.failed,
                    result: null,
                    errorMsg: err
                })
                else if (x.length == 1) {
                    let CompanyModel = mongoSchemaModel.CompanyModel(req.body.SUBCONTRACTOR_ROOT_USERNAME)
                    CompanyModel.find({ COMPANY_USERNAME: req.body.SUBCONTRACTOR_COMPANY_USERNAME, COMPANY_ID: req.body.SUBCONTRACTOR_COMPANY_ID }, (errMember, resMember) => {
                        console.log("companymodel : ", resMember,errMember)
                        if (errMember) res.json({
                            operation: msgObject.failed,
                            result: null,
                            errorMsg: err
                        })
                        else if (resMember.length > 0) {
                            let SubContractorModel = mongoSchemaModel.SubContractorModel(req.body.SUBCONTRACTOR_ROOT_USERNAME)
                            SubContractorModel.find({ SUBCONTRACTOR_USERNAME: req.body.SUBCONTRACTOR_USERNAME }, (errorClient, resClient) => {
                                console.log("EmployeeModel : ", resClient)

                                if (errorClient) res.json({
                                    operation: msgObject.failed,
                                    result: null,
                                    errorMsg: errorClient
                                })
                                if (resClient.length > 0) {
                                    // if(!res.headersSent) res.set('Content-Type', 'application/json');
                                    res.json({
                                        operation: msgObject.failed,
                                        result: x,
                                        errorMsg: msgObject.clinetAlreadyExist
                                    })
                                } else {

                                    next()
                                }
                            })


                        } else {
                            res.json({
                                operation: msgObject.failed,
                                result: x,
                                errorMsg: msgObject.invalid
                            })

                        }
                    })


                } else {
                    res.json({
                        operation: msgObject.failed,
                        result: x,
                        errorMsg: msgObject.invalid
                    })

                }
            })
        } catch (error) {
            res.json({
                operation: msgObject.failed,
                result: null,
                errorMsg: error
            })
        }
    },
    vaildateEmployeeSubContractor: (req, res, next) => {
        try {
            console.log('vaildateClient : ', req.body, msgObject)
            let RootModel = mongoSchemaModel.RootModel(req.body.SUBCONTRACTOR__EMPLOYEE_COMPANY_ROOT_USERNAME)

            RootModel.find({ ROOT_USERNAME: req.body.SUBCONTRACTOR_EMPLOYEE_ROOT_USERNAME, ROOT_ID: req.body.SUBCONTRACTOR_EMPLOYEE_ROOT_ID }, (err, x) => {
                console.log("user data : ", x)
                if (err) res.json({
                    operation: msgObject.failed,
                    result: null,
                    errorMsg: err
                })
                else if (x.length == 1) {
                    let SubcontractorModel = mongoSchemaModel.SubContractorModel(req.body.SUBCONTRACTOR_EMPLOYEE_ROOT_USERNAME)
                    SubcontractorModel.find({ SUBCONTRACTOR_COMPANY_USERNAME: req.body.SUBCONTRACTOR_EMPLOYEE_COMPANY_USERNAME, COMPANY_ID: req.body.SUBCONTRACTOR_EMPLOYEE_COMPANY_ID }, (errMember, resMember) => {
                        console.log("companymodel : ", resMember,errMember)
                        if (errMember) res.json({
                            operation: msgObject.failed,
                            result: null,
                            errorMsg: err
                        })
                        else if (resMember.length > 0) {
                            let SubempContractorModel = mongoSchemaModel.SubContractorEmployeeModel(req.body.SUBCONTRACTOR_EMPLOYEE_ROOT_USERNAME)
                            SubempContractorModel.find({ SUBCONTRACTOR_COMPANY_USERNAME: req.body.SUBCONTRACTOR_COMPANY_USERNAME }, (errorClient, resClient) => {
                                console.log("EmployeeModel : ", resClient)

                                if (errorClient) res.json({
                                    operation: msgObject.failed,
                                    result: null,
                                    errorMsg: errorClient
                                })
                                if (resClient.length > 0) {
                                    // if(!res.headersSent) res.set('Content-Type', 'application/json');
                                    res.json({
                                        operation: msgObject.failed,
                                        result: x,
                                        errorMsg: msgObject.clinetAlreadyExist
                                    })
                                } else {

                                    next()
                                }
                            })


                        } else {
                            res.json({
                                operation: msgObject.failed,
                                result: x,
                                errorMsg: msgObject.invalid
                            })

                        }
                    })


                } else {
                    res.json({
                        operation: msgObject.failed,
                        result: x,
                        errorMsg: msgObject.invalid
                    })

                }
            })
        } catch (error) {
            res.json({
                operation: msgObject.failed,
                result: null,
                errorMsg: error
            })
        }
    },

    // vaildateSubContractor : (req, res, next) => {
    //     try {
    //       console.log('vaildateClient : ', req.body, msgObject);
      
    //       let RootModel = new mongoSchemaModel.RootModel({
    //         ROOT_USERNAME: req.body.SUBCONTRACTOR_ROOT_USERNAME,
    //         ROOT_ID: req.body.SUBCONTRACTOR_ROOT_ID,
    //       });
      
    //       RootModel.find((err, x) => {
    //         console.log("user data : ", x);
      
    //         if (err) {
    //           return res.json({
    //             operation: msgObject.failed,
    //             result: null,
    //             errorMsg: err,
    //           });
    //         }
      
    //         if (x.length === 1) {
    //           let CompanyModel = new mongoSchemaModel.CompanyModel({
    //             COMPANY_USERNAME: req.body.SUBCONTRACTOR_COMPANY_USERNAME,
    //             COMPANY_ID: req.body.SUBCONTRACTOR_COMPANY_ID,
    //           });
      
    //           CompanyModel.find((errMember, resMember) => {
    //             console.log("companymodel : ", resMember, errMember);
      
    //             if (errMember) {
    //               return res.json({
    //                 operation: msgObject.failed,
    //                 result: null,
    //                 errorMsg: errMember,
    //               });
    //             }
      
    //             if (resMember.length > 0) {
    //               let SubContractorModel = new mongoSchemaModel.SubContractorModel({
    //                 SUBCONTRACTOR_USERNAME: req.body.SUBCONTRACTOR_USERNAME,
    //               });
      
    //               SubContractorModel.find((errorClient, resClient) => {
    //                 console.log("EmployeeModel : ", resClient);
      
    //                 if (errorClient) {
    //                   return res.json({
    //                     operation: msgObject.failed,
    //                     result: null,
    //                     errorMsg: errorClient,
    //                   });
    //                 }
      
    //                 if (resClient.length > 0) {
    //                   return res.json({
    //                     operation: msgObject.failed,
    //                     result: x,
    //                     errorMsg: msgObject.clientAlreadyExist,
    //                   });
    //                 } else {
    //                   next();
    //                 }
    //               });
    //             } else {
    //               return res.json({
    //                 operation: msgObject.failed,
    //                 result: x,
    //                 errorMsg: msgObject.invalid,
    //               });
    //             }
    //           });
    //         } else {
    //           return res.json({
    //             operation: msgObject.failed,
    //             result: x,
    //             errorMsg: msgObject.invalid,
    //           });
    //         }
    //       });
    //     } catch (error) {
    //       return res.json({
    //         operation: msgObject.failed,
    //         result: null,
    //         errorMsg: error,
    //       });
    //     }
    //   },
      

    
    
}