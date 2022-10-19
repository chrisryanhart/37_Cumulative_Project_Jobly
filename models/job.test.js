"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// *************************** create job *************

describe("create new job", function () {

    const newJob = {"title":'SW Dev', "salary":10000, "equity":0, "companyHandle": "c1"}
  
    test("works", async function () {
      expect.assertions(2);

      let job = await Job.create(newJob);
      expect(job).toEqual(expect.objectContaining({"title":'SW Dev', "salary":10000, "company_handle": "c1"}));
  
      const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
             FROM jobs
             WHERE title='SW Dev'`);
      expect(result.rows[0]).toEqual(expect.objectContaining(
        {
          title: "SW Dev",
          salary: 10000,
          equity: "0",
          company_handle: "c1"          
        })
      );
    }, 100000);

    test("bad request with dupe", async function () {
      try {
        await Job.create(newJob);
        await Job.create(newJob);
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    },1000000);
});

// ************************** findAll jobs **********************

describe("findAll", function () {
  test("works: no filter", async function () {
    expect.assertions(3);

    let jobs = await Job.findAll();
    expect(jobs[0]).toEqual(expect.objectContaining(
      {title: 'Fullstack Dev', salary: 30000, equity: '0', companyHandle: 'c1'}
    ));
    expect(jobs[1]).toEqual(expect.objectContaining(
      {title: 'Mech Eng', salary: 50000, equity: '0', companyHandle: 'c2'}
    ));
    expect(jobs[2]).toEqual(expect.objectContaining(
      {title: 'Guitarist', salary: 35000, equity: '0', companyHandle: 'c3'}
    ));
  });
});

describe("get", function () {
  test("works", async function () {
    // first query db for id
    let idRes = await db.query(
        `SELECT id
         FROM jobs
         LIMIT 1`);
    let id = idRes.rows[0].id;

    let job = await Job.get(id);
    expect(job).toEqual({id:id,title:'Fullstack Dev',salary:30000,equity:'0',companyHandle:'c1'});
  });

});

describe("update", function () {
  const updateData = {
    title: "Updated",
    salary: 1,
    equity: "0.02"
  };

  test("works", async function () {
    // retrieve id first
    let idRes = await db.query(
      `SELECT id
       FROM jobs
       LIMIT 1`);
    let id = idRes.rows[0].id;

    let job = await Job.update(id, updateData);
    expect(job).toEqual(expect.objectContaining({
      id: id,
      ...updateData
    }));

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${id}`);
    expect(result.rows[0]).toEqual({id:id,title:'Updated',salary:1,equity:'0.02',company_handle:'c1'});
  });
});


// Remove completed

describe("remove", function () {
  test("works", async function () {
    let idRes = await db.query(
      `SELECT id
       FROM jobs
       LIMIT 1`);
    let id = idRes.rows[0].id;

    await Job.remove(id);
    const res = await db.query(
        `SELECT id FROM jobs WHERE id=${id}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      throw new ExpressError('Test should not reach this point');
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
},500000);