\echo 'Delete and recreate jobly db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE jobly;
CREATE DATABASE jobly;
\connect jobly

\i jobly-schema.sql
\i jobly-seed.sql

\echo 'Delete and recreate jobly_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE jobly_test;
CREATE DATABASE jobly_test;
\connect jobly_test

\i jobly-schema.sql


SELECT * FROM companies  
LEFT JOIN jobs
ON companies.handle = jobs.company_handle
WHERE companies.handle = 'c3';                                                                                                                                                                          JOIN jobs                                                                                                                                                                                                 ON companies.handle = jobs.company_handle                                                                                                                                                                 WHERE handle = watson-davis;
