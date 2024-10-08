import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API';

function LoginForm(props) {
  const [username, setUsername] = useState('admin1@webapp.com');
  const [password, setPassword] = useState('admin1');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const doLogIn = (credentials) => {
    API.login(credentials)
      .then((user) => {
        setErrorMessage('');
        props.loginSuccessful(user);
        navigate('/');
      })
      .catch((err) => {
        setErrorMessage('Wrong username or password');
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');
    const credentials = { username, password };
    // validation required field
    if (username.trim().length == 0) {
      setErrorMessage('username cannot be empty');
      return;
    }
    if (password.trim().length == 0) {
      setErrorMessage('password cannot be empty');
      return;
    }

    doLogIn(credentials);
  };

  return (
    <Container>
      <Row>
        <Col xs={3}></Col>
        <Col xs={6}>
          <h2>Login</h2>
          <Form onSubmit={handleSubmit}>
            {errorMessage ? (
              <Alert
                variant="danger"
                dismissible
                onClick={() => setErrorMessage('')}
              >
                {errorMessage}
              </Alert>
            ) : (
              ''
            )}
            <Form.Group controlId="username">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={username}
                onChange={(ev) => setUsername(ev.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
              />
            </Form.Group>
            <Button className="my-2" type="submit">
              Login
            </Button>
            <Button
              className="my-2 mx-2"
              variant="danger"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
          </Form>
        </Col>
        <Col xs={3}></Col>
      </Row>
    </Container>
  );
}

export { LoginForm };
