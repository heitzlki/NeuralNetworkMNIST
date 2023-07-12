import React, { useRef, useEffect, useState } from 'react';

const DrawableCanvas = () => {
  const width = 400;
  const height = 400;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let isDrawing = false;
  let context: CanvasRenderingContext2D | null = null;
  const [prediction, setPrediction] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      context = canvas.getContext('2d');

      if (context) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = 25;
        context.strokeStyle = '#000';
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      isDrawing = true;
      context?.beginPath();
      context?.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    context?.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    context?.stroke();
  };

  const stopDrawing = () => {
    isDrawing = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    console.log('clearing canvas');
    if (canvas) {
      context?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const exportCanvas = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const exportContext = canvas.getContext('2d');
      if (exportContext) {
        const exportCanvas = document.createElement('canvas');
        const exportContext2D = exportCanvas.getContext('2d');
        if (exportContext2D) {
          exportCanvas.width = 28;
          exportCanvas.height = 28;
          exportContext2D.drawImage(canvas, 0, 0, 28, 28);

          const imageData = exportContext2D.getImageData(0, 0, 28, 28).data;
          const exportedPoints: number[] = [];

          for (let i = 0; i < imageData.length; i += 4) {
            const normalizedValue = imageData[i + 3] / 255;
            exportedPoints.push(normalizedValue);
          }

          try {
            const response = await fetch('http://127.0.0.1:5000/', {
              method: 'POST',
              body: JSON.stringify(exportedPoints),
            });

            if (response.ok) {
              const data = await response.json();
              if (data) {
                setPrediction(data);
              }
            } else {
              console.error('Failed to send data');
            }
          } catch (error) {
            console.error('Error sending data:', error);
          }
        }
      }
    }
  };

  return (
    <>
      <div>
        <h1>Prediction: {prediction}</h1>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: '1px solid #000' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <div>
        <button onClick={clearCanvas}>Clear</button>
        <button onClick={exportCanvas}>Export</button>
      </div>
    </>
  );
};

export default DrawableCanvas;
