const express = require('express')
const app = express();
const db = require('./db');
const cors = require('cors');
require('dotenv').config();

const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // req.body
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',  // Set FRONTEND_URL in EB
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("Backend is running ");
});


// Import the router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

// Use the routers
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);


app.listen(PORT, ()=>{
    console.log(`Serever is live and listening to ${PORT}`);
})