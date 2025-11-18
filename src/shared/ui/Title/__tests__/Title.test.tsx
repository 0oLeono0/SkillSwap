import { render, screen } from '@testing-library/react';
import { Title } from '../Title';

describe('Title component', () => {
  it('renders given text inside the provided html tag', () => {
    render(
      <Title tag="h2" variant="lg">
        Custom heading
      </Title>,
    );

    const heading = screen.getByRole('heading', { name: 'Custom heading', level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('title', 'title--lg');
  });

  it('falls back to h1 tag when tag prop is omitted', () => {
    render(<Title variant="md">Default heading</Title>);

    const heading = screen.getByRole('heading', { name: 'Default heading', level: 1 });
    expect(heading.tagName).toBe('H1');
  });
});
