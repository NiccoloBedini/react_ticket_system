import { Navbar, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function MyHeader(props) {
  const name = props.user && props.user.name;

  return (
    <>
      <Navbar
        bg="primary"
        variant="dark"
        className="d-flex justify-content-between"
      >
        <Navbar.Brand className="mx-2">
          <i className="bi bi-ticket-detailed" />
          {' Ticket site'}
        </Navbar.Brand>
        {name ? (
          <div>
            <Navbar.Text className="fs-5 text-light">
              {'Signed in as: ' + name}
            </Navbar.Text>
            <Button className="mx-2" variant="danger" onClick={props.logout}>
              Logout
            </Button>
          </div>
        ) : (
          <Link to="/login">
            <Button className="mx-2" variant="warning">
              Login
            </Button>
          </Link>
        )}
      </Navbar>
      {props.errorMsg && (
        <Row>
          <Col>
            <Alert
              className="m-2"
              variant="danger"
              dismissible
              onClose={() => props.setErrorMsg('')}
            >
              {props.errorMsg}
            </Alert>
          </Col>
        </Row>
      )}
      {props.controlMsg && (
        <Row>
          <Col>
            <Alert
              className="m-2"
              variant="success"
              dismissible
              onClose={() => props.setControlMsg('')}
            >
              {props.controlMsg}
            </Alert>
          </Col>
        </Row>
      )}
    </>
  );
}

export { MyHeader };
