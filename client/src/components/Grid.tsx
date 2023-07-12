import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface PixelValue {
  id: string;
  x: number;
  y: number;
  color: string;
}

interface PixelState {
  [id: string]: PixelValue;
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
            if (state.pixels[id]) {
              state.pixels[id].color = color;
              return { pixels: state.pixels };
            }
            return state;
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
const brushColorOne = '#404040';
const brushColorTwo = '#7f7f7f';
const paintedColor = '#000';

const Pixel = ({ id }: { id: string }) => {
  const { pixels, setColor } = usePixelsStore();
  const pixel = pixels[id];
  if (pixel) {
    let color = pixel.color;
    const pixelSize = 16;

    const setBrushColor = (id: string) => {
      setColor(id, paintedColor);
      // setColor(`${pixel.x + 1}-${pixel.y}`, brushColorOne);
      // setColor(`${pixel.x - 1}-${pixel.y}`, brushColorOne);
      // setColor(`${pixel.x}-${pixel.y + 1}`, brushColorOne);
      // setColor(`${pixel.x}-${pixel.y - 1}`, brushColorOne);
      // setColor(`${pixel.x + 1}-${pixel.y + 1}`, brushColorTwo);
      // setColor(`${pixel.x - 1}-${pixel.y - 1}`, brushColorTwo);
      // setColor(`${pixel.x + 1}-${pixel.y - 1}`, brushColorTwo);
      // setColor(`${pixel.x - 1}-${pixel.y + 1}`, brushColorTwo);
      let brushColorPixels = [
        `${pixel.x + 1}-${pixel.y}`,
        `${pixel.x - 1}-${pixel.y}`,
        `${pixel.x}-${pixel.y + 1}`,
        `${pixel.x}-${pixel.y - 1}`,
        `${pixel.x + 1}-${pixel.y + 1}`,
        `${pixel.x - 1}-${pixel.y - 1}`,
        `${pixel.x + 1}-${pixel.y - 1}`,
        `${pixel.x - 1}-${pixel.y + 1}`,
      ];

      brushColorPixels.map((brushColorPixel) => {
        if (pixels[brushColorPixel]) {
          let prevPixelColor = pixels[brushColorPixel].color;
          if (prevPixelColor === defaultColor) {
            setColor(brushColorPixel, brushColorOne);
          } else if (prevPixelColor === brushColorOne) {
            setColor(brushColorPixel, brushColorTwo);
          } else if (prevPixelColor === brushColorTwo) {
            setColor(brushColorPixel, paintedColor);
          }
        }
      });

      // brushColors.forEach((brushColor) => {
      //   // setColor(color[0], color[1]);
      //   if (pixels[brushColor]) {
      //     console.log(pixels[brushColor]);
      //     let oldPixel = pixels[brushColor];
      //     if (oldPixel.color === defaultColor) {
      //       setColor(brushColor, brushColorOne);
      //     } else if (oldPixel.color === brushColorOne) {
      //       setColor(brushColor, brushColorTwo);
      //     } else if (oldPixel.color === brushColorTwo) {
      //       setColor(brushColor, paintedColor);
      //     }
      //   }
      //   // Object.values(pixels).map((pixel: PixelValue) => {
      //   //   if (`${pixel.x}-${pixel.y}` == color[0]) {
      //   //     console.log(pixel.color);
      //   //     if (pixel.color === defaultColor) {
      //   //       setColor(pixel.id, color[1]);
      //   //     } else if (pixel.color === brushColorOne) {
      //   //       setColor(pixel.id, brushColorTwo);
      //   //     } else if (pixel.color === brushColorTwo) {
      //   //       setColor(pixel.id, paintedColor);
      //   //     }
      //   //   }
      //   // });
      // });
    };

    const onClick = (e: any) => {
      // setColor(id, paintedColor);
      setBrushColor(id);
      e.preventDefault();
    };

    const onContextMenu = (e: any) => {
      e.preventDefault();
    };

    const onMouseOver = (e: any) => {
      if (e.buttons === 0 && color === defaultColor) {
        setColor(id, hoverColor);
      } else if (e.buttons === 1) {
        // setColor(id, paintedColor);
        setBrushColor(id);
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
  const cleanColor = color.replace('#', '');
  const expandedColor =
    cleanColor.length === 3 ? cleanColor.repeat(2) : cleanColor;
  const red = parseInt(expandedColor.slice(0, 2), 16);
  const green = parseInt(expandedColor.slice(2, 4), 16);
  const blue = parseInt(expandedColor.slice(4, 6), 16);

  // Calculate the grayscale value
  const grayscale = 255 - (red * 0.299 + green * 0.587 + blue * 0.114);

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
      data.push(colorToGrayscale(pixels[id].color) / 255);
    });
    console.dir(data);

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
