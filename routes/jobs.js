"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

// replace with job schemas
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");


const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login and Admin
 */

// Added authorization to verify if user is admin

router.post("/", [ensureLoggedIn, ensureAdmin], async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.create(req.body);
      return res.status(201).json({ job });
    } catch (err) {
      return next(err);
    }
  });
  
  /** GET /  =>
   *   { jobs: [ { id, title, salary, equity, companyHandle }, ...] }
   *
   * Add search filter :
   * - nameLike (will find case-insensitive, partial matches)
   *
   * Authorization required: none
   */
  
  // Route gets companies (later by filtering )
  // 
  
  router.get("/", async function (req, res, next) {
    try {
  
      // create object to gather req.query and req.body data
      const filterCriteria = {};
  
      // Filtering to update: Add relevant query information if present
    //   if(Object.keys(req.query).includes('name')){
    //     filterCriteria["name"] = req.query.name.toLowerCase();
    //   }
    //   if(Object.keys(req.body).length!==0){
    //     for(const key in req.body){
    //       filterCriteria[key] = req.body[key];
    //     }
    //   }
  
    // Filtering to update:
      // valid json format of object to be sent to the database
    //   const validator = jsonschema.validate(filterCriteria, companyQuerySchema);
    //   if (!validator.valid) {
    //     const errs = validator.errors.map(e => e.stack);
    //     throw new BadRequestError(errs);
    //   }
  
    //   Filtering to update:
      // If min greater than max employees in query, throw error
    //   if (filterCriteria.minEmployees > filterCriteria.maxEmployees){
    //     const err = new BadRequestError('Min employees cant be greater than the max');
    //     return next(err);
    //   }
  
      // query database based on filter criteria
      const jobs = await Job.findAll(filterCriteria);
      return res.json({ jobs });
    } catch (err) {
      return next(err);
    }
  });
  
  /** GET /[id]  =>  { job }
   *
   *  Job is { id, title, salary, equity, companyHandle } }
   *   
   *
   * Authorization required: none
   */
  
  router.get("/:id", async function (req, res, next) {
    try {
      const job = await Job.get(req.params.id);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });
  
  /** PATCH /[handle] { fld1, fld2, ... } => { company }
   *
   * Patches company data.
   *
   * fields can be: { name, description, numEmployees, logo_url }
   *
   * Returns { handle, name, description, numEmployees, logo_url }
   *
   * Authorization required: login
   */
  
  router.patch("/:id", [ensureLoggedIn, ensureAdmin], async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.update(req.params.id, req.body);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });
  
  /** DELETE /[handle]  =>  { deleted: handle }
   *
   * Authorization: login
   */
  
  router.delete("/:id", [ensureLoggedIn, ensureAdmin], async function (req, res, next) {
    try {
      await Job.remove(req.params.id);
      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
  });











module.exports = router;