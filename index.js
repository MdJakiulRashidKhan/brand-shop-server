const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app =express();
const port =process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER)
console.log(process.env.DB_PASSWORD)

app.get('/', (req, res) => {
  res.send('Brand Shop Server Is Running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2othmkh.mongodb.net/?retryWrites=true&w=majority`;

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

    const database = client.db("brandDb");
    const brandCollection = database.collection("brand");
    const cartCollection = database.collection("cart");
    //post
    app.post ('/brand',async (req,res)=>{
      const newBrand=req.body;
      console.log(newBrand);
      const result = await brandCollection.insertOne(newBrand);
      console.log(result);
      res.send(result);
    });
  
    //get
    app.get("/brand", async (req, res) => {
      const cursor = brandCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //get single 
    app.get("/brand/:id", async (req, res) => {
      const id =req.params.id;
      const query ={_id :new ObjectId(id)}
      const result = await brandCollection.findOne(query);
      res.send(result); 
    });
    //delete
    app.delete ('/brand/:id' ,async(req,res) =>{
      const id =req.params.id;
      const query ={_id :new ObjectId(id)}
      const result = await brandCollection.deleteOne(query);
      res.send(result);
   })
   //
   app.put ('/brand/:id',async (req,res)=>{
    const id =req.params.id;
    const filter ={_id :new ObjectId(id)}
    const options ={upsert :true};
    const updateBrand =req.body;
    const brand = {
      $set :{
        brand: updateBrand.brand,
        product: updateBrand.product,
        image: updateBrand.image,
        type: updateBrand.type,
        price: updateBrand.price,
        rating: updateBrand.rating,
        description: updateBrand.description
      }
    }
    const result =await brandCollection.updateOne(filter,brand,options);
    res.send(result);
  })

  //cart
  app.get("/cart", async (req, res) => {
    const cursor = cartCollection.find();
    const result = await cursor.toArray();
    console.log(result);
    res.send(result);
  });

  app.post("/cart", async (req, res) => {
    const product = req.body;
    console.log(product);

    try {
      const result = await cartCollection.insertOne(product);
      // display the results of your operation
      console.log(result);
      res.send(result);
    } catch (error) {
      console.error("Error : ", error);
    }
  });

  app.delete("/cart/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const query = { _id: new ObjectId(id) };
    const result = await cartCollection.deleteOne(query);
    console.log(result);
    res.send(result);
  });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();?
  }
}
run().catch(console.dir);
