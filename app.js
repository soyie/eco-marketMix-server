const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const ejsLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose'); // Import mongoose
const router = express.Router();
const multer = require('multer');
const { UUIDV4 } = require('sequelize');
const routes = require('./routes/index')
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;
app.use(cors());
app.use(express.json());
app.use('/', router);
app.set('view engine', 'ejs');


// MongoDB connection URI
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to the MongoDB server');
        return client.db('crud_app'); // Replace 'crud_app' with your database name
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process if unable to connect to MongoDB
    }
}

app.use('/', routes);

// const storage = multer.diskStorage({
//     destination: function (req, file, cb){
//         cb(null, '/uploads')
//     },
//     filename: function (req, file, cb){
//         const filename = UUIDV4() + file.originalname.substring(file.originalname.lastIndexOf('.'));
//         cb(null, filename)
//     },
// })

// Routes

//new announcement
const upload = multer();

app.post('/server/new-announcement', upload.single('file'), async (req, res) =>{
    try{
        const db = await connectToDatabase();
        const {category, description} = req.body;
        const fileUrl = req.file ? req.file.buffer : null;
        console.log(req.body)
        // console.warn(fileUrl)
        const result = await db.collection('announcements').insertOne({ category, description, fileUrl });
        if (result.acknowledged) {
            console.log(result.body)
            res.status(200).json(req.body); // Return the inserted document
        }
        else {
            console.log(result)
            res.status(500).json({ error: 'Failed to create user' });
        }
    }catch (err){
        console.error(err);
    }
})

// Create
app.post('/api/new-users', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const { name, surname, dateOfBirth, email, regDate, lastLogin} = req.body;
        const result = await db.collection('users').insertOne({ name, surname, dateOfBirth, email, regDate, lastLogin });

        if (result.acknowledged) {
            res.status(200).json(req.body); // Return the inserted document
        }
        else {
            res.status(500).json({ error: 'Failed to create user' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Read

router.get("/server/all-announcements", async (req, res) => {
    try {
        const db = await connectToDatabase();
        const announcement = await db.collection('announcements').find().toArray();
        console.log(announcement)
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get("/server/users", async (req, res) => {
    try {
        const db = await connectToDatabase();
        const users = await db.collection('users').find().toArray();
        // console.log(users)
        res.render("userList", { "users": users }); // Ensure the key is "users"
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//getting all businesses
router.get("/server/businesses", async (req, res) => {
    try {
        const db = await connectToDatabase();
        const business = await db.collection('businesses').find().toArray();
        console.log(users)
        res.render("businessList", { "businesses": business }); // Ensure the key is "users"
    } catch (error) {
        console.error('Error fetching businesses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get("/server/anouncements", async (req, res) => {
    try {
        const db = await connectToDatabase();
        const announcement = await db.collection('announcements').find().toArray();
        console.log(announcement)
        res.render("announcement", {"announcement": announcement})
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    
})

router.get("/server/private-messages", (req, res) => {
    res.render("messages")
})

router.get("/server/user-complaints", (req, res)=>{
    res.render("complaints")
})

router.get("/server/ai", (req, res)=>{
    res.render("inteligence")
})

const allUsers = [];
const whitePlan = []
const goldPlan = []
const premiumPlan = []
const blackPlan = []
const otherPlans = []

router.get('/', async (req, res)=>{
    try {
        const db = await connectToDatabase();
        const users = (await db.collection('users').find().toArray()).length;
        allUsers.push(await db.collection('users').find().toArray())
        // console.log(allUsers[0].array.forEach(element => {
        //     element.email
        // }))
        // console.log(allUsers[0])
        for (x=0; x<users; x++){
            // console.log(allUsers[0][x].plan)
            switch (allUsers[0][x].plan){
                case "Black":
                    blackPlan.push(allUsers[0][x].plan)
                    break
                case "White":
                    whitePlan.push(allUsers[0][x].plan)
                    break
                case "Gold":
                    goldPlan.push(allUsers[0][x].plan)
                    break
                case "Premium":
                    premiumPlan.push(allUsers[0][x].plan)
                    break
                default:
                    otherPlans.push(allUsers[0][x].plan)
                    break
            }
        }
        const allPlans = {
            "premium": premiumPlan.length,
            "gold": goldPlan.length,
            "black": blackPlan.length,
            "white": whitePlan.length,
            "other": otherPlans.length
        }
        console.table(allPlans)
        res.render("index", { "users": users , "plans": allPlans}); // Ensure the key is "users"
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.get("/server/business/:userId", async (req, res) => {
    try {
        console.log(req.params.userId)
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// router.get('/users', async (req, res)=>{
//     try {
//         const db = await connectToDatabase();
//         const users = (await db.collection('users').find().toArray()).length;
//         console.log(users)
//         res.render("index", { "users": users }); // Ensure the key is "users"
//     } catch (error) {
//         console.error('Error fetching users:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// })

// Update
app.put('/api/server/:id', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const id = req.params.id;
        const { name, surname, age, dateOfBirth, email, regDate, lastLogin } = req.body;
        const result = await db.collection('users').updateOne({ _id: ObjectId(id) }, { $set: { name, surname, dateOfBirth, email, regDate, lastLogin } });
        res.json(result);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a user by ID
app.delete('/api/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // Validate the ID format
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const db = await connectToDatabase();

        // Check if the user exists before deleting
        const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete the user
        const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

        // Check if deletion was successful
        if (result.deletedCount === 1) {
            return res.status(200).json({ message: 'User deleted successfully' });
        } else {
            return res.status(500).json({ error: 'Failed to delete user' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/server/info/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log(new ObjectId(id));
        const db = await connectToDatabase();

        // Delete the user
        const result = await db.collection('announcements').findOne({ _id: new ObjectId(id) });
        console.log(result)
    
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/server/businesses/information/:business', async (req, res) => {
    console.log(req.params.business)
})


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

module.exports = connectToDatabase;
