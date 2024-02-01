const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.onvejqf.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const blogsCollection = client.db('blogDB').collection('blogs');
    const favoriteCollection = client.db('blogDB').collection('favorites');
    const commentsCollection = client.db('blogDB').collection('comments');



    app.get('/blogs', async (req, res) => {
      const query = {};
      const result = await blogsCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/blog-details/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const blog = await blogsCollection.findOne(query);
      res.send(blog);
    })
    app.get('/myblogs/:userId', async (req, res) => {
      const userId = req.params.userId;
      const query = { userId: userId };
      const blog = await blogsCollection.find(query).toArray();
      res.send(blog);
    })

    app.get('/storedBlogs/:email', async (req, res) => {
      const userEmail = req.params.email;
      const query = { email: userEmail };
      const result = await favoriteCollection.find(query).toArray();
      res.send(result);
    })
    app.post('/blog', async (req, res) => {
      const newBlog = req.body;
      const result = await blogsCollection.insertOne(newBlog);
      res.send(result);
    })

    app.post('/storedBlog', async (req, res) => {
      const storeBlog = req.body;
      const result = await favoriteCollection.insertOne(storeBlog);
      res.send(result);
    });
    app.put('/blog/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedBlog = req.body;
      const blog = {
        $set: {
          photo: updatedBlog.photo,
          title: updatedBlog.title,
          body: updatedBlog.body,
        }
      }
      const result = await blogsCollection.updateOne(filter, blog, options);
      res.send(result);
    })
    app.delete('/blog/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await blogsCollection.deleteOne(query);
      res.send(result);
    })
    app.delete('/deleteBlog/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await favoriteCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/tasks-comments', async (req, res) => {
      let query = {};
      if (req.query.taskId) {
        query = {
          taskId: req.query.taskId
        }
      }
      const cursor = commentsCollection.find(query).sort({ comment_date: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);

    })

    app.get('/activeuser-comments/:email', async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email }
      const user = await commentsCollection.find(query).toArray();
      res.send(user);
      console.log(user)



    })

    app.get('/user-reviews/:userID', async (req, res) => {
      const userID = req.params.userID;
      let query = { 'reviewer_info.userID': userID };
      const cursor = commentsCollection.find(query).sort({ review_date: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);

    })

    app.patch('/comment/:id', async (req, res) => {
      const id = req.params.id;
      const updateReviewData = req.body;
      const query = { _id: new ObjectId(id) };
      const updatedReview = {
        $set: updateReviewData

      }
      const result = await commentsCollection.updateOne(query, updatedReview);
      res.send(result);
    })

    app.delete('/comment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await commentsCollection.deleteOne(query);
      res.send(result);
    })

    app.post('/comment', async (req, res) => {
      const review = req.body;
      const result = await commentsCollection.insertOne(review);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('blog making server is running')
})

app.listen(port, () => {
  console.log(`blog Server is running on port: ${port}`)
})