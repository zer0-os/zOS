import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Lightbox, LightboxProps } from '.';

const mockReactImageLightbox = jest.fn();

jest.mock('react-image-lightbox', () => ({
  __esModule: true,
  default: (props: any) => {
    mockReactImageLightbox(props);
    return (
      <div data-testid='lightbox'>
        {props.toolbarButtons}
        <button onClick={() => props.onMoveNextRequest()}>Next</button>
        <button onClick={() => props.onMovePrevRequest()}>Prev</button>
        <button onClick={() => props.onCloseRequest()}>Close</button>
      </div>
    );
  },
}));

const mockItems = [
  { url: 'image0.jpg', type: 'image', name: 'image-0.jpg' },
  { url: 'image1.jpg', type: 'image', name: 'image-1.jpg' },
  { url: 'image2.jpg', type: 'image', name: 'image-2.jpg' },
];

const mockProvider = {
  fitWithinBox: jest.fn(() => ({ crop: 'fill', height: 123 })),
  getSource: jest.fn(({ src }) => `http://res.cloudinary.com/test/image/upload/${src}`),
};

const DEFAULT_PROPS: LightboxProps = {
  items: mockItems,
  provider: mockProvider,
  startingIndex: 0,
  onClose: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<Lightbox />', () => {
  test('should render with default starting index', () => {
    render(<Lightbox {...DEFAULT_PROPS} />);
    expect(mockReactImageLightbox).toHaveBeenCalledWith(
      expect.objectContaining({
        mainSrc: 'http://res.cloudinary.com/test/image/upload/image0.jpg',
      })
    );
  });

  test('should render with custom starting index', () => {
    render(<Lightbox {...DEFAULT_PROPS} startingIndex={1} />);
    expect(mockReactImageLightbox).toHaveBeenCalledWith(
      expect.objectContaining({
        mainSrc: 'http://res.cloudinary.com/test/image/upload/image1.jpg',
      })
    );
  });

  test('should set next and prev images correctly', () => {
    render(<Lightbox {...DEFAULT_PROPS} startingIndex={1} />);
    expect(mockReactImageLightbox).toHaveBeenCalledWith(
      expect.objectContaining({
        mainSrc: 'http://res.cloudinary.com/test/image/upload/image1.jpg',
        nextSrc: 'http://res.cloudinary.com/test/image/upload/image2.jpg',
        prevSrc: 'http://res.cloudinary.com/test/image/upload/image0.jpg',
      })
    );
  });

  test('should not set next and prev when there is only one image', () => {
    render(<Lightbox {...DEFAULT_PROPS} items={[mockItems[0]]} />);
    expect(mockReactImageLightbox).toHaveBeenCalledWith(
      expect.objectContaining({
        mainSrc: 'http://res.cloudinary.com/test/image/upload/image0.jpg',
        nextSrc: null,
        prevSrc: null,
      })
    );
  });

  test('should cycle forward through images', () => {
    const { getByText } = render(<Lightbox {...DEFAULT_PROPS} />);

    // Initial state
    expect(mockReactImageLightbox).toHaveBeenLastCalledWith(
      expect.objectContaining({
        mainSrc: 'http://res.cloudinary.com/test/image/upload/image0.jpg',
      })
    );

    // Move to next image
    fireEvent.click(getByText('Next'));
    expect(mockReactImageLightbox).toHaveBeenLastCalledWith(
      expect.objectContaining({
        mainSrc: 'http://res.cloudinary.com/test/image/upload/image1.jpg',
      })
    );
  });

  test('should cycle backward through images', () => {
    const { getByText } = render(<Lightbox {...DEFAULT_PROPS} />);

    // Initial state
    expect(mockReactImageLightbox).toHaveBeenLastCalledWith(
      expect.objectContaining({
        mainSrc: 'http://res.cloudinary.com/test/image/upload/image0.jpg',
      })
    );

    // Move to previous image
    fireEvent.click(getByText('Prev'));
    expect(mockReactImageLightbox).toHaveBeenLastCalledWith(
      expect.objectContaining({
        mainSrc: 'http://res.cloudinary.com/test/image/upload/image2.jpg',
      })
    );
  });

  test('should call provider.fitWithinBox with correct arguments', () => {
    render(<Lightbox {...DEFAULT_PROPS} />);
    expect(mockProvider.fitWithinBox).toHaveBeenCalledWith(mockItems[0]);
  });

  test('should call provider.getSource with correct arguments', () => {
    render(<Lightbox {...DEFAULT_PROPS} />);
    expect(mockProvider.getSource).toHaveBeenCalledWith({
      src: mockItems[0].url,
      options: { crop: 'fill', height: 123 },
    });
  });

  test('should call onClose when close is requested', () => {
    const onClose = jest.fn();
    const { getByText } = render(<Lightbox {...DEFAULT_PROPS} onClose={onClose} />);

    fireEvent.click(getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  test('should pass correct props to ReactImageLightbox', () => {
    render(<Lightbox {...DEFAULT_PROPS} />);
    expect(mockReactImageLightbox).toHaveBeenCalledWith(
      expect.objectContaining({
        animationOnKeyInput: true,
        enableZoom: false,
        wrapperClassName: 'Lightbox',
      })
    );
  });

  test('should render download button', () => {
    const { container } = render(<Lightbox {...DEFAULT_PROPS} />);
    const downloadButton = container.querySelector('button[aria-label="Download image"]');
    expect(downloadButton).toBeInTheDocument();
  });
});
