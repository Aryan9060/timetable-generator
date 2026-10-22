import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const oldUri = process.env.OLD_MONGODB_URI || "mongodb://localhost:27017/";
const newUri = process.env.MONGODB_URI || "mongodb://localhost:27017/";

async function migrate() {
    const oldClient = new MongoClient(oldUri);
    const newClient = new MongoClient(newUri);

    try {
        await oldClient.connect();
        await newClient.connect();

        const oldDb = oldClient.db('timetable');
        const newDb = newClient.db('timetable');

        console.log("Connected to both databases.");

        const collections = await oldDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections in old DB.`);

        for (const collection of collections) {
            const collectionName = collection.name;
            console.log(`Migrating collection: ${collectionName}...`);

            const docs = await oldDb.collection(collectionName).find({}).toArray();
            console.log(`Found ${docs.length} documents in ${collectionName}.`);

            if (docs.length > 0) {
                // Drop the new collection to avoid duplicate keys
                try {
                    await newDb.collection(collectionName).drop();
                    console.log(`Dropped existing collection: ${collectionName} in new DB.`);
                } catch (e) {
                    // Ignore error if collection doesn't exist
                }

                await newDb.collection(collectionName).insertMany(docs);
                console.log(`Inserted ${docs.length} documents into ${collectionName} in new DB.`);
            }
        }

        console.log("Migration complete!");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await oldClient.close();
        await newClient.close();
    }
}

migrate();
