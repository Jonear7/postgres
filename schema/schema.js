// schema/schema.js
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
} = require('graphql');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Define the User Type
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        username: { type: GraphQLString },
        email: { type: GraphQLString },
    }),
});

// Define Root Query
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parent, args) {
                return User.findByPk(args.id);
            },
        },
    },
});

// Define Mutations
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        register: {
            type: UserType,
            args: {
                username: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString },
            },
            async resolve(parent, args) {
                const { username, email, password } = args;
                const hashedPassword = await bcrypt.hash(password, 10);
                const user = await User.create({ username, email, password: hashedPassword });
                return user;
            },
        },
        login: {
            type: GraphQLString, // We will return a JWT token
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString },
            },
            async resolve(parent, args) {
                const { email, password } = args;
                const user = await User.findOne({ where: { email } });

                if (!user) {
                    throw new Error('User not found');
                }

                const isMatch = await bcrypt.compare(password, user.password);

                if (!isMatch) {
                    throw new Error('Invalid credentials');
                }

                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                return token;
            },
        },
    },
});

// Export the schema
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});
