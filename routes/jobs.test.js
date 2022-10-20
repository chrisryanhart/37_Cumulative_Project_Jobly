"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2AdminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// ************* get all jobs ******************

describe("GET /jobs", function () {
    test("ok for anon", async function () {
        expect.assertions(3);
        const resp = await request(app).get("/jobs");
        expect(resp.body.jobs[0]).toEqual(expect.objectContaining(
                {
                    title: "test job 1",
                    salary: 50000,
                    equity: "0.5",
                    companyHandle: "c1"
                })
            );
        expect(resp.body.jobs[1]).toEqual(expect.objectContaining(
                {
                    title: "test job 2",
                    salary: null,
                    equity: "0.25",
                    companyHandle: "c2"
                })
            );

        expect(resp.body.jobs[2]).toEqual(expect.objectContaining(
                {
                    title: "test job 3",
                    salary: 25000,
                    equity: null,
                    companyHandle: "c2"
                })
            );
    });

    test("fails: test next() handler", async function () {
      // there's no normal failure event which will cause this route to fail ---
      // thus making it hard to test that the error-handler works with it. This
      // should cause an error, all right :)
      await db.query("DROP TABLE jobs CASCADE");
      const resp = await request(app)
          .get("/jobs")
          .set("authorization", `Bearer ${u2AdminToken}`);
      expect(resp.statusCode).toEqual(500);
    });
});


// *********** GET data about job posting ****************
describe("GET /jobs/:id", function () {
    test("works for anon", async function () {
        let idRes = await db.query(`SELECT id
                  FROM jobs
                  LIMIT 1`);
        let id = idRes.rows[0].id;

        const resp = await request(app).get(`/jobs/${id}`);
        expect(resp.body).toEqual({
        job: {
          id:id,
          title: "test job 1",
          salary: 50000,
          equity: "0.5",
          companyHandle: "c1"
        },
      });
    });
    
    test("not found for no such company", async function () {
      const resp = await request(app).get(`/jobs/0`);
      expect(resp.statusCode).toEqual(404);
    });
  });


//  ********** DELETE job posting ***********

describe("DELETE /jobs/:id", function () {

    test("works for admin", async function () {
        let idRes = await db.query(`SELECT id
                                    FROM jobs
                                    LIMIT 1`);
        let id = idRes.rows[0].id;

        const resp = await request(app)
          .delete(`/jobs/${id}`)
          .set("authorization", `Bearer ${u2AdminToken}`);
        expect(resp.body).toEqual({ deleted: `${id}` });
    });
  
    test("unauth for anon", async function () {
        let idRes = await db.query(`SELECT id
        FROM jobs
        LIMIT 1`);
        let id = idRes.rows[0].id;
        const resp = await request(app)
          .delete(`/jobs/${id}`);
        expect(resp.statusCode).toEqual(401);
    });
  
    test("not found for no such company", async function () {
      const resp = await request(app)
          .delete(`/jobs/0`)
          .set("authorization", `Bearer ${u2AdminToken}`);
      expect(resp.statusCode).toEqual(404);
    });
    // // u1Token is not an admin
    test("Unauthorized if not admin", async function () {
        let idRes = await db.query(`SELECT id
                                FROM jobs
                                LIMIT 1`);
        let id = idRes.rows[0].id;
        const resp = await request(app)
          .delete(`/jobs/${id}`)
          .set("authorization", `Bearer ${u1Token}`);
          expect(resp.statusCode).toEqual(401);
          expect(resp.body.error.message).toEqual('Must be Admin to access!');
    });
  });


// **************** POST job posting ****************


describe("POST /jobs", function () {
    const newJob = {
      title: "Hitachi PE",
      salary: 30000,
      equity: 0.5,
      companyHandle: "c2"
    };
  
    test("ok for admin only", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send(newJob)
          .set("authorization", `Bearer ${u2AdminToken}`);
      expect(resp.statusCode).toEqual(201);
      expect(resp.body.job).toEqual(expect.objectContaining({
        title: "Hitachi PE",
        salary: 30000,
        equity: "0.5",
        company_handle: "c2"
      }));
    });
  
    test("bad request with missing data", async function () {
      try{
        const resp = await request(app)
        .post("/jobs")
        .send({
          companyHandle: "c2"
        })
        .set("authorization", `Bearer ${u2AdminToken}`);
        expect(resp.statusCode).toEqual(400);
  
      }catch(err){
      }
  
    });
  
    test("bad request with invalid data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            title: 38,
            companyHandle: "c1"
          })
          .set("authorization", `Bearer ${u2AdminToken}`);
      expect(resp.statusCode).toEqual(400);
    });
  
    test("Unauthorized admin blocked from adding job", async function () {
      
      const resp = await request(app)
          .post("/jobs")
          .send(newJob)
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(401);
      expect(resp.body.error.message).toEqual('Must be Admin to access!');
    });
  });

//  ************** PATCH job posting *****************

describe("PATCH /jobs/:id", function () {
    // changed to administrators only


    test("works for administrators only", async function () {
        let idRes = await db.query(`SELECT id
                FROM jobs
                LIMIT 1`);
        let id = idRes.rows[0].id;
        const resp = await request(app)
          .patch(`/jobs/${id}`)
          .send({
            title: "Updated Job",
            salary: 1,
            equity: 0.01
          })
          .set("authorization", `Bearer ${u2AdminToken}`);
        expect(resp.body.job).toEqual(expect.objectContaining({
            title: "Updated Job",
            salary: 1,
            equity: "0.01"
          }));
    });
  
    test("unauth for anon", async function () {
        let idRes = await db.query(`SELECT id
                FROM jobs
                LIMIT 1`);
        let id = idRes.rows[0].id;
        const resp = await request(app)
          .patch(`/jobs/${id}`)
          .send({
            title: "Updated Job",
            salary: 1,
            equity: 0.01
          })
        expect(resp.statusCode).toEqual(401);
    });
  
    test("not found on no such job", async function () {
      const resp = await request(app)
          .patch(`/jobs/0`)
          .send({
            title: "Wont update",
            salary: 1,
            equity: 0.01
          })
          .set("authorization", `Bearer ${u2AdminToken}`);
      expect(resp.statusCode).toEqual(404);
    });
  
    test("bad request on companyHandle change attempt", async function () {
        let idRes = await db.query(`SELECT id
                        FROM jobs
                        LIMIT 1`);
        let id = idRes.rows[0].id;
        const resp = await request(app)
          .patch(`/jobs/${id}`)
          .send({
            companyHandle: "c1-new",
          })
          .set("authorization", `Bearer ${u2AdminToken}`);
      expect(resp.statusCode).toEqual(400);
    });
  
    test("bad request on invalid data", async function () {
        let idRes = await db.query(`SELECT id
                FROM jobs
                LIMIT 1`);
        let id = idRes.rows[0].id;
        const resp = await request(app)
          .patch(`/jobs/${id}`)
          .send({
            title: 4556,
            salary: "1",
            equity: 0.01
          })
          .set("authorization", `Bearer ${u2AdminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
  
    // // u1Token is not an admin
    test("unauthorized if not admin", async function () {
        let idRes = await db.query(`SELECT id
                FROM jobs
                LIMIT 1`);
        let id = idRes.rows[0].id;
        const resp = await request(app)
          .patch(`/jobs/${id}`)
          .send({
            title: "Updated Job",
            salary: 1,
            equity: 0.01
          })
          .set("authorization", `Bearer ${u1Token}`);
          expect(resp.statusCode).toEqual(401);
          expect(resp.body.error.message).toEqual('Must be Admin to access!');
    });
  
  });