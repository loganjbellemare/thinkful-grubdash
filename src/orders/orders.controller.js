const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res, next) {
  res.json({ data: orders });
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    res.locals.order = foundOrder;
    next();
  }
  return next({ status: 404, message: `Order id not found: ${orderId}` });
}

function read(req, res, next) {
  res.json({ data: res.locals.order });
}

function bodyHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({
      status: 400,
      message: `Must include a ${propertyName} property`,
    });
  };
}

function hasDishes(req, res, next) {
  const { dishes } = req.body.data;
  if (Array.isArray(dishes) && dishes.length > 0) {
    res.locals.dishes = dishes;
    return next();
  }
  return next({ status: 400, message: `Order must include at least one dish` });
}

function hasQuantity(req, res, next) {
  const dishes = res.locals.dishes;
  const index = dishes.findIndex(
    (dish) =>
      dish.quantity <= 0 || !dish.quantity || !Number.isInteger(dish.quantity)
  );
  if (index != -1)
    return next({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0`,
    });

  return next();
}

function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  const id = nextId();

  const newOrder = {
    id,
    deliverTo,
    mobileNumber,
    status: "pending",
    dishes,
  };

  orders.push(newOrder);

  res.status(201).json({ data: newOrder });
}

function validateOrderId(req, res, next) {
  const { orderId } = req.params;
  if (!req.body.data.id) return next();

  if (req.body.data.id && req.body.data.id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${req.body.data.id}, Route: ${orderId}`,
    });
  }

  return next();
}

function validateDelete(req, res, next) {
  const { status } = res.locals.order;
  if (status === "pending") {
    return next();
  }
  next({
    status: 400,
    message: `An order cannot be deleted unless it is pending`,
  });
}

function validateStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  const acceptableStatuses = [
    "pending",
    "preparing",
    "out-for-delivery",
    "delivered",
  ];
  if (acceptableStatuses.includes(status)) {
    next();
  }
  next({
    status: 400,
    message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
  });
}

function update(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const order = res.locals.order;

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.dishes = dishes;
  order.status = status;

  res.json({ data: order });
}

function destroy(req, res) {
  const orderId = res.locals.orderId;
  const index = orders.findIndex((order) => order.id === orderId);
  const deletedOrder = orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  read: [orderExists, read],
  create: [
    bodyHas("deliverTo"),
    bodyHas("mobileNumber"),
    bodyHas("dishes"),
    hasDishes,
    hasQuantity,
    create,
  ],
  delete: [orderExists, validateDelete, destroy],
  update: [
    orderExists,
    validateOrderId,
    bodyHas("deliverTo"),
    bodyHas("mobileNumber"),
    bodyHas("dishes"),
    bodyHas("status"),
    hasDishes,
    hasQuantity,
    validateStatus,
    update,
  ],
};
