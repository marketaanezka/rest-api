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

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const dbName = "myDatabase";
    const collectionName = "books";

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

    // API endpoint to update an existing document by ID
    app.put('/api/books/:id', async (req, res) => {
    try {
      const bookId = req.params.id;
      const updatedBook = req.body;

      if (!updatedBook || !updatedBook.title || !updatedBook.author) {
        res.status(400).json({ message: 'Title or author are required' });
        return;
      }

      const query = { _id: new ObjectId(bookId) };
      const update = {
        $set: {
          title: updatedBook.title,
          author: updatedBook.author,
        },
      };

      const result = await collection.updateOne(query, update);

      if (result.matchedCount === 0) {
        res.status(404).json({ message: 'Book not found' });
        return;
      }

      const updatedDocument = await collection.findOne(query);
      res.json(updatedDocument);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // API endpoint to delete a document by ID
  app.delete('/api/books/:id', async (req, res) => {
    try {
      const bookId = req.params.id;
      const query = { _id: new ObjectId(bookId) };

      const result = await collection.deleteOne(query);

      if (result.deletedCount === 0) {
        res.status(404).json({ message: 'Book not found' });
        return;
      }

      res.status(204).send(); // Successfully deleted
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

// node api/mongo.js
