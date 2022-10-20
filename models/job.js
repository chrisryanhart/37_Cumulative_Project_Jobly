"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilteredCompanies, sqlForFilteredJobs } = require("../helpers/sql");

class Job {
    /** Create a job (from data), update db, return new job data.
     *
     * data should be { title,salary,equity,company_handle }
     *
     * Returns { id,title,salary,equity,company_handle }
     *
     * Throws BadRequestError if company already in database.
     * */
  
    static async create({ title,salary,equity,companyHandle }) {
        // irrelevant? just make a call or come back to this later
      const duplicateCheck = await db.query(
            `SELECT id
             FROM jobs
             WHERE title = $1 AND salary = $2 AND equity=$3 AND company_handle = $4`,
          [title,salary,equity,companyHandle]);
  
      if (duplicateCheck.rows[0])
        throw new BadRequestError(`Duplicate job posting: ${title} with ${companyHandle}`);
  
      const result = await db.query(
            `INSERT INTO jobs
             (title,salary,equity,company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title,salary,equity,company_handle`,
          [title,salary,equity,companyHandle]);
      const job = result.rows[0];
  
      return job;
    }
  
    /** Find all jobs.
     *
     * Returns [{id, title, salary, equity, company_Handle}, ...]
     * */
  
    // Returns all or filtered jobs if query 'data' parameter provided
    static async findAll(data) {
      // update filtering for jobs
  
      // if data parameter present and a key/value is present, create and return a filtered query
      if (data && Object.keys(data).length !== 0){
    
      //   // translates query into sql format
        const {setCols,values} = sqlForFilteredJobs(data,{minSalary:"salary",hasEquity:"equity"});
  
        const criteria = "WHERE " + setCols;
  
        const filteredQuery = `SELECT id,
                                    title,
                                    salary,
                                    equity,
                                    company_handle AS "companyHandle"
                                FROM jobs
                                ${criteria}
                                ORDER BY id`;
        const jobsRes = await db.query(filteredQuery,values);
  
        return jobsRes.rows;
      }
  
      const jobsRes = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
             FROM jobs
             ORDER BY id`);
      return jobsRes.rows;
    }
  
    /** Given a job id, return data about that job.
     *
     * Returns { id, title, salary, equity, companyHandle }
     *   
     *
     * Throws NotFoundError if not found.
     **/
  
    static async get(id) {
      const jobRes = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
             FROM jobs
             WHERE id = $1`,
          [id]);
  
      const job = jobRes.rows[0];
  
      if (!job) throw new NotFoundError(`No job with id=${id}!`);
  
      return job;
    }
  
    /** Update job data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: {title, salary, equity}
     *
     * Returns {id, title, salary, equity, company_handle}
     *
     * Throws NotFoundError if not found.
     */
  
    static async update(id, data) {
      const { setCols, values } = sqlForPartialUpdate(data,{});
      if (setCols.includes('id') || setCols.includes('companyHandle')) throw new BadRequestError('Cannot modify id or companyHandle!');

      const idVarIdx = "$" + (values.length + 1);
  
      const querySql = `UPDATE jobs 
                        SET ${setCols} 
                        WHERE id = ${idVarIdx} 
                        RETURNING id, 
                                  title, 
                                  salary, 
                                  equity, 
                                  company_handle AS "companyHandle"`;
      const result = await db.query(querySql, [...values, id]);
      const job = result.rows[0];
  
      if (!job) throw new NotFoundError(`No job where id=${id}`);
  
      return job;
    }
  
    /** Delete given job from database; returns undefined.
     *
     * Throws NotFoundError if company not found.
     **/
  
    static async remove(id) {
      const result = await db.query(
            `DELETE
             FROM jobs
             WHERE id = $1
             RETURNING id`,
          [id]);
      const job = result.rows[0];
  
      if (!job) throw new NotFoundError(`No job exists where id=${id}`);
    }
  }



module.exports = Job;