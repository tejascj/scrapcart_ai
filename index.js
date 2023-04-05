// create a nodejs server that listens on port 3000 and responds .use express framework for creating server.
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3002;
app.use(cors());
app.use(bodyParser.json());
const dotenv = require('dotenv');
dotenv.config();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// import mongodb client and connect to the database server
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const uri = process.env.URI;
const options = { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 };
// connect to the database server and dont close the connection
const client = new MongoClient(uri, options);
client.connect(err => {
    if (err) {
        console.log(err);
    } else {
        console.log("connected to database");

        // create a endpoint for login to check if the user is registered or not
        async function login(email, password) {
            const client = new MongoClient(uri, options);
            const db = client.db('scrapcart');
            const users = db.collection('users');
            const user = await users.findOne({ email, password });
            return user;
        };
    }
});
app.post('/userlogin', async (req, res) => {

    const { email, password } = req.body;
    const user = await login(email, password);
    if (user) {
        res.send({
            status: 'success',
            name: user.name,
            email: user.email,
            phone: user.phone
        });
    } else {
        console.log(user);
        res.send({ status: 'error', message: 'user not found' });
    }
});
// create a endpoint to register the user
async function register(name, email, password) {
    const client = new MongoClient(uri, options);
    const db = client.db('scrapcart');
    const users = db.collection('users');
    const user = await users.insertOne({ name, email, password, phone });
    client.close();
    return user;
};
app.post('/userregister', async (req, res) => {
    console.log(req.body);
    const { name, email, password, phone } = req.body;
    const user = await register(name, email, password, phone);
    if (user) {
        res.send({
            status: 'success',
            name: user.name,
            email: user.email,
            phone: user.phone
        });
    } else {
        res.send({ status: 'error', message: 'user not found' });
    }

});
// create an endpoint for admin login to check if the admin is registered or not
app.post('/adminlogin', async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    try {
        const client = new MongoClient(uri, options);
        const db = client.db('scrapcart');
        const admin = db.collection('admin');
        const adminlogin = await admin.findOne({ email, password });
        if (adminlogin) {
            res.send({ status: 'success', message: 'admin found', name: adminlogin.name, email: adminlogin.email });
            console.log("admin found");
        } else {
            res.send({ status: 'error', message: 'admin not found' });
            console.log("admin not found");
        }
        client.close();
    } catch (error) {

    }
});
// create a endpoint to add address to a user account to a certain email
app.post('/users/addaddress', async (req, res) => {
    console.log(req.body);
    const { email, address, tag, link } = req.body;
    try {
        const client = new MongoClient(uri, options);
        const db = client.db('scrapcart');
        const users = db.collection('users');
        const addaddress = await users.findOneAndUpdate(
            { email: email },
            { $push: { address: { address: address, tag: tag, link: link } } }
        );
        res.send({ status: 'success', message: 'address added' });
        console.log("address added");
        client.close();
    } catch (error) {
        res.send({ status: 'error', message: 'address not added' });
        console.log("address not added");
    }
});
// create a endpoint to get data of a user account to a certain email
app.get('/get-user-data', async (req, res) => {
    // console.log(req.query);
    const { email } = req.query;
    try {
        const client = new MongoClient(uri, options);
        const db = client.db('scrapcart');
        const users = db.collection('users');
        const addresses = await users.find({ email: email }).toArray();
        // console.log(addresses[0].address);
        res.send(addresses);
        client.close();
    } catch (error) {
        res.send({ status: 'error', message: 'address not found' });
        console.log("address not found");
    }
});
// create a endpoint to get categories
app.get('/get-categories', async (req, res) => {
    try {
        const client = new MongoClient(uri, options);
        const db = client.db('scrapcart');
        const category = db.collection('category');
        const categories = await category.find().toArray();
        // console.log(categories);
        res.send(categories);
        client.close();
    } catch (error) {
        res.send({ status: 'error', message: 'categories not found' });
        console.log("categories not found");
    }
});
// create an endpoint to add a new category
app.post('/add-category', async (req, res) => {
    console.log(req.body);
    const { name } = req.body;
    try {
        const client = new MongoClient(uri, options);
        const db = client.db('scrapcart');
        const category = db.collection('category');
        const addcategory = await category.insertOne({ name });
        res.send({ status: 'success', message: 'category added' });
        console.log("category added");
        client.close();
    } catch (error) {
        res.send({ status: 'error', message: 'category not added' });
        console.log("category not added");
    }
});

// create an endpoint to place an order
app.post('/place-order', async (req, res) => {
    console.log(req.body);
    const { email, address, wasteTypes, date, time, status, driverid, drivername, driverphone, ordertime, phone, weight, amount, paymentstatus } = req.body;
    try {
        const client = new MongoClient(uri, options);
        const db = client.db('scrapcart');
        const orders = db.collection('orders');
        const addorder = await orders.insertOne({ email, address, wasteTypes, date, time, status, driverid, drivername, driverphone, ordertime, phone, amount, weight, paymentstatus });
        res.send({ status: 'success', message: 'order placed' });
        console.log("order placed");
        client.close();
    } catch (error) {
        res.send({ status: 'error', message: 'order not placed' });
        console.log("order not placed");
    }
});
// create an endpoint to get orders of a user
app.get('/fetchorders', async (req, res) => {
    console.log(req.query);
    const { email } = req.query;
    try {
        const client = new MongoClient(uri, options);
        const db = client.db('scrapcart');
        const orders = db.collection('orders');
        const placedorders = await orders.find({ email: email }).toArray();
        // console.log(placedorders);
        res.send(placedorders);
        client.close();
    } catch (error) {
        res.send({ status: 'error', message: 'orders not found' });
        console.log("orders not found");
    }
});
// create an endpoint to get all orders
app.get('/fetchallorders', async (req, res) => {
    console.log('fetchallorders')
    try {
        const client = new MongoClient(uri, options);
        const db = client.db('scrapcart');
        const orders = db.collection('orders');
        const getallorders = await orders.find().toArray();
        console.log(getallorders);
        res.send(getallorders);
        client.close();
    } catch (error) {
        res.send({ status: 'error', message: 'orders not found' });
        console.log("orders not found");
    }
});
// create an enpoint to cancel an order using orderid
app.post('/cancel-orders', async (req, res) => {
    console.log(req.body);
    const { orderid } = req.body;
    try {
        const client = new MongoClient(uri, options);
        const db = client.db('scrapcart');
        const orders = db.collection('orders');
        const objectId = new ObjectId(orderid);
        const cancelorder = await orders.findOneAndUpdate(
            { _id: objectId },
            { $set: { status: 'cancelled' } }
        );
        res.send({ status: 'success', message: 'order cancelled' });
        console.log("order cancelled");
        client.close();
    } catch (error) {
        res.send({ status: 'error', message: error });
        console.log(error);
    }
});
// create an enpoint to add bank details of a user
app.post('/add-bank-details', async (req, res) => {
    console.log(req.body);
    const { email, recievername, accountNumber, ifscCode, bankName, branchName } = req.body;
    try {
        const client = new MongoClient(uri, options);
        const db = client.db('scrapcart');
        const users = db.collection('users');
        const addbankdetails = await users.findOneAndUpdate(
            { email: email },
            { $push: { bankdetails: { recievername: recievername, accountNumber: accountNumber, ifscCode: ifscCode, bankName: bankName, branchName: branchName } } }
        );
        res.send({ status: 'success', message: 'bank details added' });
        console.log("bank details added");
        client.close();
    } catch (error) {
        res.send({ status: 'error', message: 'bank details not added' });
        console.log("bank details not added");
    }
});
// create an enpoint to update bank details of a user
app.post('/update-bank-details', async (req, res) => {
    console.log(req.body);
    const { email, recievername, accountNumber, ifscCode, bankName, branchName } = req.body;
    try {
        const client = new MongoClient(uri, options);
        const db = client.db('scrapcart');
        const users = db.collection('users');
        const updatebankdetails = await users.findOneAndUpdate(
            { email: email, "bankdetails.recievername": recievername },
            { $set: { "bankdetails.$.accountNumber": accountNumber, "bankdetails.$.ifscCode": ifscCode, "bankdetails.$.bankName": bankName, "bankdetails.$.branchName": branchName } }
        );
        res.send({ status: 'success', message: 'bank details updated' });
        console.log("bank details updated");
        client.close();
    } catch (error) {
        res.send({ status: 'error', message: 'bank details not updated' });
        console.log("bank details not updated");
    }
});
// create an enpoint to delete bank details of a user
app.post('/remove-bank-details', async (req, res) => {
    console.log(req.body);
    const { email } = req.body;
    try {
        const client = new MongoClient(uri, options);
        const db = client.db('scrapcart');
        const users = db.collection('users');
        // find and delete the bank details from the user 
        const removebankdetails = await users.findOneAndUpdate(
            { email: email },
            { $unset: { bankdetails: "" } }
        );
        res.send({ status: 'success', message: 'bank details removed' });
        console.log("bank details removed");
        client.close();
    } catch (error) {
        res.send({ status: 'error', message: 'bank details not removed' });
        console.log("bank details not removed");
    }
});
// create an endpoint to check if the onlineuri mongobd connection is valid
const onlineuri = process.env.onlineuri;
console.log(onlineuri);
app.get('/api/check', async (req, res) => {
    try {
        const client = new MongoClient(onlineuri, options);
        await client.connect();
        const dbName = "TestData";
        const collectionName = "testdata";
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const data = await collection.find().toArray();
        res.send({ data: data, status: 'success', message: 'connection established' });
        console.log("connection established");
        client.close();
    } catch (error) {
        res.send({ status: 'error', message: 'connection not established' });
        console.log("connection not established");
    }
});
// create a endpoint to say hello to the user
app.get('/', (req, res) => {
    console.log('hello');
    res.send('Hello World!');
});
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
}
);