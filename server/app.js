const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const sequelize = require('./src/config/database');
const routes = require('./src/routes');
require('dotenv').config();

// Import models to ensure relations are defined
require('./src/models/User');
require('./src/models/Plan');
require('./src/models/Quest');
require('./src/models/CheckIn');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({ code: 200, data: {}, msg: '10Days Server is running' });
});

app.use('/api', routes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ code: 500, data: {}, msg: 'Internal Server Error' });
});

// Database connection and server start
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully (Sequelize).');
        
        // Sync models (Dev only: force: true drops tables, alter: true updates schema)
        // await sequelize.sync({ alter: true }); 
        await sequelize.sync(); 

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
