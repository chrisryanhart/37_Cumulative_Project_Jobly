"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

// add function to test if someone is an admin

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

// ensure user is an admin
function ensureAdmin(req,res,next){
  try{
    if(res.locals.user.isAdmin === false) throw new UnauthorizedError('Must be Admin to access!');
    return next();
  }catch(err){
    return next(err);
  }
}



// 
function ensureAdminOrCurrentUser(req,res,next){
  try{
    if(req.params.username !== res.locals.user.username && res.locals.user.isAdmin === false) throw new UnauthorizedError('Must be current user or admin to access!');
    return next();
  }catch(err){
    return next(err);
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureAdminOrCurrentUser
};
