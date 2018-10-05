Your tables: what columns will they have? How will they connect to one another?
- There is a user table, posts table and comments table.
- The users table has the following columns: id, first name, lastname, email and password
- The posts table has the following columns: id, title, body, userId
- The comments table has the following columns: id, comment, postId


Make a diagram showing the relationships between tables.
- Each user can have many posts which is a One-to-Many relationship
- Each post can have many comments which is a One-to-Many relationship

Your routes: what routes should you have? What should each route do?
- The home page has an Index route with a get request
- The login page has an New route --> show login form with a post and get request
- The register page has an New route and Create route with a post and get request
- The create post page has a New route and Create route with a post and get request
- The own posts and all posts page has a Show route with a get request
- The logout page has a Destroy route with a get request

Once you are done designing your application, then proceed with coding.
Submit this document in a text file as part of your application.