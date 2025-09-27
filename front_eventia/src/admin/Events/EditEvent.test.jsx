import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EditEvent from './EditEvent';

test('EditEvent component renders without crashing', () => {
  render(
    <BrowserRouter>
      <EditEvent />
    </BrowserRouter>
  );
});
