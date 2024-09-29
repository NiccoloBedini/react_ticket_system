import { useState } from 'react';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link, useParams } from 'react-router-dom';
import API from '../API';

function TextBlockForm(props) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const { ticketId } = useParams();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Form validation
    if (text.trim() === '' || text.length > 500) {
      setErrorMsg('Text must be between 1 and 500 characters');
    } else {
      const newTextBlock = { text: text.trim() };
      setLoading(true);
      try {
        //await new Promise((resolve) => setTimeout(resolve, 2000)); //no block interface trial
        const result = await API.addTextBlock(ticketId, newTextBlock);
        props.setControlMsg('Comment added successfully');
      } catch (err) {
        props.handleError(err);
      } finally {
        setLoading(false);
        props.setDirty(true);
        // Reset the form and navigate to home
        setText('');
        navigate('/');
      }
    }
  };

  if (!props.loggedIn || isNaN(Number(ticketId))) {
    return (
      <Alert variant="danger">
        You must be logged in and use a valid ticketId{' '}
        <Link to="/">return to home page</Link>.
      </Alert>
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
          <Form.Label>Text</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </Form.Group>

        {loading ? (
          <Spinner className="m-2" animation="border" role="status">
            <span className="sr-only"></span>
          </Spinner>
        ) : (
          <>
            <div className="my-2">
              <Button type="submit" variant="primary">
                Add comment
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
          </>
        )}
      </Form>
    </>
  );
}

export { TextBlockForm };
