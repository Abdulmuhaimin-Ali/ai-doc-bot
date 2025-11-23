```markdown
## Purpose & Overview

The `src/controllers/postController.js` file defines the controller layer for handling operations related to posts in an application. It uses Prisma Client to interact with the database and perform CRUD (Create, Read, Update, Delete) operations on the `Post` model.  Specifically, it provides functions for creating new posts, retrieving all posts, retrieving posts by a specific user, and deleting posts. The file is designed to be used in a REST API context, handling HTTP requests and responses related to post management.

## Key Functions/Components

This file exports the following asynchronous functions:

*   **`createPost(req, res)`:** Creates a new post.
*   **`getAllPosts(req, res)`:** Retrieves all posts from the database, including associated user data.
*   **`getPostsByUser(req, res)`:** Retrieves all posts created by a specific user, based on the user ID provided in the request parameters.
*   **`deletePost(req, res)`:** Deletes a post based on its ID, provided in the request parameters.

## Business Logic (if applicable)

The business logic implemented in this file includes:

*   **Data validation (implicit):**  Assumes validation of input data (title, content, userId) is performed elsewhere (e.g., in middleware) before reaching the controller.  However, the `userId` is explicitly converted to a number.
*   **Error handling:** Uses `try...catch` blocks to handle potential errors during database operations, returning appropriate HTTP status codes (400 for bad requests, 500 for server errors) and error messages in the response.
*   **Database interaction:** Uses Prisma Client to interact with the database to perform CRUD operations on posts.
*   **User association:** When retrieving all posts, includes the associated user data in the response using Prisma's `include` option.
*   **ID parsing:** Parses the `userId` and `id` parameters from the request as integers using `Number()`. This is crucial because request parameters are typically strings.

## Input/Output Specifications

Each function takes `req` (request) and `res` (response) objects as arguments, typical of Express.js middleware.

*   **`createPost(req, res)`:**
    *   **Input (req.body):**
        *   `title` (string): The title of the post.
        *   `content` (string): The content of the post.
        *   `userId` (string or number): The ID of the user creating the post. Note that the controller converts this to a number.
    *   **Output (res):**
        *   **Success (201 Created):**  JSON representation of the created post object.
        *   **Error (400 Bad Request):**  JSON object with an `error` field containing the error message.

*   **`getAllPosts(req, res)`:**
    *   **Input (req):** None directly relevant to the function logic.
    *   **Output (res):**
        *   **Success (200 OK):**  JSON array of post objects, each including user data (if `include: { user: true }` is used in the Prisma query).
        *   **Error (500 Internal Server Error):** JSON object with an `error` field containing the error message.

*   **`getPostsByUser(req, res)`:**
    *   **Input (req.params):**
        *   `userId` (string): The ID of the user whose posts are to be retrieved.  The controller converts this to a number.
    *   **Output (res):**
        *   **Success (200 OK):** JSON array of post objects belonging to the specified user.
        *   **Error (500 Internal Server Error):** JSON object with an `error` field containing the error message.

*   **`deletePost(req, res)`:**
    *   **Input (req.params):**
        *   `id` (string): The ID of the post to be deleted. The controller converts this to a number.
    *   **Output (res):**
        *   **Success (200 OK):**  JSON object with a `message` field indicating successful deletion ("Post deleted").
        *   **Error (500 Internal Server Error):** JSON object with an `error` field containing the error message.

## Usage Examples

These examples assume you're using Express.js and a routing library to map URLs to these controller functions.

```javascript
// Example routes (using Express.js)
import express from 'express';
import { createPost, getAllPosts, getPostsByUser, deletePost } from './postController.js';

const router = express.Router();

router.post('/posts', createPost);  // Create a new post
router.get('/posts', getAllPosts);  // Get all posts
router.get('/posts/user/:userId', getPostsByUser); // Get posts by user ID
router.delete('/posts/:id', deletePost); // Delete a post by ID

export default router;
```

**Example `createPost` request (using `curl`):**

```bash
curl -X POST -H "Content-Type: application/json" -d '{"title": "My New Post", "content": "This is the content of my post.", "userId": "1"}' http://localhost:3000/posts
```

**Example `getAllPosts` request (using `curl`):**

```bash
curl http://localhost:3000/posts
```

**Example `getPostsByUser` request (using `curl`):**

```bash
curl http://localhost:3000/posts/user/1
```

**Example `deletePost` request (using `curl`):**

```bash
curl -X DELETE http://localhost:3000/posts/123
```

## Dependencies

*   **Prisma Client:** Used for database interactions.  It is imported as `prisma` from "../prismaClient.js".
*   **Express.js:** (Implicit) Assumes the use of Express.js for handling HTTP requests and responses.

## Important Notes

*   **Error Handling:** The error handling is basic. More robust error handling (e.g., logging, more specific error codes) might be required for production environments.
*   **Validation:** Input validation is crucial. The controller currently assumes that the input data is valid.  You should implement proper validation, potentially using middleware, to ensure data integrity and prevent security vulnerabilities.  Consider validating:
    *   Presence of required fields (title, content, userId)
    *   Data types of fields (userId should be a number)
    *   Maximum lengths of strings (title, content)
    *   Whether the userId actually exists in the `User` table.
*   **Authentication/Authorization:**  This controller does not include any authentication or authorization logic. In a real application, you would need to implement authentication (verifying the user's identity) and authorization (determining what the user is allowed to do) to protect the endpoints and ensure that only authorized users can create, retrieve, or delete posts.
*   **Prisma Setup:**  Ensure that Prisma is properly configured and connected to your database. This includes having a `schema.prisma` file and running Prisma migrations to create the necessary database tables.  The `prismaClient.js` should contain the initialized Prisma client instance.
*   **Data Sanitization:**  Consider sanitizing user input to prevent cross-site scripting (XSS) vulnerabilities.
*   **Type Safety:**  For a more robust application, consider using TypeScript to add type safety to your code.
*   **Pagination:** For `getAllPosts` and `getPostsByUser`, consider implementing pagination to handle large numbers of posts efficiently.
*   **Transaction Management:** For more complex operations, consider using Prisma's transaction feature to ensure data consistency.
