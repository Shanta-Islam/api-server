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

    const brandCollection = client.db('eShopHub').collection('brands');
    const productsCollection = client.db('eShopHub').collection('products');
    const userCollection = client.db('eShopHub').collection('user');
    const cartCollection = client.db('eShopHub').collection('cart');



    app.get('/brands', async (req, res) => {
      const query = {};
      const cursor = brandCollection.find(query);
      const brands = await cursor.toArray();
      res.send(brands);
    });

    // app.get('/brands/:id', async (req, res) => {
    //     const id = req.params.id;
    //     const query = { _id: new ObjectId(id) };
    //     const brands = await brandCollection.findOne(query);
    //     res.send(brands);
    // })

    app.get('/product/:brand_name', async (req, res) => {

      const brand_name = req.params.brand_name;
      const query = { brandName: brand_name };
      const result = await productsCollection.find(query);
      const products = await result.toArray();
      // console.log(products)
      res.send(products);

    })

    app.get('/product-details/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);

    })

    app.get('/storeProduct/:email', async (req, res) => {

      const userEmail = req.params.email;
      const query = { email: userEmail };
      const result = await cartCollection.find(query);
      const storeProducts = await result.toArray();
      // console.log(storeProducts)
      res.send(storeProducts);

    })

    app.post('/products', async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    })

    app.post('/user', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    app.post('/storeProduct', async (req, res) => {    
      const storeProduct = req.body;
      const result = await cartCollection.insertOne(storeProduct);
      res.send(result); 
    });
    app.put('/product/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedProduct = req.body;
      const product = {
        $set: {
          photo: updatedProduct.photo,
          name: updatedProduct.name,
          brandName: updatedProduct.brandName,
          type: updatedProduct.type,
          price: updatedProduct.price,
          rating: updatedProduct.rating
        }
      }
      const result = await productsCollection.updateOne(filter, product, options);
      res.send(result);
    })
    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartCollection.deleteOne(query);
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
  res.send('eShopHub making server is running')
})

app.listen(port, () => {
  console.log(`eShopHub Server is running on port: ${port}`)
})