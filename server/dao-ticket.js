'use strict';

/* Data Access Object (DAO) module for accessing ticket data */

const db = require('./db');
const dayjs = require('dayjs');

// get the entire list of ticket
exports.listTickets = () => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT ticket.id,title,name AS owner,users.id AS ownerId, state, category, date FROM ticket JOIN users ON ticket.owner_id = users.id';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const tickets = rows.map((e) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        state: e.state,
        owner: e.owner,
        ownerId: e.ownerId,
        date: dayjs(e.date).format('YYYY-MM-DD HH:mm:ss'),
      }));
      tickets.sort((a, b) => (dayjs(b.date).isAfter(dayjs(a.date)) ? 1 : -1));
      resolve(tickets);
    });
  });
};

// get all the textBlock relative to a single ticket
exports.listTextBlocksByTicket = (ticketId) => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT text_block.id,text,name AS author,users.id AS authorId, date FROM text_block JOIN users ON text_block.author_id = users.id WHERE ticket_id = ?';
    db.all(sql, [ticketId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const textBlocks = rows.map((e) => ({
        id: e.id,
        text: e.text,
        author: e.author,
        authorId: e.authorId,
        date: dayjs(e.date).format('YYYY-MM-DD HH:mm:ss'),
      }));
      textBlocks.sort((a, b) =>
        dayjs(b.date).isAfter(dayjs(a.date)) ? -1 : 1
      );
      resolve(textBlocks);
    });
  });
};

// get the ticket identified by {ticketId}
exports.getTicket = (ticketId) => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT ticket.id,title,name AS owner,users.id AS ownerId, state, category, description, date FROM ticket JOIN users ON ticket.owner_id = users.id WHERE ticket.id = ?';
    db.get(sql, [ticketId], (err, row) => {
      if (err) {
        reject(`DB error: ${err}`);
        return;
      }
      if (row == undefined) {
        resolve({ error: 'Ticket not found.' });
      } else {
        const ticket = {
          id: row.id,
          title: row.title,
          description: row.description,
          category: row.category,
          state: row.state,
          owner: row.owner,
          ownerId: row.ownerId,
          date: dayjs(row.date).format('YYYY-MM-DD HH:mm:ss'),
        };
        resolve(ticket);
      }
    });
  });
};

// get a textBlock identified by {textBlocktId}
exports.getTextBlock = (textBlockId) => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT text_block.id,text,name AS author,users.id AS authorId, ticket_id as ticketId, date FROM text_block JOIN users ON text_block.author_id = users.id WHERE text_block.id = ?';
    db.get(sql, [textBlockId], (err, row) => {
      if (err) {
        reject(`DB error: ${err}`);
        return;
      }
      if (row == undefined) {
        resolve({ error: 'TextBlock not found.' });
      } else {
        const textBlock = {
          id: row.id,
          text: row.text,
          author: row.author,
          authorId: row.authorId,
          ticketId: row.ticketId,
          date: dayjs(row.date).format('YYYY-MM-DD HH:mm:ss'),
        };
        resolve(textBlock);
      }
    });
  });
};

// add a new Ticket, return the newly created object, re-read from DB
exports.createTicket = (ticket) => {
  return new Promise((resolve, reject) => {
    const sql =
      'INSERT INTO ticket(category, state, owner_id, title, description, date) VALUES(?,?, ?, ?, ?, DATETIME(?))';
    db.run(
      sql,
      [
        ticket.category,
        ticket.state,
        ticket.ownerId,
        ticket.title,
        ticket.description,
        ticket.date,
      ],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(exports.getTicket(this.lastID));
      }
    );
  });
};

// add a new TextBlock for a ticket, return the newly created object, re-read from DB
exports.createTextBlock = (textBlock) => {
  return new Promise((resolve, reject) => {
    const sql =
      'INSERT INTO text_block(text, author_id, date, ticket_id) VALUES(?,?, DATETIME(?), ?)';
    db.run(
      sql,
      [textBlock.text, textBlock.authorId, textBlock.date, textBlock.ticketId],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(exports.getTextBlock(this.lastID));
      }
    );
  });
};

// update the state of an existing ticket
exports.updateTicketState = (ticket, userId, admin) => {
  return new Promise((resolve, reject) => {
    let sql = 'UPDATE ticket SET state=? WHERE id = ? AND owner_id = ?'; // It is MANDATORY to check that the answer belongs to the userId if not admin
    let params = [ticket.state, ticket.id, userId];
    if (admin) {
      sql = 'UPDATE ticket SET state=? WHERE id = ?';
      params = [ticket.state, ticket.id];
    }
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);
    });
  });
};

// update the category of an existing ticket
exports.updateTicketCategory = (ticket) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE ticket SET category=? WHERE id = ?';

    db.run(sql, [ticket.category, ticket.id], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);
    });
  });
};
