const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
// get dishes
function list(req, res) {
  res.json({ data: dishes });
}

//validation checks for post method
//check each property needed to create a new note is in request body
function bodyHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Must include a ${propertyName} property` });
  };
}

//validation check for string type request properties, strings cannot be empty
function propEmpty(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName].length > 0) {
      return next();
    }
    next({ status: 400, message: `Dish must include a ${propertyName}` });
  };
}

//validate price is greater than 0
function validatePriceIsNumber(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
  next();
}

// post dish
function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(), //use function from /utils to assign new id
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

//validate dish exists
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({ status: 404, message: `Dish not found: ${dishId}` });
}

// get a single dish
function read(req, res) {
  res.json({ data: res.locals.dish });
}

//validate input dishId from body and param dishId match if input dishId is present in body
function validateDishId(req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;
  if (!id || id === dishId) {
    res.locals.dishId = dishId;
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}

// edit an existing dish
function update(req, res) {
  const { data: { name, description, image_url, price } = {} } = req.body;

  //update dish
  res.locals.dish = {
    id: res.locals.dishId,
    name,
    description,
    price,
    image_url,
  };

  res.json({ data: res.locals.dish });
}

module.exports = {
  list,
  create: [
    bodyHas("name"),
    bodyHas("description"),
    bodyHas("image_url"),
    bodyHas("price"),
    propEmpty("name"),
    propEmpty("description"),
    propEmpty("image_url"),
    validatePriceIsNumber,
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    validateDishId,
    bodyHas("name"),
    bodyHas("description"),
    bodyHas("image_url"),
    bodyHas("price"),
    propEmpty("name"),
    propEmpty("description"),
    propEmpty("image_url"),
    validatePriceIsNumber,
    update,
  ],
};
