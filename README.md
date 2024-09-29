## Exam #1: "Ticketing system"

### Student: s327443 Bedini Niccolò

## React Client Application Routes

- **Route /**: Home page, shows the list of all tickets. Logged-in users can also expand the ticket and see the relative comments(textBlock).
- **Route /login**: Login form, allows users to log in. After a successful login, the user is redirected to the main route ("/").
- **Route /addTicket**: Add ticket form, allows authenticated users to add a new Ticket in the system. After a successful insert, the user is redirected to the main route ("/").
- **Route /addTextBlock/:ticketId**: Add textBlock (comment) form, allows authenticated users to add a comment on an open Ticket. After a successful insert, the user is redirected to the main route ("/").
- **Route \***: Page for nonexisting URLs (Not Found page) that redirects to the home page.

## API Server

### GET /api/tickets

Get all the tickets as a JSON list.

- **Response body**: JSON object with the list of tickets without their description (no logged-in user can see them), or description of the error(s):
  ```json
  [
    {
      "id": 1,
      "title": "Maintenance Issue 1",
      "category": "maintenance",
      "state": "Closed",
      "owner": "admin1",
      "ownerId": 1,
      "date": "2024-05-15 14:45:00"
    },
    ...
  ]
  ```
- **Codes**: 200 OK, 500 Internal Server Error.

### GET /api/tickets/:id

Get a specific ticket by ID.

- **Response body**: JSON object with the ticket details, or description of the error(s):
  ```json
  {
    "id": 1,
    "title": "Inquiry Issue 1",
    "description": "Description of Inquiry Issue 1",
    "category": "inquiry",
    "state": "Open",
    "owner": "admin1",
    "ownerId": 1,
    "date": "2024-06-01 08:15:30"
  }
  ```
- **Codes**: 200 OK, 404 Not Found, 422 Unprocessable Entity, 500 Internal Server Error.

### GET /api/tickets/:id/textBlocks

Get all text blocks of a specific ticket and the description of the ticket.

- **Response body**: JSON object with the ticket description and list of text blocks, or description of the error(s):
  ```json
  {
    "ticketDescription": "Cannot log in with my account",
    "textBlock_list": [
      {
        "id": 2,
        "text": "First text block for New Feature Issue 1 with.",
        "author": "admin2",
        "authorId": 2,
        "date": "2024-06-02 09:35:15"
      },
      ...
    ]
  }
  ```
- **Codes**: 200 OK, 404 Not Found, 422 Unprocessable Entity, 500 Internal Server Error.

### POST /api/tickets

Create a new ticket.

- **Request body**: JSON object with the ticket details:
  ```json
  {
    "title": "Issue with login",
    "description": "Cannot log in with my account",
    "state": "Open",
    "category": "maintenance"
  }
  ```
- **Response body**: JSON object with the newly created ticket, or description of the error(s):
  ```json
  {
    "id": 2,
    "title": "Issue with login",
    "description": "Cannot log in with my account",
    "state": "Open",
    "category": "maintenance",
    "ownerId": 1,
    "owner": "admin1",
    "date": "2023-06-28 16:10:00"
  }
  ```
- **Codes**: 201 Created, 401 Unauthorized, 422 Unprocessable Entity, 500 Internal Server Error.

### POST /api/tickets/:id/textBlocks

Add a new text block to a ticket.

- **Request body**: JSON object with the text block details:
  ```json
  {
    "text": "Tried resetting the password but still doesn't work."
  }
  ```
- **Response body**: JSON object with the newly created text block, or description of the error(s):
  ```json
  {
    "id": 3,
    "text": "Tried resetting the password but still doesn't work.",
    "author": "admin2",
    "authorId": 2,
    "ticketId": 1,
    "date": "2023-06-28 16:30:00"
  }
  ```
- **Codes**: 201 Created, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity, 500 Internal Server Error.

### PUT /api/tickets/:id/state

Update the state of a ticket.

- **Request body**: JSON object with the new state:
  ```json
  {
    "state": "Closed"
  }
  ```
- **Response body**: Number of rows changed, or description of the error(s):
  ```json
  1
  ```
- **Codes**: 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found, 422 Unprocessable Entity, 500 Internal Server Error.

### PUT /api/tickets/:id/category

Update the category of a ticket.

- **Request body**: JSON object with the new category:
  ```json
  {
    "category": "administrative"
  }
  ```
- **Response body**: Number of rows changed, or description of the error(s):
  ```json
  1
  ```
- **Codes**: 200 OK, 400 Bad Request, 401 Unauthorized, 422 Unprocessable Entity, 500 Internal Server Error.

## Authentication APIs

### POST /api/sessions

Authenticate and log in the user.

- **Request body**: JSON object with username and password:
  ```json
  {
    "username": "admin1@webapp.com",
    "password": "admin1"
  }
  ```
- **Response body**: JSON object with the user's info or a description of the errors:
  ```json
  {
    "id": 1,
    "admin": 1,
    "username": "admin1@webapp.com",
    "name": "admin1"
  }
  ```
- **Codes**: 200 OK, 401 Unauthorized (incorrect username and/or password), 500 Internal Server Error.

### DELETE /api/sessions/current

Log out the user.

- **Codes**: 200 OK, 401 Unauthorized.

### GET /api/sessions/current

Check whether the user is logged in or not.

- **Response body**: JSON object with the user's info:
  ```json
  {
    "id": 1,
    "admin": 1,
    "username": "admin1@webapp.com",
    "name": "admin1"
  }
  ```
- **Codes**: 200 OK, 401 Unauthorized, 500 Internal Server Error.

## Token API

### GET /api/auth-token

Returns an auth token for the logged-in user.

- **Response body**: JSON object with token
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6MSwiYXV0aElkIjoxLCJpYXQiOjE3MTk3Mzk1MDIsImV4cCI6MTcxOTczOTU2Mn0.j8id7je4cj3xuyOgO5-dkY38ApSKpkzSmMsP8UYdVew",
    "admin": true
  }
  ```
- **Codes**: 200 OK, 401 Unauthorized.

## API Server 2

### POST `/api/estimation`

Estimates the required time for the provided tickets (just the open ticket are sent) based on the admin status.

- **Request Headers**: JWT token
- **Request Body**: JSON object containing an array of tickets
  ```json
  {
    "info": [
      { "id": 1, "title": "Fix login issue", "category": "inquiry" },
      { "id": 2, "title": "Add new feature", "category": "new feature" }
    ]
  }
  ```
- **Response Body**: JSON object with estimated hours or days for each ticket

  - For admin users:
    ```json
    {
      "estimations": [
        { "id": 1, "hour": 260 },
        { "id": 2, "hour": 360 }
      ]
    }
    ```
  - For non-admin users:
    ```json
    {
      "estimations": [
        { "id": 1, "day": 11 },
        { "id": 2, "day": 15 }
      ]
    }
    ```

- **Error Codes**:
  - `200 OK`: Successfully returned the estimations.
  - `401 Unauthorized`: Authorization error (e.g., invalid or expired token).
  - `400 Bad Request`: Invalid request body.

## Database Tables

- **Table `users`**:

  - _id_ (INTEGER, primary key, autoincrement): Unique ID of the user.
  - _admin_ (BOOLEAN): Indicates if the user has administrator privileges.
  - _email_ (TEXT): Email address of the user.
  - _name_ (TEXT): Name of the user.
  - _salt_ (TEXT): Salt used for password hashing.
  - _password_ (TEXT): User's password hash.

- **Table `ticket`**:

  - _id_ (INTEGER, primary key, autoincrement): Unique ID of the ticket.
  - _category_ (TEXT): Category of the ticket (e.g., inquiry, maintenance, new feature).
  - _state_ (TEXT): Current state of the ticket ( Open or Closed).
  - _owner_id_ (INTEGER): ID of the user who owns the ticket.
  - _title_ (TEXT): Title of the ticket.
  - _description_ (TEXT): Detailed description of the ticket.
  - _date_ (DATETIME): Creation date of the ticket.

- **Table `text_block`**:
  - _id_ (INTEGER, primary key, autoincrement): Unique ID of the text block.
  - _text_ (TEXT): Content of the text block.
  - _author_id_ (INTEGER): ID of the author of the text block (corresponding to the user ID).
  - _date_ (DATETIME): Creation date of the text block.
  - _ticket_id_ (INTEGER): ID of the ticket to which the text block belongs.

The `users` and `ticket` tables are designed to manage users and tickets within the system. The `text_block` table stores text blocks associated with tickets, referencing users and specific tickets through `author_id` and `ticket_id` fields.

## Main React Components

- `App` (in `App.jsx`): The main component that manages the application state, user login, and coordinates data retrieval through API calls. It also handles routing logic to display different sections of the application.
- `Layout` (in `App.jsx`): A component defining the basic structure of the user interface, including the header (used also to display messages) and the footer. It uses Container, Row, and Col from React-Bootstrap to organize elements.
- `TicketList` (in `TicketComponents.jsx`): Manages multiple tickets displayed in rows. Includes an "Add Ticket" button for logged-in users and renders each ticket using the Ticket component. Handles initial loading state and navigation for adding new tickets.
- `Ticket` (in `TicketComponents.jsx`): Represents an individual ticket displayed with a Card. Features include expanding to show details and managing state changes and category updates for authorized users. Admins can change categories and update ticket states. It also displays associated comments displayed in a card as well.
- `TextBlockForm` (in `TextBlockForm.jsx`): Handles the form for adding comments to a specific ticket (ticketId). Includes state management for text input (text), loading state for a reactive interface (loading), and error messages (errorMsg). Features include form validation, submission of text blocks, and navigation controls (navigate). Displays alerts for validation errors and handles user authentication (loggedIn).
- `TicketForm` (in `TicketForm.jsx`): Manages the form for adding a new ticket. Allows users to input a title, select a category, and provide a description. Features include form validation, confirmation step (isConfirming), and handling of loading states (loading). Users receive a prediction of closure time based on selected category and title.
- `LoginForm` (in `LoginComponents.jsx`): Manages the user login process with fields for username (email) and password. Handles form submission, authentication via API (API.login), and error handling for incorrect credentials.

## Screenshot

![Screenshot](./img/screenshot.png)

![Screenshot](./img/screenshot2.png)

## Users Credentials

| email             | password | name   | admin |
| ----------------- | -------- | ------ | ----- |
| admin1@webapp.com | admin1   | admin1 | 1     |
| admin2@webapp.com | admin2   | admin2 | 1     |
| user1@webapp.com  | user1    | user1  | 0     |
| user2@webapp.com  | user2    | user2  | 0     |
| user3@webapp.com  | user3    | user3  | 0     |
