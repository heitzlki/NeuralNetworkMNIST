import { useEffect, useRef, RefObject } from 'react';

interface Point {
  x: number;
  y: number;
}

interface CanvasProps {
  width: number;
  height: number;
}

type DrawFunction = (
  ctx: CanvasRenderingContext2D,
  point: Point | null,
  prevPoint: Point | null
) => void;

interface OnDrawProps {
  onDraw: DrawFunction;
}

export function useOnDraw(onDraw: DrawFunction) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const prevPointRef = useRef<Point | null>(null);

  const mouseMoveListenerRef = useRef<(e: MouseEvent) => void | null>(null);
  const mouseUpListenerRef = useRef<() => void | null>(null);

  function setCanvasRef(ref: HTMLCanvasElement) {
    canvasRef.current = ref;
  }

  function onCanvasMouseDown() {
    isDrawingRef.current = true;
  }

  useEffect(() => {
    function computePointInCanvas(
      clientX: number,
      clientY: number
    ): Point | null {
      if (canvasRef.current) {
        const boundingRect = canvasRef.current.getBoundingClientRect();
        return {
          x: clientX - boundingRect.left,
          y: clientY - boundingRect.top,
        };
      } else {
        return null;
      }
    }

    function initMouseMoveListener() {
      const mouseMoveListener = (e: MouseEvent) => {
        if (isDrawingRef.current && canvasRef.current) {
          const point = computePointInCanvas(e.clientX, e.clientY);
          const ctx = canvasRef.current.getContext('2d');
          if (onDraw) onDraw(ctx!, point, prevPointRef.current);
          prevPointRef.current = point;
          console.log(point);
        }
      };
      mouseMoveListenerRef.current = mouseMoveListener;
      window.addEventListener('mousemove', mouseMoveListener);
    }

    function initMouseUpListener() {
      const listener = () => {
        isDrawingRef.current = false;
        prevPointRef.current = null;
      };
      mouseUpListenerRef.current = listener;
      window.addEventListener('mouseup', listener);
    }

    function cleanup() {
      if (mouseMoveListenerRef.current) {
        window.removeEventListener('mousemove', mouseMoveListenerRef.current);
      }
      if (mouseUpListenerRef.current) {
        window.removeEventListener('mouseup', mouseUpListenerRef.current);
      }
    }

    initMouseMoveListener();
    initMouseUpListener();
    return () => cleanup();
  }, [onDraw]);

  return {
    setCanvasRef,
    onCanvasMouseDown,
  };
}

const Canvas = () => {
  const width = 500;
  const height = 500;

  const { setCanvasRef, onCanvasMouseDown } = useOnDraw(onDraw);

  function onDraw(
    ctx: CanvasRenderingContext2D,
    point: Point | null,
    prevPoint: Point | null
  ) {
    if (!ctx) return;
    if (!point) return;
    drawLine(prevPoint, point, ctx, '#000000', 5);
  }

  function drawLine(
    start: Point | null,
    end: Point,
    ctx: CanvasRenderingContext2D,
    color: string,
    width: number
  ) {
    start = start ?? end;
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(start.x, start.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  const canvasStyle: React.CSSProperties = {
    border: '1px solid black',
  };

  return (
    <canvas
      width={width}
      height={height}
      onMouseDown={onCanvasMouseDown}
      style={canvasStyle}
      ref={setCanvasRef}
    />
  );
};

export default Canvas;
