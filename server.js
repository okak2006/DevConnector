const express = require('express');
const connectDB = require('./config/db.js');

const app = express();
// Init middleware
app.use(express.json({ extended: false }));
// Set up routes
require('./routes')(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Server started on port ${PORT}`));

connectDB();