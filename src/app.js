const express = require('express');
const bodyParser = require('body-parser');
const youtubeRoutes = require('./routes/youtubeRoutes');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Use the cors middleware with your optionsapp.use(bodyParser.json());
app.use('/api', youtubeRoutes);



app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});