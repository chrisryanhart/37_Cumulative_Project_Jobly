"use strict";
const { sqlForPartialUpdate, sqlForFilteredCompanies, sqlForFilteredJobs } = require("./sql.js");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

// Tests sqlForParitialUpdate

describe("Convert input data for update to sql format", function () {
    test("successfully convert data", function () {
        const twoWordKeys =        {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
          }

        const updateData = {
            name: "New",
            description: "New Description",
            numEmployees: 10,
            logoUrl: "http://new.img",
          }

        const res = sqlForPartialUpdate(updateData,twoWordKeys);
       
        expect(res.setCols).toEqual('"name"=$1, "description"=$2, "num_employees"=$3, "logo_url"=$4');
        expect(res.values).toEqual(['New', 'New Description', 10, 'http://new.img']);
    });
    test("Error: no data present", function () {
        // bad format
        try {
            const twoWordKeys =        {
                numEmployees: "num_employees",
                logoUrl: "logo_url",
              }
            const noUpdateData = {}  
    
            const res = sqlForPartialUpdate(noUpdateData,twoWordKeys);
    
        } catch(err){
            expect(err.status).toEqual(400);
        }
    });
});

// Tests translating filtered company query sql format
describe("Convert input data for SQL to filter companies", function () {
  test("successfully convert data", function () {
      const twoWordKeys = {minEmployees:"num_employees",maxEmployees:"num_employees"};

      const filterData = {
          name: "New",
          numEmployees: 10,
          maxEmployees: 11
        }

      const res = sqlForFilteredCompanies(filterData,twoWordKeys);
     
      expect(res.setCols).toEqual('LOWER (companies.name) LIKE $1 AND LOWER (companies.name) LIKE $2 AND "num_employees"<=$3');
      expect(res.values).toEqual(['%New%', 10, 11]);
  });

  test("error: no data parameter provided", function () {
    try{
      const twoWordKeys = {minEmployees:"num_employees",maxEmployees:"num_employees"};

      const filterData = {}
  
      const res = sqlForFilteredCompanies(filterData,twoWordKeys);
  
    }catch(err){
      expect(err.message).toEqual('No data');
      expect(err.status).toEqual(400);
    }
   
});


});


describe("Convert input data for SQL to filter jobs", function () {
  test("successfully convert data", function () {
      const colNameTranslation = {minSalary:"salary",hasEquity:"equity"};

      const filterData = {
          title: "New",
          minSalary: 30000,
          hasEquity: true
        }

      const res = sqlForFilteredJobs(filterData,colNameTranslation);
     
      expect(res.setCols).toEqual('LOWER (jobs.title) LIKE $1 AND "salary">=$2 AND "equity">$3');
      expect(res.values).toEqual(['%New%', 30000, 0]);
  });

  test("error: no data parameter provided", function () {
    try{
      const twoWordKeys = {minSalary:"salary",hasEquity:"equity"};

      const filterData = {}
  
      const res = sqlForFilteredJobs(filterData,twoWordKeys);
  
    }catch(err){
      expect(err.message).toEqual('No data');
      expect(err.status).toEqual(400);
    }
   
  });


});