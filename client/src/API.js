/**
 * All the API calls
 */
const URL = 'http://localhost:3001/api';

async function getTickets() {
  // call  /api/tickets

  const response = await fetch(URL + '/tickets');
  const tickets = await response.json();
  if (response.ok) {
    return tickets.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      category: e.category,
      state: e.state,
      owner: e.owner,
      ownerId: e.ownerId,
      date: e.date,
    }));
  } else {
    throw tickets;
  }
}

async function getTextBlock(id) {
  // call  /api/tickets/:id/textBlocks
  const response = await fetch(URL + `/tickets/${id}/textBlocks`, {
    method: 'GET',
    credentials: 'include',
  });
  const obj = await response.json();
  if (response.ok) {
    obj.textBlock_list = obj.textBlock_list.map((e) => ({
      id: e.id,
      text: e.text,
      author: e.author,
      authorId: e.authorId,
      date: e.date,
    }));
    return obj;
  } else {
    throw obj;
  }
}

async function changeState(id, state) {
  // call  /api/tickets/:id/state
  const newState = { state: state == 'Open' ? 'Closed' : 'Open' };
  const response = await fetch(URL + `/tickets/${id}/state`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newState),
  });
  const result = await response.json();
  if (response.ok) {
    return result;
  } else {
    throw result;
  }
}
async function changeCategory(id, category) {
  // call  /api/tickets/:id/category
  const newCategory = { category: category };
  const response = await fetch(URL + `/tickets/${id}/category`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newCategory),
  });
  const result = await response.json();
  if (response.ok) {
    return result;
  } else {
    throw result;
  }
}

async function addTicket(newTicket) {
  // call  /api/tickets
  const response = await fetch(URL + `/tickets`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTicket),
  });
  const result = await response.json();
  if (response.ok) {
    return result;
  } else {
    throw result;
  }
}
async function addTextBlock(id, newTextBlock) {
  // call  /api/tickets/:id/textBlock

  const response = await fetch(URL + `/tickets/${id}/textBlocks`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTextBlock),
  });
  const result = await response.json();
  if (response.ok) {
    return result;
  } else {
    throw result;
  }
}

/*############################
######### AUTHN API ##########
##############################*/

async function login(credentials) {
  let response = await fetch(URL + '/sessions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logout() {
  await fetch(URL + '/sessions/current', {
    method: 'DELETE',
    credentials: 'include',
  });
}

async function getUserInfo() {
  const response = await fetch(URL + '/sessions/current', {
    credentials: 'include',
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;
  }
}

async function getClosureDates(authToken, info) {
  // retrieve info from an external server, where info can be accessible only via JWT token
  try {
    const response = await fetch('http://localhost:3002' + `/api/estimation`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ info }),
    });

    const result = await response.json();
    if (response.ok) {
      return result;
    } else if (response.status === 401) {
      throw { error: 'unauthorized' };
    } else {
      throw result;
    }
  } catch (err) {
    if (err.error === 'unauthorized') throw err; // token expired -> new request
    else throw { error: 'not available' }; //if server offline useless redo a new request
  }
}

async function getAuthToken() {
  const response = await fetch(URL + '/auth-token', {
    credentials: 'include',
  });
  const token = await response.json();
  if (response.ok) {
    return token;
  } else {
    throw token;
  }
}

const API = {
  getTickets,
  getTextBlock,
  getUserInfo,
  changeState,
  changeCategory,
  addTicket,
  addTextBlock,
  getClosureDates,
  getAuthToken,
  login,
  logout,
};

export default API;
