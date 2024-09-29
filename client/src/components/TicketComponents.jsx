import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Collapse,
  Spinner,
  Button,
  Dropdown,
  Row,
  Col,
} from 'react-bootstrap';
import { useState } from 'react';
import API from '../API';

// Componente Ticket
function Ticket(props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [textBlock, setTextBlock] = useState([]);
  const [loadingTextBlock, setLoadingTextBlock] = useState(false);

  const navigate = useNavigate();

  const availableCategory = [
    'inquiry',
    'maintenance',
    'new feature',
    'administrative',
    'payment',
  ];
  const e = props.ticket;

  const handleExpand = async () => {
    if (props.loggedIn) {
      setIsExpanded(!isExpanded);
      if (!isExpanded) {
        setLoadingTextBlock(true);
        try {
          const obj = await API.getTextBlock(e.id);
          const textBlock_list = obj.textBlock_list;
          e.description = obj.ticketDescription;
          setTextBlock(textBlock_list);
          setLoadingTextBlock(false);
        } catch (err) {
          props.handleError(err);
        }
      }
    }
  };

  const handleChangeState = async () => {
    if (
      props.loggedIn &&
      ((props.user.id === e.ownerId && e.state === 'Open') || props.user.admin)
    ) {
      props.setTickets((ticketList) =>
        ticketList.map((t) => (t.id === e.id ? { ...t, state: 'Loading' } : t))
      );
      try {
        //await new Promise((resolve) => setTimeout(resolve, 2000)); //non static update test
        const result = await API.changeState(e.id, e.state);
        props.setControlMsg('Status changed successfully');
      } catch (err) {
        props.handleError(err);
      } finally {
        props.setDirty(true);
      }
    }
  };

  const handleCategoryChange = async (newCategory) => {
    if (props.loggedIn && props.user.admin) {
      props.setTickets((ticketList) =>
        ticketList.map((t) =>
          t.id === e.id ? { ...t, category_update: 'Loading....' } : t
        )
      );
      try {
        //await new Promise((resolve) => setTimeout(resolve, 2000)); //non static update test
        await API.changeCategory(e.id, newCategory);
        props.setControlMsg('Category changed successfully');
      } catch (err) {
        props.handleError(err || 'Error changing category');
      } finally {
        props.setDirty(true);
      }
    }
  };

  return (
    <Card
      className={`mb-3 mt-3 bg-light shadow-sm rounded border-${
        e.status ? 'warning' : 'primary'
      }`}
    >
      <Card.Header
        className={`bg-${e.status ? 'warning' : 'primary'} text-light`}
        onClick={handleExpand}
        aria-controls="collapse-text"
        aria-expanded={isExpanded}
        style={props.loggedIn ? { cursor: 'pointer' } : {}}
      >
        <h4 className="mb-0">{e.title}</h4>
      </Card.Header>
      <Card.Body>
        <strong>Date:</strong> {e.date}
        <br />
        <br />
        <strong>Owner:</strong> {e.owner}
        <br />
        <strong>Category:</strong>{' '}
        {e.category_update ? e.category_update : e.category}
        {props.loggedIn && props.user.admin ? (
          <Dropdown className="d-inline-block mx-2 my-3">
            <Dropdown.Toggle
              variant="warning"
              size="sm"
              id="dropdown-category"
            ></Dropdown.Toggle>
            <Dropdown.Menu>
              {availableCategory.map(
                (category, index) =>
                  category !== e.category && (
                    <Dropdown.Item
                      key={index}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </Dropdown.Item>
                  )
              )}
            </Dropdown.Menu>
          </Dropdown>
        ) : null}
        <br />
        <strong>Status:</strong>{' '}
        <i
          className={`bi bi-octagon-fill mx-1 color-${
            e.state === 'Loading'
              ? 'warning'
              : e.state === 'Open'
              ? 'success'
              : 'danger'
          }`}
        ></i>{' '}
        {e.state}
        {props.loggedIn &&
        ((props.user.id === e.ownerId && e.state === 'Open') ||
          props.user.admin) ? (
          <Button
            variant={e.state === 'Loading' ? 'info' : 'warning'}
            size="sm"
            className="mx-2 my-1"
            onClick={handleChangeState}
          >
            {e.state === 'Loading' ? e.state : 'change'}
          </Button>
        ) : null}
        {props.loggedIn && props.user.admin && e.state === 'Open' ? (
          <>
            <br />
            <strong>Closing in:</strong> {props.hour} hours
          </>
        ) : null}
        <Collapse in={isExpanded}>
          <div id="collapse-text">
            {loadingTextBlock ? (
              <Spinner animation="border" />
            ) : (
              <>
                <br />
                <strong>Description:</strong>
                {e.description
                  ? e.description.split('\n').map((riga, i) =>
                      riga === '' ? (
                        <br key={i} />
                      ) : (
                        <p className="my-0" key={i}>
                          {riga}
                        </p>
                      )
                    )
                  : null}
                {props.loggedIn && e.state === 'Open' ? (
                  <Button
                    className="left mb-4 mt-3"
                    onClick={() => {
                      if (props.loggedIn && e.state === 'Open')
                        navigate(`/addTextBlock/${e.id}`);
                    }}
                    variant="success"
                  >
                    Add new Comment
                  </Button>
                ) : null}
                {textBlock.map((tb, index) => (
                  <Card key={index} className="mb-2">
                    <Card.Body>
                      <strong>Text:</strong>{' '}
                      {tb.text.split('\n').map((riga, i) =>
                        riga === '' ? (
                          <br key={i} />
                        ) : (
                          <p className="my-0" key={i}>
                            {riga}
                          </p>
                        )
                      )}
                      <br />
                      <Card.Text>
                        <strong>Author:</strong> {tb.author}
                        <br />
                        <strong>Date:</strong> {tb.date}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                ))}
              </>
            )}
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
}

function TicketList(props) {
  const navigate = useNavigate();

  return props.initialLoading ? (
    <Spinner className="m-2" />
  ) : (
    <>
      <Row className="my-3">
        <Col>
          <Button
            disabled={props.loggedIn ? false : true}
            onClick={() => {
              if (props.loggedIn) navigate('/addTicket');
            }}
            variant="success"
          >
            Add new Ticket
          </Button>
        </Col>
      </Row>
      {props.tickets.map((e, index) => (
        <Ticket
          key={index}
          ticket={e}
          hour={
            props.closureDates !== undefined
              ? props.closureDates.find((t) => t.id == e.id)?.hour || 'None'
              : null
          }
          user={props.user}
          loggedIn={props.loggedIn}
          setDirty={props.setDirty}
          setTickets={props.setTickets}
          handleError={props.handleError}
          setControlMsg={props.setControlMsg}
        />
      ))}
    </>
  );
}

export { TicketList };
