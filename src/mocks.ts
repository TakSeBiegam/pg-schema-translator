export const MockSchema = {
  full: `
    type Post{
      name: String!
      content: String!
      createdAt: String!
      comments: Comment!
    }
    
    type Comment {
      title: String!
      isLiked: Likes!
    }
    
    type Likes {
      Liked: Boolean!
      Loved: Boolean!
    }
    
    type Query{
      publicQuery: PublicQuery
      userQuery: UserQuery
    }
    
    type PublicQuery{
      version: String!
    }
    
    type User {
      username: String! @constraint(format: "^[0-9a-zA-Z]*$")
      nickname: String! @constraint(maxLength: 2137)
      sex: SEX
      friends: [String!]!
    }
    
    type UserQuery {
      me: User!
      getPost(
        id: String!
      ): Post!
    }
    
    enum SEX {
      M
      F
    }
    
    schema {
      query: Query
    }`,
  simple: `
    type Query {
        currentVersion: String!
    }
    schema {
        query: Query
    }`,
};
