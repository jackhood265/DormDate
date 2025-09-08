// scripts/write-google-plist.js
const fs = require('fs');
const path = require('path');

console.log("--- STARTING write-google-plist.js SCRIPT ---");

const GOOGLE_SERVICE_PLIST_BASE64 = process.env.GOOGLE_SERVICE_PLIST;

if (!GOOGLE_SERVICE_PLIST_BASE64) {
  console.error('ERROR: GOOGLE_SERVICE_PLIST environment variable is NOT set!');
  console.error('This means the secret was not provided by EAS.');
  console.log("--- write-google-plist.js SCRIPT FAILED ---");
  process.exit(1);
}

// Log the length of the base64 string to confirm it's not empty
console.log(`INFO: GOOGLE_SERVICE_PLIST_BASE64 length: ${GOOGLE_SERVICE_PLIST_BASE64.length}`);

// Define the target path for GoogleService-Info.plist
// This is where Expo's config plugins expect to find it for processing.
const IOS_PLIST_PATH = path.join(process.cwd(), 'ios', 'GoogleService-Info.plist');
// process.cwd() ensures we start from the project's root directory on the build server.

// Ensure the directory exists before writing the file
const dirPath = path.dirname(IOS_PLIST_PATH);
try {
  fs.mkdirSync(dirPath, { recursive: true });
  console.log(`INFO: Ensured directory exists: ${dirPath}`);
} catch (mkdirError) {
  console.error(`ERROR: Failed to create directory ${dirPath}:`, mkdirError);
  console.log("--- write-google-plist.js SCRIPT FAILED ---");
  console.log("--- write-google-plist.js SCRIPT FAILED ---"); // Added for more visibility
  process.exit(1);
}

let plistContent;
try {
  // Decode the Base64 content
  plistContent = Buffer.from(GOOGLE_SERVICE_PLIST_BASE64, 'base64').toString('utf8');
  console.log(`INFO: Successfully decoded Base64 content.`);
  // Log the beginning of the decoded content to check for validity (first 100 chars)
  console.log(`INFO: Decoded content start: \n${plistContent.substring(0, 100)}...`);
} catch (decodeError) {
  console.error(`ERROR: Failed to decode Base64 content:`, decodeError);
  console.log("--- write-google-plist.js SCRIPT FAILED ---");
  process.exit(1);
}

// Write the decoded content to the file
try {
  fs.writeFileSync(IOS_PLIST_PATH, plistContent, 'utf8');
  console.log(`SUCCESS: GoogleService-Info.plist written to ${IOS_PLIST_PATH}`);
} catch (writeError) {
  console.error(`ERROR: Failed to write GoogleService-Info.plist to ${IOS_PLIST_PATH}:`, writeError);
  console.log("--- write-google-plist.js SCRIPT FAILED ---");
  process.exit(1);
}

console.log("--- write-google-plist.js SCRIPT FINISHED SUCCESSFULLY ---");
