#!/usr/bin/env node

// Script to filter JSON items based on username containing a specified string

const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
let filterString = '';
let inputFile = '';
let outputFile = '';

// Look for --filter flag and arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--filter' && i + 1 < args.length) {
    filterString = args[i + 1];
    i++; // Skip the next argument as we've already processed it
  } else if (!inputFile) {
    inputFile = args[i];
  } else if (!outputFile) {
    outputFile = args[i];
  }
}

// Check if required arguments are provided
if (!filterString || !inputFile || !outputFile) {
  console.error('Usage: node script.cjs --filter "filter_string" inputfile.json outputfile.json');
  process.exit(1);
}

// Read the input file
const inputData = fs.readFileSync(inputFile, 'utf8');
const data = JSON.parse(inputData);

// Filter items where username contains the filter string
const filteredItems = data.items.filter(item => {
  // Check if item has login object and username field
  if (item.login && item.login.username) {
    return item.login.username.includes(filterString);
  }
  return false;
});

// Create new data object with filtered items
const newData = {
  ...data,
  items: filteredItems
};

// Write the filtered data to output file
fs.writeFileSync(outputFile, JSON.stringify(newData, null, 2));

console.log(`Filtered ${data.items.length} items to ${filteredItems.length} items containing "${filterString}"`);