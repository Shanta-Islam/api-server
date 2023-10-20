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
    await client.connect();

    const brandCollection = client.db('eShopHub').collection('brands');
    const productsCollection = client.db('eShopHub').collection('products');


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

    app.post('/products', async(req, res)=>{
        const newProduct = req.body;
        const result = await productsCollection.insertOne(newProduct);
        res.send(result);
    })

    app.get('/product/:brand_name', async (req, res) => {

      const brand_name = req.params.brand_name;
      const query = {brandName: brand_name };
      const result = await productsCollection.find(query);
      const products = await result.toArray();
      // console.log(products)
      res.send(products);

    })

    

    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
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