#!/usr/bin/env node

// Script to inject data from JSON file into SQLite database
// Matches records by email (username in JSON = email in DB)
// Updates fields according to mapping:
// - name -> serviceName
// - all uris concatenated with comma -> description
// - creationDate -> createdAt
// - revisionDate -> updatedAt

const fs = require('fs');
const path = require('path');

// Direct database access using correct path
const Database = require('better-sqlite3');
const dbPath = path.join(__dirname, '..', 'data', 'prismel.db');
const db = new Database(dbPath);

// Read and parse the JSON file
const jsonFilePath = process.argv[2];
const outputFilePath = process.argv[3];

if (!jsonFilePath || !outputFilePath) {
  console.error('Usage: node inject-data.cjs <input-json-file> <output-json-file>');
  process.exit(1);
}

console.log('Reading JSON file:', jsonFilePath);
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
console.log('JSON file loaded with', jsonData.items.length, 'items');

// Process each item in the JSON
let updatedCount = 0;
let skippedCount = 0;
let errorCount = 0;

const updatedItems = [];
const skippedItems = [];

// First, let's see which emails from JSON exist in database
const jsonEmails = new Set(jsonData.items.map(item => item.login?.username).filter(Boolean));
console.log('\nChecking for matching emails...');

// Get all existing emails from database
const existingEmailsResult = db.prepare('SELECT email FROM aliases').all();
const existingEmails = new Set(existingEmailsResult.map(row => row.email));

console.log(`Database has ${existingEmails.size} emails`);
console.log(`JSON has ${jsonEmails.size} unique emails`);

// Find matches
const matchingEmails = [...jsonEmails].filter(email => existingEmails.has(email));
console.log(`Matching emails: ${matchingEmails.length}`);

for (const item of jsonData.items) {
  try {
    const { name, login, creationDate, revisionDate } = item;
    const username = login?.username;
    
    // Skip if username is missing
    if (!username) {
      skippedCount++;
      console.log(`[SKIPPED] Missing username in item`);
      continue;
    }
    
    // Concatenate all URIs with comma for description
    const description = login.uris && login.uris.length > 0 
      ? login.uris.map(uriObj => uriObj.uri).join(', ') 
      : undefined;
    
    // Find matching record in database by email
    const existingRecord = db.prepare('SELECT * FROM aliases WHERE email = ?').get(username);
    
    if (existingRecord) {
      // Update the record
      const stmt = db.prepare(`
        UPDATE aliases 
        SET service_name = ?, description = ?, created_at = ?, updated_at = ?
        WHERE email = ?
      `);
      
      stmt.run(name, description, creationDate, revisionDate, username);
      
      updatedCount++;
      updatedItems.push({
        email: username,
        name: name,
        description: description,
        createdAt: creationDate,
        updatedAt: revisionDate
      });
      
      console.log(`[UPDATED] ${username}: ${name}`);
    } else {
      skippedCount++;
      skippedItems.push({
        email: username,
        name: name,
        description: description,
        createdAt: creationDate,
        updatedAt: revisionDate
      });
      console.log(`[SKIPPED] ${username}: ${name} (no matching record)`);
    }
  } catch (error) {
    errorCount++;
    console.error('[ERROR] Failed to process item:', error.message);
  }
}

// Write the updated items to output file
const outputData = {
  updated: updatedItems,
  skipped: skippedItems,
  statistics: {
    updated: updatedCount,
    skipped: skippedCount,
    errors: errorCount
  }
};

fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2));

console.log('\n=== Processing Complete ===');
console.log(`- Updated records: ${updatedCount}`);
console.log(`- Skipped records (no match): ${skippedCount}`);
console.log(`- Errors: ${errorCount}`);
console.log(`- Output written to: ${outputFilePath}`);

// Show summary of updated records
if (updatedCount > 0) {
  console.log('\n=== Updated Records ===');
  updatedItems.slice(0, 10).forEach(item => {
    console.log(`  ${item.email}: ${item.name}`);
  });
  if (updatedItems.length > 10) {
    console.log(`  ... and ${updatedItems.length - 10} more`);
  }
}

// Show summary of skipped records
if (skippedCount > 0) {
  console.log('\n=== Skipped Records (no matching DB records) ===');
  skippedItems.slice(0, 10).forEach(item => {
    console.log(`  ${item.email}: ${item.name}`);
  });
  if (skippedItems.length > 10) {
    console.log(`  ... and ${skippedItems.length - 10} more`);
  }
}

// Close database connection
db.close();

console.log('\nScript execution completed.');