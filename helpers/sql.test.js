"use strict";
const { sqlForPartialUpdate } = require("./sql.js");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

// Tests sqlForParitialUpdate

describe("Convert input data for update to sql format", function () {
    test("successfully convert data", function () {
        // good format
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