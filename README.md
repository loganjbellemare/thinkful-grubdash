# Thinkful Grubdash Project

This project is an exercise in building robust, RESTful APIs with Express servers. We were to build the backend server for a Doordash/GrubHub clone app.

## To Run -

run `npm i` to install dependencies  
run `npm start` to start server with Node  
run `npm run start:dev` to start server with Nodemon

This app manages two resources, dishes and orders. My task was to implement middleware and route handlers to provide a client the ability to CRUDL any available resoure. All data stored as arrays in `/data` subdirectory.

## Dishes

> Dishes resource manages all dishes available on Grubdash app
> There are two major routes to handle state of dishes, `/dishes` and `/dishes/:dishId`. Files related to dishes are in `dishes` subdirectory.

1. `/dishes` Route
   - `GET` method returns all available dishes
   - `POST` method allows user to create a new dish, while validating that all necessary properties are present and in correct format in request body
     - method will return error if:
       - `name` is missing/empty
       - `description` is missing/empty
       - `price` is missing, less than 0, or not an integer
       - `image_url` is missing/empty
2. `/dishes/:dishId` Route
   - `GET` method returns a single dish whose id matches route parameter input
     - will return error if route parameter doesn't exist in data array
   - `PUT` method allows user to edit an existing dish, validating any necessary properties and formats from request body, and validating order exists in data array
     - will return error if:
       - any property that would cause `POST` method in `/dishes` route to return an error
       - route parameter doesn't exist in data array
       - id in request body doesn't match route parameter (if id in request body is present)

## Orders

> Orders resource manages all orders made on GrubDash app. There are also two major routes to handle the state of orders, and they follow the same shape as other urlpaths. Files related to orders are in `/orders` subdirectory.

1. `/orders` Route
   - `GET` method returns all orders in data array
   - `POST` method allows user to create a new order, while validating all necessary properties from request body are present and in correct format
     - will return error if:
       - `deliverTo` is missing/empty
       - `mobileNumber` is missing/empty
       - `dishes` is missing/not an array
       - any dish inside `dishes` array does not have a `quantity` property, or `quantity` is not an integer and greater than 0
2. `/orders/:orderId` Route
   - `GET` method returns a single order with id that matches id of route parameter
     - will return error if route parameter id does not exist in data array
   - `PUT` method allows users to update an existing order while validating request body, as long as order has not been delivered
     - will return error if:
       - any properties in request body would cause `GET` method to `/orders` route to throw an error
       - `status` does not equal 'delivered'
       - route parameter id and request body id do not match (if request body id is present)
       - route parameter id does not exist in data array
   - `DELETE` method allows user to delete an existing order, as long as it's `status` is 'pending'
     - will return error if:
       - `status` is not 'pending'
       - route parameter id does not exist in data array
