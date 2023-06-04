## Company Routes

### Sign Up

-   Endpoint: `/signup`
-   Method: `POST`
-   Description: Creates a new user account.
-   Request Body:
    -   `name` (string): User's name.
    -   `email` (string): User's email address.
    -   `phone` (string): User's phone number.
    -   `password` (string): User's password.
    -   `passwordConfirm` (string): Confirmation of user's password.
    -   `passwordChangedAt` (string): Timestamp of when the password was last changed.
    -   `role` (string): User's role (e.g., "company").
    -   `country` (string): User's country.

### Login

-   Endpoint: `/login`
-   Method: `POST`
-   Description: Authenticates a user and generates a JSON web token (JWT) for authorization.
-   Request Body:
    -   `email` (string): User's email address.
    -   `password` (string): User's password.

### Forgot Password

-   Endpoint: `/forgotPassword`
-   Method: `POST`
-   Description: Sends a password reset token to the user's email address.
-   Request Body:
    -   `email` (string): User's email address.

### Reset Password

-   Endpoint: `/resetPassword/:token`
-   Method: `PATCH`
-   Description: Resets the user's password using the provided password reset token.
-   Request Parameters:
    -   `token` (string): Password reset token.
-   Request Body:
    -   `password` (string): User's new password.
    -   `passwordConfirm` (string): Confirmation of user's new password.

### Verify OTP

-   Endpoint: `/verifyOTP`
-   Method: `POST`
-   Description: Verifies the user's account using a one-time password (OTP) sent via email.
-   Request Body:
    -   `otp` (string): User's OTP.

### Verify Account

-   Endpoint: `/verify`
-   Method: `POST`
-   Description: Verifies the user's account based on their role and provided details.
-   Request Body:
    -   `bvn` (string): User's Bank Verification Number (BVN).
    -   `cac` (string): User's Corporate Affairs Commission (CAC) details.

### Verify CAC

-   Endpoint: `/users/company/verify-cac/:id`
-   Method: `PATCH`
-   Description: Verifies a company's Corporate Affairs Commission (CAC) details.
-   Request Parameters:
    -   `id` (string): Company ID.
-   Request Body:
    -   None

## Job Routes

### Create Job

-   Endpoint: `/`
-   Method: `POST`
-   Description: Creates a new job for a company.
-   Request Body:
    -   None

### Get Job

-   Endpoint: `/:id`
-   Method: `GET`
-   Description: Retrieves a specific job by ID.
-   Request Parameters:
    -   `id` (string): Job ID.

### Update Job

-   Endpoint: `/:id`
-   Method: `PATCH`
-   Description: Updates a specific job by ID.
-   Request Parameters:
    -   `id` (string): Job ID.
-   Request Body:
    -   None

### Delete Job

-   Endpoint: `/:id`
-   Method: `DELETE`
-   Description: Deletes a specific job by ID.
-   Request Parameters:
    -   `id` (string): Job ID.

### Get My Jobs

-   Endpoint: `/my-jobs`
-   Method: `GET`
-   Description: Retrieves all jobs associated with the authenticated user.

## Company Endpoints

### Get All Users

-   Endpoint: `/users/company`
-   Method: `GET`
-   Description: Get a list of all company users.
-   Authentication: Required (Access token required)
-   Response:
    -   Status: 200 (OK)
    -   Body: Array of user objects

### Get User

-   Endpoint: `/users/company/:id`
-   Method: `GET`
-   Description: Get details of a specific user by ID.
-   Authentication: Required (Access token required)
-   Response:
    -   Status: 200 (OK)
    -   Body: User object

### Delete User

-   Endpoint: `/users/company/:id`
-   Method: `DELETE`
-   Description: Delete a user account permanently.
-   Authentication: Required (Access token required)
-   Response:
    -   Status: 204 (No Content)

## Subscription Endpoints

### Get All Plans

-   Endpoint: `/plans`
-   Method: `GET`
-   Description: Get a list of all subscription plans.
-   Authentication: Required (Access token required)
-   Response:
    -   Status: 200 (OK)
    -   Body: Array of plan objects

### Create Plan

-   Endpoint: `/plans`
-   Method: `POST`
-   Description: Create a new subscription plan.
-   Authentication: Required (Access token required)
-   Request Body:
    -   `amount` (number, required): Amount of the plan.
    -   `name` (string, required): Name of the plan.
    -   `description` (string): Description of the plan.
-   Response:
    -   Status: 201 (Created)
    -   Body: Plan object

### Update Plan

-   Endpoint: `/plans/:id`
-   Method: `PATCH`
-   Description: Update a subscription plan by ID.
-   Authentication: Required (Access token required)
-   Request Body:
    -   `amount` (number): New amount of the plan.
    -   `name` (string): New name of the plan.
    -   `description` (string): New description of the plan.
-   Response:
    -   Status: 200 (OK)
    -   Body: Updated plan object

### Delete Plan

-   Endpoint: `/plans/:id`
-   Method: `DELETE`
-   Description: Delete a subscription plan by ID.
-   Authentication: Required (Access token required)
-   Response:
    -   Status: 204 (No Content)

### Admin Routes

#### Get All Jobs

-   Method: GET
-   Endpoint: `/admin/jobs`
-   Required Permissions: Admin
-   Description: Retrieve all jobs.
-   Response:
    -   Status: 200 (OK)
    -   Body: Array of job objects

#### Create Plan

-   Method: POST
-   Endpoint: `/admin/plans`
-   Required Permissions: Admin
-   Description: Create a new plan.
-   Request Body:
    -   `name` (string): The name of the plan.
    -   `description` (string): The description of the plan.
    -   `price` (number): The price of the plan.
-   Response:
    -   Status: 201 (Created)
    -   Body: Created plan object

#### Get All Plans

-   Method: GET
-   Endpoint: `/admin/plans`
-   Required Permissions: Admin
-   Description: Retrieve all plans.
-   Response:
    -   Status: 200 (OK)
    -   Body: Array of plan objects

#### Get Plan by ID

-   Method: GET
-   Endpoint: `/admin/plans/:id`
-   Required Permissions: Admin
-   Description: Retrieve a specific plan by ID.
-   Response:
    -   Status: 200 (OK)
    -   Body: Plan object

#### Delete Plan by ID

-   Method: DELETE
-   Endpoint: `/admin/plans/:id`
-   Required Permissions: Admin
-   Description: Delete a specific plan by ID.
-   Response:
    -   Status: 204 (No Content)

#### Get All Users (Companies)

-   Method: GET
-   Endpoint: `/admin/users/company`
-   Required Permissions: Admin
-   Description: Retrieve all users (companies).
-   Response:
    -   Status: 200 (OK)
    -   Body: Array of user objects

#### Get User (Company) by ID

-   Method: GET
-   Endpoint: `/admin/users/company/:id`
-   Required Permissions: Admin
-   Description: Retrieve a specific user (company) by ID.
-   Response:
    -   Status: 200 (OK)
    -   Body: User object

#### Delete User (Company) by ID

-   Method: DELETE
-   Endpoint: `/admin/users/company/:id`
-   Required Permissions: Admin
-   Description: Delete a specific user (company) by ID.
-   Response:
    -   Status: 204 (No Content)

#### Verify CAC (Corporate Affairs Commission)

-   Method: PATCH
-   Endpoint: `/admin/users/company/verify-cac/:id`
-   Required Permissions: Admin
-   Description: Verify a company's CAC (Corporate Affairs Commission) by ID.
-   Response:
    -   Status: 200 (OK)
    -   Body: Updated user object

### Rider Routes

#### Add Rider

-   Method: POST
-   Endpoint: `/riders`
-   Description: Add a new rider.
-   Request Body:
    -   `firstName` (string): The first name of the rider.
    -   `lastName` (string): The last name of the rider.
    -   `phone` (string): The phone number of the rider.
    -   `nationality` (string): The nationality of the rider.
-   Response:
    -   Status: 201 (Created)
    -   Body: Created rider object

#### Get My Riders

-   Method: GET
-   Endpoint: `/riders`
-   Description: Retrieve all riders associated with the authenticated company.
-   Response:
    -   Status: 200 (OK)
    -   Body: Array of rider objects