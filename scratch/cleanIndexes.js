import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017/timetable";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("timetable");
    const collection = db.collection("rooms");
    
    console.log("Existing indexes:");
    const indexes = await collection.indexes();
    console.log(indexes);
    
    // Drop room_id_1 and room_no_1 if they exist
    for (const index of indexes) {
      if (index.name !== "_id_") {
        console.log(`Dropping index: ${index.name}`);
        await collection.dropIndex(index.name);
      }
    }
    
    console.log("Indexes after cleanup:");
    console.log(await collection.indexes());
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
