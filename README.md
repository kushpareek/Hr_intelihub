# HR IntelliHub

HR IntelliHub is an AI-powered dashboard designed to streamline various Human Resources tasks, from candidate sourcing and management to policy inquiries and onboarding/offboarding processes. It leverages AI to provide insights, automate communications, and assist HR professionals in their daily workflows.

## Project Structure

This repository is a monorepo containing two main projects:

*   `frontend/`: A React application built with TypeScript and Vite, providing the user interface.
*   `backend/`: A Node.js application built with Express.js and TypeScript, serving as the API and business logic layer, and interacting with a PostgreSQL database and Google's Gemini AI.

## Key Features

*   **AI-Assisted HR Tasks:** Email summarization, job description analysis, offer letter review, communication drafting, policy queries.
*   **Candidate Management:** Sourcing candidates (conceptual, with AI task creation), manual candidate entry, and tracking.
*   **Job Postings:** Creating and managing job listings.
*   **Policy Center:** Storing and querying company policies with AI assistance.
*   **Onboarding & Offboarding:** Tracking employee onboarding tasks and offboarding cases.
*   **Task Management:** An AI worker monitor to view and manage automated tasks.
*   **Admin Dashboard:** For managing client subscriptions and support queries.
*   **Subscription Tiers:** Role-based access control for features based on user subscription plans.

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Git](https://git-scm.com/)
*   [Node.js](https://nodejs.org/) (v18.x or later recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js) or [Yarn](https://yarnpkg.com/)
*   [PostgreSQL](https://www.postgresql.org/download/) (for the backend database)
*   Access to a [Google Gemini API Key](https://ai.google.dev/) (for AI features)

## Setup and Running

For detailed setup and running instructions, please refer to the README files within each project directory:

*   [Backend Setup Instructions](./backend/README.md)
*   [Frontend Setup Instructions](./frontend/README.md)

## Contributing

(Placeholder for contribution guidelines if this were a public open-source project)

## License

(Placeholder for license information, e.g., MIT License)
