import { useState, useEffect } from 'react';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import API from '../API';

function TicketForm(props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [prediction, setPrediction] = useState('');

  const availableCategory = [
    'inquiry',
    'maintenance',
    'new feature',
    'administrative',
    'payment',
  ];

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    // Form validation
    if (title.trim() === '' || title.length > 500) {
      setErrorMsg('Title must be between 1 and 500 characters');
    } else if (category === '') {
      setErrorMsg('Category is required');
    } else if (description.trim() === '' || description.length > 500) {
      setErrorMsg('Description must be between 1 and 500 characters');
    } else {
      setIsConfirming(true);
    }
  };

  const handleConfirm = async () => {
    const newTicket = {
      title: title.trim(),
      category: category,
      description: description.trim(),
      state: 'Open',
      ownerId: props.user.id,
    };

    setLoading(true);
    try {
      //await new Promise((resolve) => setTimeout(resolve, 2000)); //no block interface trial
      const result = await API.addTicket(newTicket);
    } catch (err) {
      props.handleError(err);
    } finally {
      setLoading(false);
      props.setDirty(true);
      // Reset the form and navigate to home
      setTitle('');
      setCategory('');
      setDescription('');
      setErrorMsg('');
      setIsConfirming(false);
      navigate('/');
    }
  };

  useEffect(() => {
    if (props.authToken && isConfirming) {
      const info = { title: title.trim(), category: category };
      loadPrediction(props.authToken, info);
    }
  }, [props.authToken, isConfirming]);

  if (!props.loggedIn) {
    return (
      <Alert variant="danger">
        You must be logged in to add a new ticket. Please{' '}
        <Link to="/">return to home page</Link>.
      </Alert>
    );
  }
  const loadPrediction = async (authToken, info) => {
    try {
      const res = await API.getClosureDates(authToken, [info]);
      const estimation = props.user.admin
        ? res.estimations[0].hour
        : res.estimations[0].day;
      setPrediction(estimation);
    } catch (err) {
      setPrediction('none');

      if (err.error == 'not available') {
        setErrorMsg('server2 not available');
        return;
      }
      props.handleError({ error: 'token expired' });
      await props.newToken();
    }
  };

  if (isConfirming) {
    return (
      <div>
        <h3>Confirm your Ticket</h3>
        <p>
          <strong>Title:</strong> {title}
        </p>
        <p>
          <strong>Category:</strong> {category}
        </p>
        <p>
          <strong>Description:</strong> {description}
        </p>
        <p>
          <strong>State:</strong> Open
        </p>
        <p>
          <strong>Estimated closure in:</strong> {prediction}{' '}
          {props.user.admin ? ' hours' : ' days'}
        </p>
        {loading ? (
          <Spinner className="m-2" animation="border" role="status">
            <span className="sr-only"></span>
          </Spinner>
        ) : (
          <>
            <Button variant="primary" onClick={handleConfirm}>
              Confirm
            </Button>
            <Button
              variant="warning"
              onClick={() => setIsConfirming(false)}
              className="ml-2"
            >
              Edit
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {errorMsg && (
        <Alert variant="danger" onClose={() => setErrorMsg('')} dismissible>
          {errorMsg}
        </Alert>
      )}
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Category</Form.Label>
          <Form.Control
            as="select"
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Select a category</option>
            {availableCategory.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Form.Group>

        <div className="my-2">
          <Button type="submit" variant="primary">
            Add Ticket
          </Button>
          <Button
            variant="warning"
            onClick={() => {
              navigate('/');
            }}
            className="ml-2"
          >
            Cancel
          </Button>
        </div>
      </Form>
    </>
  );
}

export { TicketForm };
