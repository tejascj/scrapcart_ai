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

// create a endpoint for login to check if the user is registered or not
async function login(email, password) {
    const client = new MongoClient(uri, options);
    const db = client.db('scrapcart');
    const users = db.collection('users');
    const user = await users.findOne({ email, password });
    client.close();
    return user;
};
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
        console.log("user found");
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
        console.time("response");
        res.send(getallorders);
        console.timeEnd("response");
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
// create an endpoint to add a driver
app.post('/add-driver', async (req, res) => {
    console.log(req.body);
    const { drivername, driveremail, driverphone, driveraddress, driverpassword } = req.body;
    try {
        const client = new MongoClient(uri, options);
        const db = client.db('scrapcart');
        const drivers = db.collection('drivers');
        const adddriver = await drivers.insertOne(
            { drivername: drivername, driveremail: driveremail, driverphone: driverphone, driveraddress: driveraddress, driverpassword: driverpassword }
        );
        res.send({ status: 'success', message: 'driver added' });
        console.log("driver added");
        client.close();
    } catch (error) {
        res.send({ status: 'error', message: 'driver not added' });
        console.log("driver not added");
    }
});
// create an endpoint to fetch all drivers
app.get('/get-drivers', async (req, res) => {
    try {
        const client = new MongoClient(uri, options);
        const db = client.db('scrapcart');
        const drivers = db.collection('drivers');
        const getdrivers = await drivers.find().toArray();
        res.send({ data: getdrivers, status: 'success', message: 'drivers fetched' });
        console.log("drivers fetched");
        client.close();
    } catch (error) {
        res.send({ status: 'error', message: 'drivers not fetched' });
        console.log("drivers not fetched");
    }
});
// create an endpoint to delete the drivers where the driverids are passed as an array
app.post('/delete-drivers', async (req, res) => {
    console.log(req.body);
    const { driverids } = req.body;
    try {
        const client = new MongoClient(uri, options);
        const db = client.db('scrapcart');
        const drivers = db.collection('drivers');
        const objectIds = driverids.map((id) => new ObjectId(id));
        const deletedrivers = await drivers.deleteMany({ _id: { $in: objectIds } });
        console.log("Deleted drivers:", deletedrivers.result);
        res.send({ status: 'success', message: 'drivers deleted' });
        console.log("drivers deleted");
        client.close();
    } catch (error) {
        res.send({ status: 'error', message: 'drivers not deleted', error: error });
        console.log("drivers not deleted", error);
    }
});
// create an endpoint to assign the orders to a driver where the driverid and orderids are passed as an array.i want to update the driverid,drivername,driverphone in the orders collection and also update the status of the orders to assigned. i also want the selected orders to be pushed to the driver's orders array
app.post('/assign-orders', async (req, res) => {
    console.log(req.body);
    const { driverid, orderids } = req.body;
    try {
        const client = new MongoClient(uri, options);
        const db = client.db('scrapcart');
        const drivers = db.collection('drivers');
        const orders = db.collection('orders');
        const objectIds = orderids.map((id) => new ObjectId(id));
        const driver = await drivers.findOne({ _id: new ObjectId(driverid) });
        console.log(driver);
        const drivername = driver.drivername;
        const driverphone = driver.driverphone;
        const assignorders = await orders.updateMany({ _id: { $in: objectIds } }, { $set: { driverid: driverid, drivername: drivername, driverphone: driverphone, status: 'assigned' } });
        console.log("Assigned orders:", assignorders.result);
        const pushorders = await drivers.updateOne({ _id: new ObjectId(driverid) }, { $push: { orders: { $each: objectIds } } });
        console.log("Pushed orders:", pushorders.result);
        res.send({ status: 'success', message: 'orders assigned' });
        console.log("orders assigned");
        client.close();
    } catch (error) {
        res.send({ status: 'error', message: 'orders not assigned', error: error });
        console.log("orders not assigned", error);
    }
});
// create an endpoint to validate the driver login
app.post('/driverlogin', async (req, res) => {
    console.log(req.body);
    const { driveremail, driverpassword } = req.body;
    try {
        const client = new MongoClient(uri, options);
        const db = client.db('scrapcart');
        const drivers = db.collection('drivers');
        const driver = await drivers.findOne({ driveremail: driveremail, driverpassword: driverpassword });
        console.log(driver);
        if (driver) {
            res.send({ data: driver, status: 'success', message: 'driver logged in' });
            console.log("driver logged in");
        } else {
            res.send({ status: 'error', message: 'driver not logged in' });
            console.log("driver not logged in");
        }
        client.close();
    } catch (error) {
        res.send({ status: 'error', message: 'driver not logged in', error: error });
        console.log("driver not logged in", error);
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