import mongoose from "mongoose";

const LOCAL_URI = "mongodb://127.0.0.1:27017/rankpilot";

function sanitizeUri(raw) {
    return (raw || "").trim().replace(/\s/g, "");
}

function maskUri(uri) {
    return uri.replace(/:([^@/]+)@/, ":****@");
}

const connectDB = async () => {
    const primaryUri = sanitizeUri(process.env.MONGODB_URI);

    if (!primaryUri) {
        console.error("MONGODB_URI is missing in .env");
        process.exit(1);
    }

    const tryConnect = async (uri) => {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
        console.log("MongoDB connected:", maskUri(uri));
    };

    try {
        await tryConnect(primaryUri);
    } catch (error) {
        const isAuthError =
            error.message.includes("bad auth") || error.message.includes("Authentication failed");

        if (isAuthError && primaryUri !== LOCAL_URI) {
            console.warn("Atlas authentication failed. Trying local MongoDB...");
            try {
                await tryConnect(LOCAL_URI);
                return;
            } catch (localError) {
                console.error("Local MongoDB also failed:", localError.message);
            }
        }

        console.error("Failed to connect to MongoDB:", error.message);
        console.error("MONGODB_URI:", maskUri(primaryUri));

        if (isAuthError) {
            console.error(`
Authentication failed — wrong database username or password in .env.
Fix Atlas credentials in MongoDB Atlas → Database Access, or use local MongoDB:
MONGODB_URI=mongodb://127.0.0.1:27017/rankpilot
`);
        }

        process.exit(1);
    }
};

export default connectDB;
