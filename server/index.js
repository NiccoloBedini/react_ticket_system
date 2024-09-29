'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');
const { check, validationResult } = require('express-validator'); // validation middleware
const allowedState = ['Open', 'Closed']; // validator check
const allowedCategory = [
  'inquiry',
  'maintenance',
  'new feature',
  'administrative',
  'payment',
]; // validator check

const jsonwebtoken = require('jsonwebtoken');
const jwtSecret =
  '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';
const expireTime = 60; //seconds

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const ticketDao = require('./dao-ticket'); // module for accessing the DB
const userDao = require('./dao-user'); // module for accessing the user info in the DB

const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local'); // username and password for login
const session = require('express-session'); // enable sessions
const dayjs = require('dayjs');

const answerDelay = 0; // To be put to 0 for the exam submission

// init express
const app = express();
const port = 3001;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

// set up the session middleware before initializing passport
app.use(
  session({
    // by default, Passport uses a MemoryStore to keep track of the sessions
    secret: 'wge8d239bwd93rkskb', // change this random string, should be a secret value
    resave: false,
    saveUninitialized: false,
  })
);

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(
  new LocalStrategy(function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, {
          message: 'Incorrect username or password.',
        });

      return done(null, user);
    });
  })
);

// serialize and de-serialize the user (user object <-> session)
// we serialize only the user id and store it in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao
    .getUserById(id)
    .then((user) => {
      done(null, user); // this will be available in req.user
    })
    .catch((err) => {
      done(err, null);
    });
});

// initialize passport and use the session
app.use(passport.authenticate('session'));
// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  return res.status(401).json({ error: 'Not authenticated' });
};

const isAdmin = (req, res, next) => {
  if (req.user.admin) return next();

  return res.status(401).json({ error: 'Not authorized - privilege level' });
};

/*################################################################*/
/********************** APIs TICKET *******************************/

// GET /api/tickets -> restituisce tutti i ticket (senza description)
app.get('/api/tickets', (req, res) => {
  ticketDao
    .listTickets()
    .then((questions) => setTimeout(() => res.json(questions), answerDelay))
    .catch((err) => {
      res.status(500).end();
    });
});

// GET /api/tickets/<id>/textBlocks -> restituisce tutti i textblock di un ticket e la description del ticket
app.get(
  '/api/tickets/:id/textBlocks',
  isLoggedIn,
  [check('id').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const ticket = await ticketDao.getTicket(req.params.id);

      if (ticket.error)
        return res.status(404).json(ticket); // ticketId does not exist
      else {
        const result = await ticketDao.listTextBlocksByTicket(req.params.id);

        if (result.error) return res.status(404).json(result);
        else {
          const obj = {
            ticketDescription: ticket.description,
            textBlock_list: result,
          };
          setTimeout(() => res.json(obj), answerDelay);
        } // NB: list of textBlocks can also be an empty array
      }
    } catch (err) {
      res.status(500).end();
    }
  }
);

// GET /api/tickets/<id> -> restituisce un ticket dato l'id
app.get(
  '/api/tickets/:id',
  isLoggedIn,
  [check('id').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const result = await ticketDao.getTicket(req.params.id);

      if (result.error) res.status(404).json(result);
      else setTimeout(() => res.json(result), answerDelay);
    } catch (err) {
      res.status(500).end();
    }
  }
);

// POST /api/tickets -> aggiunge nuovo ticket
app.post(
  '/api/tickets',
  isLoggedIn,
  [
    check('title').isString().isLength({ min: 1, max: 100 }),
    check('state')
      .isString()
      .isIn(allowedState)
      .withMessage(
        `Text must be one of the following values: ${allowedState.join(', ')}`
      ),
    check('category')
      .isString()
      .isIn(allowedCategory)
      .withMessage(
        `Text must be one of the following values: ${allowedCategory.join(
          ', '
        )}`
      ),
    check('description').isLength({ min: 1, max: 500 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const ticket = {
      category: req.body.category,
      state: req.body.state,
      ownerId: req.user.id,
      title: DOMPurify.sanitize(req.body.title),
      description: DOMPurify.sanitize(req.body.description),
      date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    try {
      const newTicket = await ticketDao.createTicket(ticket);
      setTimeout(() => res.status(201).json(newTicket), answerDelay);
    } catch (err) {
      res.status(500).json({
        error: `Database error during the creation of ticket ${ticket.title} by ${ticket.ownerId}.`,
      });
    }
  }
);

// POST TEXTBLOCK
// POST /api/tickets/:id/textBlock -> aggiunge nuovo textblock a un ticket
app.post(
  '/api/tickets/:id/textBlocks',
  isLoggedIn,
  [check('id').isInt(), check('text').isLength({ min: 1, max: 500 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const textBlock = {
      text: DOMPurify.sanitize(req.body.text),
      authorId: req.user.id,
      date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      ticketId: req.params.id,
    };

    try {
      // check se ticket esiste
      const ticket = await ticketDao.getTicket(req.params.id);

      if (ticket.error) res.status(404).json(ticket); // ticketId does not exist
      else if (ticket.state !== 'Open')
        return res.status(403).json({ error: 'The ticket is closed!' });
      else {
        const newTextBlock = await ticketDao.createTextBlock(textBlock);
        setTimeout(() => res.status(201).json(newTextBlock), answerDelay);
      }
    } catch (err) {
      res.status(500).json({
        error: `Database error during the creation of textBlock ${textBlock.text} by ${textBlock.authorId}.`,
      });
    }
  }
);

// UPDATE STATE
// PUT /api/tickets/<id>/state
app.put(
  '/api/tickets/:id/state',
  isLoggedIn,
  [
    check('id').isInt(),
    check('state')
      .isString()
      .isIn(allowedState)
      .withMessage(
        `Text must be one of the following values: ${allowedState.join(', ')}`
      ),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // check se ticket esiste
    const oldTicket = await ticketDao.getTicket(req.params.id);

    if (oldTicket.error)
      return res.status(404).json(oldTicket); // ticketId does not exist
    else if (oldTicket.state === req.body.state)
      // the state is the same -> nosense go ahead
      return res.status(400).json({
        //scelto di ritornare error perchè lato client non è un comportamento possibile
        error: 'The ticket state is already ' + req.body.state,
      });
    //only an admin can modify others ticket state or reopen a ticket
    else if (
      !req.user.admin &&
      (req.body.state !== 'Closed' || oldTicket.ownerId !== req.user.id)
    ) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const ticket = {
      state: req.body.state,
      id: req.params.id,
    };

    try {
      const numRowChanges = await ticketDao.updateTicketState(
        ticket,
        req.user.id,
        req.user.admin
      ); // the query in the DB will check if the answer belongs to the authenticated user and not another, using WHERE respondentId=... (is a double check)
      setTimeout(() => res.json(numRowChanges), answerDelay);
      //res.status(200).end();
    } catch (err) {
      res.status(500).json({
        error: `Database error during the update of ticket ${req.params.id}.`,
      });
    }
  }
);

// UPDATE CATEGORY
// PUT /api/tickets/<id>/category
app.put(
  '/api/tickets/:id/category',
  isLoggedIn,
  isAdmin,
  [
    check('id').isInt(),
    check('category')
      .isString()
      .isIn(allowedCategory)
      .withMessage(
        `Text must be one of the following values: ${allowedCategory.join(
          ', '
        )}`
      ),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const oldTicket = await ticketDao.getTicket(req.params.id); // check se ticket esiste
    if (oldTicket.error) return res.status(404).json(oldTicket); // ticketId does not exist
    if (oldTicket.category === req.body.category)
      return res.status(400).json({
        //scelto di ritornare error perchè lato client non è un comportamento possibile
        error: 'The ticket category is already ' + req.body.state,
      });

    const ticket = {
      category: req.body.category,
      id: req.params.id,
    };

    try {
      const numRowChanges = await ticketDao.updateTicketCategory(ticket);
      setTimeout(() => res.json(numRowChanges), answerDelay);
      //res.status(200).end();
    } catch (err) {
      res.status(500).json({
        error: `Database error during the update of ticket ${req.params.id}.`,
      });
    }
  }
);

/*****************************************************************/

//################################################################/

/********************** APIs LOGIN *******************************/

// POST /sessions
// login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err) return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE /sessions/current
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else res.status(401).json({ error: 'Unauthenticated user!' });
});

/****************************************************************/
/*** Token ***/

// GET /api/auth-token
app.get('/api/auth-token', isLoggedIn, (req, res) => {
  const payloadToSign = { admin: req.user.admin, authId: req.user.id };
  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, {
    expiresIn: expireTime,
  });

  res.json({ token: jwtToken, admin: req.user.admin }); // admin is just for debug. Anyway it is in the JWT payload
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
