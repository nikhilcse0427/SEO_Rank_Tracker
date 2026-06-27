import "dotenv/config";
import mongoose from "mongoose";

const raw = process.env.MONGODB_URI || "";
const uri = raw.trim().replace(/\s/g, "");

function maskUri(connectionString) {
    try {
        return connectionString.replace(/:([^@/]+)@/, ":****@");
    } catch {
        return "(could not parse URI)";
    }
}

console.log("--- MongoDB connection diagnostic ---\n");

if (!uri) {
    console.log("FAIL: MONGODB_URI is empty in .env");
    process.exit(1);
}

if (raw !== raw.trim() || /\n|\r/.test(raw)) {
    console.log("WARN: URI contains extra spaces or line breaks. Keep it on ONE line.\n");
}

console.log("URI (masked):", maskUri(uri));
console.log("Type:", uri.startsWith("mongodb+srv://") ? "Atlas (cloud)" : uri.startsWith("mongodb://") ? "Standard/local" : "Unknown format");

if (!uri.startsWith("mongodb")) {
    console.log("\nFAIL: URI must start with mongodb:// or mongodb+srv://");
    process.exit(1);
}

try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log("\nSUCCESS: Connected to MongoDB!");
    await mongoose.disconnect();
    process.exit(0);
} catch (error) {
    console.log("\nFAIL:", error.message);

    if (error.message.includes("bad auth") || error.codeName === "AtlasError") {
        console.log(`
This is NOT a wrong URL format — your cluster address is probably fine.
"bad auth" means MongoDB rejected the USERNAME or PASSWORD.

Check these in MongoDB Atlas (cloud.mongodb.com):

1. Database Access (NOT your Atlas login email)
   - Create or edit a "Database User"
   - Copy that username + password into the URI

2. Password special characters
   - If password has @ # % / ? & = encode them in the URI:
     @ → %40   # → %23   % → %25

3. Reset password
   - Atlas → Database Access → Edit user → Edit Password
   - Use a simple password (letters+numbers only) to test

4. Correct connection string
   - Atlas → Connect → Drivers → copy the FULL string
   - Replace <password> with your database user password (one line, no quotes needed)

Example:
MONGODB_URI=mongodb+srv://myuser:MyPass123@cluster0.xxxxx.mongodb.net/seo?retryWrites=true&w=majority
`);
    } else if (error.message.includes("ECONNREFUSED") || uri.includes("127.0.0.1")) {
        console.log("\nLocal MongoDB is not running. Start MongoDB service or use Atlas URI.");
    } else if (error.message.includes("timed out") || error.message.includes("Server selection")) {
        console.log(`
Connection timed out — usually Network Access in Atlas:
Atlas → Network Access → Add IP Address → Allow 0.0.0.0/0 (for testing)
`);
    }

    process.exit(1);
}
