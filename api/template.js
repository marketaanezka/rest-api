require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 5000;

app.use(express.json());

const password = process.env.DB_PASSWORD;

const uri = `mongodb+srv://marketawillis:${password}@cluster0.lpqm5xl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri);

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const dbName = "myDatabase";
    const collectionName = "books";

    // Create references to the database and collection in order to run
    // operations on them.
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // API endpoint to get all documents
    app.get('/api/books', async (req, res) => {
      try {
        const cursor = collection.find();
        const documents = await cursor.toArray();
        res.json(documents);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    app.get('/api/books/:id', async (req, res) => {
      try {
        const bookId = req.params.id;
        const query = { _id: new ObjectId(bookId) };
        const book = await collection.findOne(query);


        if (!book) {
          res.status(404).json({ message: 'Not Found' });
          return;
        }
       
        res.json(book);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });


    // API endpoint to create a new document
    app.post('/api/books', async (req, res) => {
      try {
        const newBook = req.body;

        if (!newBook || !newBook.title || !newBook.author) {
          res.status(400).json({ message: 'Title and author are required' });
          return;
        }

        const result = await collection.insertOne(newBook);

        const insertedBook = await collection.findOne({ _id: result.insertedId });

        if (!insertedBook) {
          res.status(404).json({ message: 'Inserted book not found' });
          return;
        }

        // Return the inserted document
        res.status(201).json(insertedBook);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
    

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);
