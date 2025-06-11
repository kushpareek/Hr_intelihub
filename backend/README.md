# HR IntelliHub - Backend

This backend serves the HR IntelliHub application, providing APIs for data management, user authentication, AI interactions, and more.

## Technology Stack

*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Web application framework for Node.js.
*   **TypeScript:** Superset of JavaScript adding static typing.
*   **PostgreSQL:** Relational database.
*   **JWT (JSON Web Tokens):** For user authentication.
*   **bcrypt:** For password hashing.
*   **Google Generative AI SDK:** For interacting with Gemini models.

## Prerequisites

*   Node.js (v18.x or later recommended)
*   npm (or Yarn)
*   PostgreSQL server installed and running.
*   A Google Gemini API Key.

## Setup Instructions

1.  **Clone the Repository (if not already done):**
    ```bash
    git clone <repository-url>
    cd <repository-url>/backend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Database Setup:**
    *   Ensure your PostgreSQL server is running.
    *   Connect to PostgreSQL (e.g., using `psql` or a GUI tool like pgAdmin).
    *   Create the database. The default name used in `.env.example` is `hr_intellihub_db`.
        ```sql
        CREATE DATABASE hr_intellihub_db;
        ```
    *   Connect to your newly created database (e.g., `\c hr_intellihub_db` in `psql`).
    *   Run the schema script to create tables. The script is located at `src/config/schema.sql`.
        *   If using `psql`, you can run: `\i /path/to/your/clone/backend/src/config/schema.sql`
        *   Alternatively, you can copy and paste the content of `schema.sql` into your SQL client and execute it.

4.  **Environment Variables:**
    *   In the `backend/` directory, create a `.env` file by copying the example:
        ```bash
        cp .env.example .env
        ```
    *   Open the `.env` file and fill in the required values:
        *   `PORT`: The port the backend server will run on (default: `3001`).
        *   `DB_USER`, `DB_HOST`, `DB_DATABASE`, `DB_PASSWORD`, `DB_PORT`: Your PostgreSQL connection details. Ensure `DB_DATABASE` matches the database you created.
        *   `JWT_SECRET`: A strong, random string for signing JWTs. You can generate one using a password generator.
        *   `JWT_EXPIRES_IN`: Token expiration time (e.g., `1h`, `7d`).
        *   `GEMINI_API_KEY`: Your Google Gemini API key.
        *   `CORS_ORIGIN`: The URL of your frontend application (e.g., `http://localhost:5173` for local development).

5.  **Ensure `pgcrypto` extension (if not enabled by default on your PostgreSQL setup):**
    The `schema.sql` attempts to create it (`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`). If you encounter issues with `gen_random_uuid()`, ensure this extension is available and enabled in your database.

## Running the Development Server

Once setup is complete, you can run the backend development server:

```bash
npm run dev
```
This command uses `ts-node-dev` to run the TypeScript code directly and automatically restart the server on file changes.
The server will typically start on the port specified in your `.env` file (default: `http://localhost:3001`).

## Building for Production

To create an optimized JavaScript build for production:

```bash
npm run build
```
This will compile the TypeScript code into the `dist/` directory.

To run the production build:

```bash
npm start
```
This executes `node dist/index.js`. Ensure your production environment variables are set.

## API Endpoints

The backend exposes various RESTful API endpoints under the `/api` prefix. Key groups include:
*   `/api/auth`: User registration and login.
*   `/api/candidates`, `/api/jobpostings`, `/api/policies`, etc.: CRUD operations for core HR features.
*   `/api/ai`: Endpoints for AI-assisted functionalities.
*   `/api/admin`: Endpoints for administrator-specific actions (e.g., managing client subscriptions).

Refer to the route files in `src/routes/` and controller files in `src/controllers/` for detailed endpoint definitions and logic.
