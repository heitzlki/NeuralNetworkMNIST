import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface PixelState {
  [id: string]: { id: string; x: number; y: number; color: string };
}

interface PixelsState {
  pixels: PixelState;
  addPixel: (id: string, x: number, y: number, color: string) => void;
  setColor: (id: string, color: string) => void;
  clear: () => void;
}

const usePixelsStore = create<PixelsState>()(
  devtools(
    persist(
      (set) => ({
        pixels: {},
        addPixel: (id, x, y, color) =>
          set((state) => ({
            pixels: Object.assign(state.pixels, { [id]: { x, y, color } }),
          })),
        setColor: (id, color) =>
          set((state) => {
            state.pixels[id].color = color;
            return { pixels: state.pixels };
          }),
        clear: () => set({ pixels: {} }),
      }),
      {
        name: 'pixels-storage',
      }
    )
  )
);

const defaultColor = '#fff';
const hoverColor = ' 	#808080';
const paintedColor = '#000';

const Pixel = ({ id }: { id: string }) => {
  const { pixels, setColor } = usePixelsStore();
  const pixel = pixels[id];
  if (pixel) {
    let color = pixel.color;
    const pixelSize = 16;

    const onClick = (e: any) => {
      setColor(id, paintedColor);
      e.preventDefault();
    };

    const onContextMenu = (e: any) => {
      e.preventDefault();
    };

    const onMouseOver = (e: any) => {
      if (e.buttons === 0 && color === defaultColor) {
        setColor(id, hoverColor);
      } else if (e.buttons === 1) {
        setColor(id, paintedColor);
      } else if (e.buttons === 2) {
        setColor(id, defaultColor);
      }
    };

    const onMouseLeave = () => {
      if (color === hoverColor) {
        setColor(id, defaultColor);
      }
    };

    return (
      <div
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        onContextMenu={onContextMenu}
        // prevent drag events
        onDragStart={(e) => e.preventDefault()}
        onDragEnd={(e) => e.preventDefault()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        style={{
          position: 'absolute',
          top: `${pixel.y * pixelSize}px`,
          left: `${pixel.x * pixelSize}px`,
          backgroundColor: color,
          width: `${pixelSize}px`,
          height: `${pixelSize}px`,
          cursor: 'crosshair',
          border: '1px solid #000',
        }}
      />
    );
  }
};

function colorToGrayscale(color: string): number {
  // Remove the '#' symbol from the color string
  const cleanColor = color.replace('#', '');

  // Expand the shorthand 3-digit color to 6-digit
  const expandedColor =
    cleanColor.length === 3 ? cleanColor.repeat(2) : cleanColor;

  // Parse the color values from the hexadecimal string
  const red = parseInt(expandedColor.slice(0, 2), 16);
  const green = parseInt(expandedColor.slice(2, 4), 16);
  const blue = parseInt(expandedColor.slice(4, 6), 16);

  // Calculate the grayscale value
  const grayscale = red * 0.299 + green * 0.587 + blue * 0.114;

  // Return the grayscale value rounded to the nearest integer
  return Math.round(grayscale);
}

const Gird = () => {
  const ref = useRef<HTMLDivElement>(null);

  const { pixels, addPixel, setColor, clear } = usePixelsStore();

  const gridSize = 28;
  useEffect(() => {
    clear();

    const width = gridSize;
    const height = gridSize;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        addPixel(`${x}-${y}`, x, y, '#fff');
      }
    }
  }, []);

  const handleErase = () => {
    Object.keys(pixels).forEach((id) => {
      setColor(id, '#fff');
    });
  };

  const exportPixels = async () => {
    let data: any = [];
    Object.keys(pixels).forEach((id) => {
      data.push([colorToGrayscale(pixels[id].color) / 255]);
    });
    console.log(data);

    try {
      const response = await fetch('http://127.0.0.1:5000/', {
        method: 'POST',
        // headers: {
        //   'Content-Type': 'application/json',
        // },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Data sent successfully');
      } else {
        console.error('Failed to send data');
      }
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  return (
    <>
      <button onClick={handleErase}>Clear</button>
      <button onClick={exportPixels}>Export</button>
      <div ref={ref} className='grid'>
        {Object.keys(pixels).map((id) => (
          <Pixel key={id} id={id} />
        ))}
      </div>
    </>
  );
};

export default Gird;
