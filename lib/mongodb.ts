import mongoose from "mongoose";

const rawMongoUrl = process.env.MONGO_URL;

if (!rawMongoUrl) {
    throw new Error("Please provide MONGO_URL in the environment variables");
}

const MONGODB_URI: string = rawMongoUrl;

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
