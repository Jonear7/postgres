const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');
const sequelize = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Test database connection
sequelize.authenticate()
    .then(() => console.log('Database connected'))
    .catch(err => console.error('Unable to connect to the database:', err));

// Sync database and start the server
sequelize.sync()
    .then(() => {
        app.use('/graphql', graphqlHTTP({
            schema,
            graphiql: true,
        }));

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}/graphql`);
        });
    })
    .catch(err => console.error('Error syncing database:', err));
