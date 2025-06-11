# HR IntelliHub - Frontend

This is the frontend application for HR IntelliHub, providing a user interface to interact with the AI-powered HR dashboard.

## Technology Stack

*   **React:** JavaScript library for building user interfaces.
*   **TypeScript:** Superset of JavaScript adding static typing.
*   **Vite:** Fast frontend build tool and development server.
*   **Tailwind CSS:** Utility-first CSS framework (inferred from class names in the code).

## Prerequisites

*   Node.js (v18.x or later recommended)
*   npm (or Yarn)

## Setup Instructions

1.  **Clone the Repository (if not already done):**
    ```bash
    git clone <repository-url>
    cd <repository-url>/frontend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Environment Variables:**
    *   In the `frontend/` directory, create a `.env` file by copying the example:
        ```bash
        cp .env.example .env
        ```
    *   Open the `.env` file and configure the `VITE_API_BASE_URL` variable:
        *   `VITE_API_BASE_URL`: The full base URL of your running backend API.
            *   For local development, if your backend is on port `3001`, this will be `http://localhost:3001/api`.
            *   For a deployed backend, use its production URL.

## Running the Development Server

Once setup is complete, you can run the frontend development server:

```bash
npm run dev
```
This command uses Vite to serve the application with Hot Module Replacement (HMR).
The server will typically start on `http://localhost:5173` (Vite's default). Open this URL in your browser.

## Building for Production

To create an optimized static build for production:

```bash
npm run build
```
This will generate static assets (HTML, CSS, JavaScript) in the `frontend/dist/` directory. These files can then be deployed to any static hosting service.
