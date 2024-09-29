'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');
const { check, validationResult } = require('express-validator');
const { expressjwt: jwt } = require('express-jwt');

const jwtSecret =
  '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';

const allowedCategory = [
  'inquiry',
  'maintenance',
  'new feature',
  'administrative',
  'payment',
]; // validator check

// init express
const app = express();
const port = 3002;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

// Check token validity
app.use(
  jwt({
    secret: jwtSecret,
    algorithms: ['HS256'],
    // token from HTTP Authorization: header
  })
);

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      errors: [
        {
          param: 'Server',
          msg: 'Authorization error - token expired',
          path: err.code,
        },
      ],
    });
  } else {
    next();
  }
});

/*** APIs ***/

// POST /api/estimation
app.post(
  '/api/estimation',
  [
    check('info').isArray().withMessage('Info must be an array'),
    check('info.*.title')
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be a string 1-100 length'),
    check('info.*.category')
      .isString()
      .isIn(allowedCategory)
      .withMessage(
        `Text must be one of the following values: ${allowedCategory.join(
          ', '
        )}`
      ),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const admin = req.auth.admin;
    const info = req.body.info;

    const estimations = info.map((ticket) => {
      const titleLength = ticket.title.replace(/\s+/g, '').length;
      const categoryLength = ticket.category.replace(/\s+/g, '').length;
      const estimatedHours =
        titleLength +
        categoryLength * 10 +
        (Math.floor(Math.random() * 240) + 1);

      if (admin) return { id: ticket.id, hour: estimatedHours };
      else {
        const estimatedDays = Math.round(estimatedHours / 24);
        return { id: ticket.id, day: estimatedDays };
      }
    });

    res.json({ estimations });
  }
);

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
