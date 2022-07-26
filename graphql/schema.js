const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type PostData {
        posts: [Post!]!
        totalItems: Int!
    }

    type Result {
        result: Boolean!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    type Status {
        status: String!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
        updatePost(id: ID!, postInput: PostInputData!): Post!
        deletePost(id: ID!): Result!
        updateStatus(newStatus: String!): Result!
    }

    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        posts(pageNumber: Int!): PostData!
        post(id: String!): Post!
        userStatus: Status!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }

`);