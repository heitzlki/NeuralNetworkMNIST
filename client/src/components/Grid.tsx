import { useEffect, useRef, useState } from 'react';
// import Pixel from './Pixel';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface PixelState {
  x: number;
  y: number;
  color: string;
}

interface PixelsState {
  pixels: PixelState[];
  addPixel: (x: number, y: number, color: string) => void;
  setColor: (x: number, y: number, color: string) => void;
  clear: () => void;
}

const usePixelsStore = create<PixelsState>()(
  devtools(
    persist(
      (set) => ({
        pixels: [],
        addPixel: (x, y, color) =>
          set((state) => ({
            pixels: [...state.pixels, { x, y, color }],
          })),
        setColor: (x, y, color) =>
          set((state) => {
            const pixel = state.pixels.find((p) => p.x === x && p.y === y);
            if (pixel) pixel.color = color;
            return { pixels: [...state.pixels] };
          }),
        clear: () => set({ pixels: [] }),
      }),
      {
        name: 'pixels-storage',
      }
    )
  )
);

const Pixel = ({ x, y }: { x: number; y: number }) => {
  const { pixels, addPixel, setColor, clear } = usePixelsStore();
  let pixel = pixels.find((p) => p.x === x && p.y === y);
  if (pixel) {
    let color = pixel.color;
    const pixelSize = 16;

    const defaultColor = '#fff';
    const hoverColor = ' 	#808080';
    const paintedColor = '#000';

    // const [color, setColor] = useState('#fff');

    const onClick = (e: any) => {
      // setColor(paintedColor);
      setColor(x, y, paintedColor);
      e.preventDefault();
    };

    const onContextMenu = (e: any) => {
      // setColor(defaultColor);
      e.preventDefault();
    };

    const onMouseOver = (e: any) => {
      if (e.buttons === 0 && color === defaultColor) {
        // setColor(hoverColor);
        setColor(x, y, hoverColor);
      } else if (e.buttons === 1) {
        // setColor(paintedColor);
        setColor(x, y, paintedColor);
      } else if (e.buttons === 2) {
        // setColor(defaultColor);
        setColor(x, y, defaultColor);
      }
    };

    const onMouseLeave = () => {
      if (color === hoverColor) {
        setColor(x, y, defaultColor);
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
          top: `${y * pixelSize}px`,
          left: `${x * pixelSize}px`,
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
        addPixel(x, y, '#fff');
      }
    }
  }, []);

  const handleErase = () => {
    pixels.map((pixel) => {
      setColor(pixel.x, pixel.y, '#fff');
    });
  };

  const exportPixels = () => {
    const data = pixels.map((pixel) => {
      return [pixel.x, pixel.y, pixel.color];
    });
    console.log(data);
  };

  return (
    <>
      <button onClick={handleErase}>Clear</button>
      <button onClick={exportPixels}>Export</button>
      <div ref={ref} className='grid'>
        {pixels.map((pixel) => (
          <Pixel key={`${pixel.x}-${pixel.y}`} x={pixel.x} y={pixel.y} />
        ))}
      </div>
    </>
  );
};

export default Gird;
