const { MongoClient } = require('mongodb');
const DATABASE_URL = "mongodb+srv://guptapiyush210427:P6xyO9dLxeFCxgBn@cluster0.1ldf80p.mongodb.net/";

async function connectToDatabase(url) {
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log('Connected to the database');
    return client.db(); // Return the database object
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error; // Adjust error handling as needed
  }
}

async function fetchData() {
  const db = await connectToDatabase(DATABASE_URL);

  // Check if the connection is successful
  if (!db) {
    console.error('Failed to connect to the database');
    process.exit(1); // Exit the application or handle the error appropriately
  }

  try {
    // Use the aggregate pipeline to fetch data
    const data = await db.collection('users').aggregate([
      {
        $lookup: {
          from: 'projectsubmissions',
          localField: '_id',
          foreignField: 'userId',
          as: 'ProjectSubmissions',
        },
      },
      {
        $unwind: '$ProjectSubmissions',
      },
      // Add more stages as needed
    ]).toArray();

    console.log(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Call the fetchData function to initiate the process
fetchData();
