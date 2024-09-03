const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const { json } = require('sequelize');
const multer = require('multer');
// const express = require('express');
const router = express.Router();



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

router.use(express.json({limit: "50mb"}))
// router.use(bodyParser.urlencoded({extended: true, limit: '50mb'}))

const upload = multer();
// // // Define route handlers
// router.get('/', (req, res) => {
//     res.render('../views/index');
// });
// router.get("/server/anouncements", (req, res) =>{
//     res.render("../views/userList");
// })
// router.get("/server/private-messages", (req, res)=>{
//     res.render("../views/projectInfo")
// })
// router.get("/server/learning-traits", async (req, res) => {
//     try {
//         const db = await connectToDatabase();
//         const users = await db.collection('users').find().toArray();
//         console.log(users)
//         res.render("../views/userList", { users: users }); // Ensure the key is "users"
//     } catch (error) {
//         console.error('Error fetching users:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// Log in as a user
router.post('/accounts/log-users', async (req, res) => {
    try {
        var mail = json(req.body).conditions.email;
        var password = json(req.body).conditions.password;
        console.log(mail);
        console.log(password);

        if (password === "" || password === null || password === undefined || mail === "" || mail === null || mail === undefined) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const db = await connectToDatabase();

        // Check if the user exists before deleting
        const user = await db.collection('users').findOne({ email: mail }, {password: password});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(user)
        res.status(200).json({ response: "Successful request", user: await db.collection('users').findOne({ email: email }, {password: password})})
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



//Create a new user account
router.post('/accounts/new-user', async (req, res) => {
    // const today = new Date(Date.now());
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

router.get("/get-mybusiness/:user", async (req, res) => {
    console.log(req.params.user)
    try {
        const db = await connectToDatabase();
        const business = await db.collection('users').findOne({ _id: new ObjectId(req.params.user) });
        res.status(200).json({ response: business });
    } catch (error) {
        // console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




//Create a new business account
router.post('/accounts/new-business', upload.fields([{ name: 'backgroundImage' }, { name: 'iconImage' }]), async (req, res) => {
    const businessData = req.body;
    const backgroundImage = req.files['backgroundImage'][0];
    const iconImage = req.files['iconImage'][0];

    // console.log('Business Data:', businessData);
    // console.log('Product Image:', backgroundImage);
    // console.log('Icon Image:', iconImage);

    // Further processing and saving data...
    // ownerName ownerSurname dateOfBirth email businessName location phone background facebook  instagram x  whatsapp  description password products productImage iconImage plan

    // res.json({ success: "Successful request", userId: "newUserId", user: db.collection('users').findOne({ email: email }, {password: password})  });
    try {
        const db = await connectToDatabase();
        const { ownerName, ownerSurname, dateOfBirth, email, businessName, location, phone,background, facebook, instagram, x, whatsapp, description, password, products, plan} = req.body;
        const result = await db.collection('users').insertOne({ ownerName, ownerSurname, dateOfBirth, email, businessName, location, phone,background, facebook, instagram, x, whatsapp, description, password, products, plan, backgroundImage, iconImage});

        if (result.acknowledged) {
            res.status(200).json({ response: "Successful request", user: await db.collection('users').findOne({ email: email }, {password: password})}); // Return the inserted document
            // console.log( await db.collection('users').findOne({ email: email }, {password: password}))
        }
        else {
            res.status(500).json({ error: 'Failed to create user'});
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//Add new product
// router.post('/myBusiness/:business/add-new-product', upload.fields('image'), async (req, res) => {
//     console.log(req.body);

//     const iconImage = req.files['image'][0];
//     console.log("image "+iconImage)
    // try {
    //     const db = await connectToDatabase();
    //     const { productName, productPrice, productType, productVideo, productDescription, company} = req.body;
    //     const productFile = req.body.productImage ? req.body.productImage : null;
    //     const result = await db.collection('products').insertOne({ productName, productPrice, productType, productFile, productVideo, productDescription, company });


    //     if (result.acknowledged) {
    //         res.status(200).json({"response": "Successful request"}); // Return the inserted document
    //     }
    //     else {
    //         res.status(500).json({ "response": 'Failed to create product' });
    //     }
    // }
    // catch (error) {
    //     res.status(500).json({ "response": 'Internal Server Error' });
    // }
// });

router.post('/myBusiness/:business/add-new-product', upload.array('images', 5), async (req, res) => {
    console.log(req.body);
    const company = req.params.business;
    const products = req.files ? req.files : [];

    if (products.length < 1) {
        return res.status(400).json({ "response": "At least one image is required." });
    }
    else{
        try {
            const db = await connectToDatabase();
            const { productName, productPrice, productType, productVideo, productDescription } = req.body;
            
            // Collect file names and paths
            // products.forEach(p =>{
            //     console.log("image"+p)
            // })
            // console.log(productFiles)
    
            const result = await db.collection('products').insertOne({
                productName,
                productPrice,
                productType,
                productVideo,
                productDescription,
                company,
                products
            });
    
            if (result.acknowledged) {
                res.status(200).json({ "response": "Successful request"}); // Return the inserted document
            } else {
                res.status(500).json({ "response": 'Failed to create product' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ "response": 'Internal Server Error' });
        }
    }
});


router.get("/mybusiness/products/all-product/:user", async (req, res) => {
    // console.log(req.params.user)
    try {
        const db = await connectToDatabase();
        const products = await db.collection('products').find({company: req.params.user}).toArray();
        console.log(products)
        res.status(200).json({ response: products });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get("/mybusiness/annnouncements", async (req, res) =>{
    // console.log(req)
    try {
        const db = await connectToDatabase();
        const announcement = await db.collection('announcements').find().toArray();
        // console.log(announcement)
        res.status(200).json({ response: announcement });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.delete('mybusiness/products/all-product/delete/:business/:product', async (req, res) => {
    const id = req.params.product;
    const business = req.params.business;

    console.log(id +" "+business)
});


//Create a new Special Item
router.post('/mybusiness/:business/new-special', async (req, res) => {
    // const today = new Date(Date.now());
    console.log(req.body)
    const company = req.params.business;
    try {
        const db = await connectToDatabase();
        const { productId, startDate, endDate, targetBuyers} = req.body;
        const result = await db.collection('specials').insertOne({ productId, company, targetBuyers, startDate, endDate });

        if (result.acknowledged) {
            res.status(200).json(req.body); // Return the inserted document
        }
        else {
            res.status(500).json({ error: 'Failed to create Special' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get("/mybusiness/:business/all-specials", async (req, res) => {
    console.log(req.params.business)
    try {
        const db = await connectToDatabase();
        const specials = await db.collection('specials').find({company: req.params.business}).toArray();
        console.log(specials)
        res.status(200).json({ response: specials });
    } catch (error) {
        // console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/mybusiness/products/all-product/update/:userId/:productId', upload.array('image'), async (req, res) => {
    const { userId, productId } = req.params;
    const { productName, productPrice, productType, productVideo, productDescription } = req.body;
    const products = req.files ? req.files : [];

    try {
        // Handle image uploads, e.g., saving paths to the database
        const imagePaths = images.map(image => image.path);

        // Find the product by ID and update it
        const updatedProduct = await db.findByIdAndUpdate(
            productId,
            {
                productName,
                productPrice,
                productType,
                productVideo,
                productDescription,
                products, // Update the image paths
            },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;