```markdown
## Documentation for `src/controllers/userController.js`

### Purpose & Overview

This file, `src/controllers/userController.js`, defines the controller layer for handling user-related requests in a Node.js application using the Prisma ORM. It provides functions to create, retrieve, and delete users.  It acts as the interface between the route handlers and the database, orchestrating data retrieval and modification using Prisma.

### Key Functions/Components

This file exports the following asynchronous functions, each designed to handle a specific user-related operation:

*   **`createUser(req, res)`**: Creates a new user in the database.
*   **`getAllUsers(req, res)`**: Retrieves all users from the database.
*   **`getUserById(req, res)`**: Retrieves a specific user from the database based on their ID.
*   **`deleteUser(req, res)`**: Deletes a user from the database based on their ID.

### Business Logic (if applicable)

The business logic within this file primarily involves interacting with the Prisma ORM to perform CRUD (Create, Read, Update, Delete) operations on the `User` model.  Key aspects include:

*   **Data Validation:** Implicit data validation occurs through Prisma's schema definition and type checking when creating a new user.  However, more explicit validation within the controller might be desirable for production environments (e.g., checking email format, password strength).
*   **Error Handling:** Each function includes a `try...catch` block to handle potential errors during database interactions. Errors are caught, and an appropriate HTTP status code and error message are sent in the response.
*   **Data Transformation:** The controller is responsible for parsing the request body (`req.body`) to extract user data and formatting the response data before sending it back to the client.
*   **Inclusion of Related Data:** The `getAllUsers` and `getUserById` functions include the `posts` and `sessions` relations in the result. This allows fetching associated posts and sessions in the same query, improving efficiency.

### Input/Output Specifications

Each function expects a request (`req`) and response (`res`) object as arguments, typical for Express.js middleware.

*   **`createUser(req, res)`:**
    *   **Input (req):**  `req.body` should contain a JSON object with `email` (string) and `password` (string) properties.
    *   **Output (res):**
        *   **Success (201 Created):**  JSON object representing the newly created user, including its ID and other properties.
        *   **Error (400 Bad Request):** JSON object with an `error` property containing the error message.  This usually indicates validation failures or database constraints.

*   **`getAllUsers(req, res)`:**
    *   **Input (req):** None.
    *   **Output (res):**
        *   **Success (200 OK):** JSON array containing all users in the database. Each user object includes its properties as well as `posts` and `sessions` relations.
        *   **Error (500 Internal Server Error):** JSON object with an `error` property containing the error message.  Indicates a problem fetching users from the database.

*   **`getUserById(req, res)`:**
    *   **Input (req):**  `req.params` should contain an `id` parameter representing the user's ID (as a string).
    *   **Output (res):**
        *   **Success (200 OK):** JSON object representing the user with the specified ID, including its properties as well as `posts` and `sessions` relations.
        *   **Error (404 Not Found):** JSON object with an `error` property containing the message "User not found".
        *   **Error (500 Internal Server Error):** JSON object with an `error` property containing the error message. Indicates a problem fetching the user from the database.

*   **`deleteUser(req, res)`:**
    *   **Input (req):**  `req.params` should contain an `id` parameter representing the user's ID (as a string).
    *   **Output (res):**
        *   **Success (200 OK):** JSON object with a `message` property containing the message "User deleted".
        *   **Error (500 Internal Server Error):** JSON object with an `error` property containing the error message. Indicates a problem deleting the user from the database.

### Usage Examples

Assuming you have an Express.js application set up and have imported these controller functions:

```javascript
// Example using Express.js
import express from 'express';
import { createUser, getAllUsers, getUserById, deleteUser } from './controllers/userController.js';

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Route to create a new user
app.post('/users', createUser);

// Route to get all users
app.get('/users', getAllUsers);

// Route to get a user by ID
app.get('/users/:id', getUserById);

// Route to delete a user by ID
app.delete('/users/:id', deleteUser);

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
```

**Example Requests:**

*   **Create User (POST /users):**
    ```json
    // Request Body:
    {
      "email": "test@example.com",
      "password": "password123"
    }
    ```

*   **Get All Users (GET /users):** No request body needed.

*   **Get User by ID (GET /users/123):** No request body needed.  `123` would be the user's ID.

*   **Delete User (DELETE /users/123):** No request body needed. `123` would be the user's ID.

### Dependencies

*   **Prisma ORM:** This controller relies heavily on Prisma to interact with the database.  You must have Prisma set up and configured correctly. The `prisma` client is imported from `./prismaClient.js`. This file is expected to initialize and export the Prisma client instance.
*   **Node.js & Express.js:**  This controller is designed to be used within a Node.js application and integrates seamlessly with Express.js for handling HTTP requests and responses.

### Important Notes

*   **Error Handling:** The error handling is basic. In a production environment, you should implement more robust error logging and reporting.  Consider using a logging library like Winston or Morgan.
*   **Security:**  The code stores passwords in plain text (based on context that password is "password").  This is a major security vulnerability. **Always hash passwords before storing them in the database.** Use a library like `bcrypt` or `argon2` for this purpose. You would need to update the `createUser` function to hash the password before saving it to the database.
*   **Validation:** Input validation is minimal.  You should add more comprehensive validation to prevent invalid data from being stored in the database.  Consider using a library like `joi` or `express-validator`.
*   **Authentication & Authorization:** This controller only handles basic user CRUD operations. You'll need to implement authentication and authorization mechanisms to protect your API endpoints and ensure that users can only access their own data.  Libraries like `Passport.js` can be useful.
*   **Prisma Client:** Ensure the `prismaClient.js` file correctly sets up the Prisma client and connects to your database.  The Prisma client must be initialized before the controller functions are called.
*   **Data Types:**  The controller assumes that the `id` parameter in the route is a number.  It uses `Number(id)` to convert the string ID to a number. Ensure that your database schema uses numeric IDs.
*   **Scalability:** For large applications, consider implementing pagination for the `getAllUsers` function to avoid returning a large number of users at once.
*   **Transactions:** For operations involving multiple database updates, use Prisma's transaction feature to ensure data consistency.

```
