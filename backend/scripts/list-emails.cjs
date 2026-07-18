#!/usr/bin/env node

// Script to list all email addresses from the database

const path = require('path');
const Database = require('better-sqlite3');

// Determine the correct path to the database
const dbPath = path.join(__dirname, '..', 'data', 'prismel.db');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  const stmt = db.prepare('SELECT email FROM aliases ORDER BY email');
  const emails = stmt.all();
  
  console.log('All email addresses in database:');
  console.log('==================================');
  
  if (emails.length === 0) {
    console.log('No emails found in database');
  } else {
    emails.forEach((row, index) => {
      console.log(`${index + 1}. ${row.email}`);
    });
    console.log(`\nTotal: ${emails.length} emails`);
  }
  
  db.close();
} catch (error) {
  console.error('Error reading database:', error.message);
}