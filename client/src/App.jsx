import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Link,
  Navigate,
} from 'react-router-dom';
import './App.css';

import { TicketList } from './components/TicketComponents.jsx';
import { MyHeader } from './components/MyHeader.jsx';
import { MyFooter } from './components/MyFooter.jsx';
import { LoginForm } from './components/LoginComponents.jsx';
import { TicketForm } from './components/TicketForm.jsx';
import { TextBlockForm } from './components/TextBlockForm.jsx';

import API from './API.js';

function DefaultRoute(props) {
  return (
    <Container fluid>
      <p className="my-2">No data here: This is not a valid page!</p>
      <Link to="/">Please go back to main page</Link>
    </Container>
  );
}

function App() {
  const [tickets, setTickets] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dirty, setDirty] = useState(true);
  const [closureDates, setClosureDates] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [controlMsg, setControlMsg] = useState('');
  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  //request to server2 for prediction
  const loadClosureDates = async (authToken, info) => {
    try {
      const res = await API.getClosureDates(authToken, info);
      setClosureDates(res.estimations);
    } catch (err) {
      setClosureDates([]);
      if (err.error == 'not available') return; // if server 2 is offline no need for a new token call
      handleError({ error: 'token expired' }); // token expired -> request new token

      await newToken();
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
        await newToken();
        setDirty(true);
      } catch (err) {
        handleError(err);
      }
    };
    if (!loggedIn) checkAuth();
  }, []);

  // reload the ticket list after each modification
  useEffect(() => {
    if (dirty) {
      setInitialLoading(true);
      API.getTickets()
        .then((ticketList) => {
          setTickets(ticketList);
          setInitialLoading(false);
          setDirty(false);
        })
        .catch((err) => handleError({ error: 'server1 not available' }));
    }
  }, [dirty]);

  // load the info about prediction if authorized user
  useEffect(() => {
    if (authToken && loggedIn && user.admin && !dirty) {
      const info = tickets
        .filter((ticket) => ticket.state === 'Open')
        .map((t) => ({
          id: t.id,
          title: t.title,
          category: t.category,
        }));
      loadClosureDates(authToken, info);
    }
  }, [dirty, authToken]);

  function handleError(err) {
    let errMsg = 'Unkwnown error';
    if (err.errors) {
      if (err.errors[0].msg) {
        errMsg = err.errors[0].msg;
      }
    } else {
      if (err.error) {
        errMsg = err.error;
      }
    }
    if (errMsg == 'Unauthenticated user!' || 'token expired') return;
    setErrorMsg(errMsg);
  }

  const doLogOut = async () => {
    await API.logout();
    setLoggedIn(false);
    setUser(undefined);
    setDirty(true);
    setAuthToken('');
  };

  const loginSuccessful = async (user) => {
    setUser(user);
    setLoggedIn(true);
    await newToken();
    setDirty(true);
  };

  const newToken = async () => {
    try {
      const resp = await API.getAuthToken();
      setAuthToken(resp.token);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              user={user}
              loggedIn={loggedIn}
              logout={doLogOut}
              errorMsg={errorMsg}
              setErrorMsg={setErrorMsg}
              controlMsg={controlMsg}
              setControlMsg={setControlMsg}
            />
          }
        >
          <Route
            index
            element={
              <TicketList
                loggedIn={loggedIn}
                tickets={tickets}
                setTickets={setTickets}
                initialLoading={initialLoading}
                user={user}
                setDirty={setDirty}
                handleError={handleError}
                closureDates={closureDates}
                setControlMsg={setControlMsg}
              />
            }
          />
          <Route
            path="/addTicket"
            element={
              <TicketForm
                loggedIn={loggedIn}
                user={user}
                setDirty={setDirty}
                handleError={handleError}
                authToken={authToken}
                newToken={newToken}
                setControlMsg={setControlMsg}
              />
            }
          />
          <Route
            path="/addTextBlock/:ticketId"
            element={
              <TextBlockForm
                loggedIn={loggedIn}
                user={user}
                setDirty={setDirty}
                handleError={handleError}
                setControlMsg={setControlMsg}
              />
            }
          />
        </Route>
        <Route
          path="/login"
          element={
            loggedIn ? (
              <Navigate replace to="/" />
            ) : (
              <LoginForm loginSuccessful={loginSuccessful} />
            )
          }
        />
        <Route path="/*" element={<DefaultRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

function Layout(props) {
  return (
    <Container fluid>
      <Row>
        <Col>
          <MyHeader
            user={props.user}
            loggedIn={props.loggedIn}
            logout={props.logout}
            errorMsg={props.errorMsg}
            setErrorMsg={props.setErrorMsg}
            controlMsg={props.controlMsg}
            setControlMsg={props.setControlMsg}
          />
        </Col>
      </Row>
      <Outlet />
      <Row>
        <Col>
          <MyFooter />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
