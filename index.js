const express = require('express');
const ObjectId = require('mongodb').ObjectId;

const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hhrl2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect()

        const database = client.db('carHouse')
        const productCollections = database.collection('products')
        const purchaseCollection = database.collection('purchase-item')
        const userCollection = database.collection('users')
        const reviewCollection = database.collection('review')

        // post api 
        app.post('/product', async (req, res) => {
            const service = req.body


            const result = await productCollections.insertOne(service);
            console.log(result);
            res.json(result)
        });

        // purchase post
        app.post('/purchase', async (req, res) => {
            const product = req.body;
            const results = await purchaseCollection.insertOne(product)
            console.log(results)
            res.json(results)
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({})
            const review = await cursor.toArray()

            res.send(review)
        })


        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            console.log(result)
            res.json(result)
        })


        app.post('/review', async (req, res) => {
            const user = req.body;
            const result = await reviewCollection.insertOne(user);
            console.log(result)
            res.json(result)
        })

        // get api 
        app.get('/products', async (req, res) => {
            const cursor = productCollections.find({})
            const products = await cursor.toArray()

            res.send(products)
        })
        // get single api 
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('geting id', id)
            const query = { _id: ObjectId(id) };
            const product = await productCollections.findOne(query);
            res.json(product);
        })
        // get single api 
        app.get('/products', async (req, res) => {
            const cursor = productCollections.find({})
            const products = await cursor.toArray()

            res.send(products)
        })

        app.get('/purchases', async (req, res) => {
            const cursor = purchaseCollection.find({})
            const purchases = await cursor.toArray()

            res.send(purchases)
        })

        app.get('/purchases/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await purchaseCollection.findOne(query);
            // console.log('load user with id: ', id);
            res.send(user);
        })




        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user)
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc)
            res.json(result)

        })

        app.get('/singleOrder', async (req, res) => {
            const email = req.query.email;

            const query = { email: email }

            const cursor = purchaseCollection.find(query);
            const purchase = await cursor.toArray();
            res.json(purchase);
        })

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollections.deleteOne(query);

            console.log('deleting product with id ', result);

            res.json(result);
        })

        app.delete('/purchases/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await purchaseCollection.deleteOne(query);

            console.log('deleting purchase  with id ', result);

            res.json(result);
        })

        app.delete('/singleOrder/:id', async (req, res) => {
            const email = req.query.email;
            const id = req.params.id;
            const query = { _id: ObjectId(id), email: email };
            const result = await purchaseCollection.deleteOne(query);

            console.log('deleting user with id ', result);

            res.json(result);
        })
    }


    finally {

        // await client.close();
    }

}
run().catch(console.dir);








app.get('/', (req, res) => {
    res.send('Hello how are you brother!')
})

app.listen(port, () => {
    console.log(`Example app listening ${port}`)
})