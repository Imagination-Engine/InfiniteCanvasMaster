// Base code written by gemini ai


import { useState, useRef, useEffect, useCallback } from 'react';
// react-konva is a React wrapper for the Konva.js library, which is a 2D canvas framework.
// It allows us to draw shapes (Rect, Circle, Text) onto an HTML <canvas> element using React syntax.
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
import Konva from 'konva';

// By default, Konva stops listening to other touch events while a user is dragging an object.
// We enable this flag globally so that if a user is dragging the canvas with one finger,
// they can still put a second finger down to trigger our "pinch-to-zoom" logic without interruption.
if (typeof window !== 'undefined') {
  Konva.hitOnDragEnabled = true;
}

/**
 * Helper function: Calculates the straight-line distance between two points (p1 and p2).
 * This is used for pinch-to-zoom to figure out how far apart the user's two fingers are.
 * (Based on the Pythagorean theorem: a^2 + b^2 = c^2)
 */
const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Helper function: Calculates the exact middle point between two points (p1 and p2).
 * Used during pinch-to-zoom so we know *where* to zoom into (the center between the two fingers).
 */
const getCenter = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
};

/**
 * KonvaCanvas Component
 * 
 * This is the entire infinite canvas workspace. It handles:
 * 1. Rendering Konva shapes
 * 2. Panning (dragging the canvas around)
 * 3. Zooming (via mouse wheel on desktop, or pinch-to-zoom on mobile)
 * 4. Syncing a dotted CSS background to match the current pan/zoom state.
 */
export default function Canvas() {
  // --- STATE VARIABLES ---
  
  // `scale` controls how zoomed in or out the canvas is (1 = 100%, 0.5 = 50%, 2 = 200%)
  const [scale, setScale] = useState(1);
  
  // `position` controls where the "camera" is looking. (x and y offsets)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // `size` tracks the dimensions of the browser window to make the canvas full-screen.
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  // `stageRef` gives us direct access to the underlying Konva Stage object.
  // We need this for math calculations related to mouse/touch positions on the canvas.
  const stageRef = useRef<Konva.Stage>(null);

  // --- MULTI-TOUCH (PINCH-TO-ZOOM) STATE ---
  // Tracks the center point between two fingers from the previous frame
  const [lastCenter, setLastCenter] = useState<{ x: number; y: number } | null>(null);
  // Tracks the distance between two fingers from the previous frame
  const [lastDist, setLastDist] = useState<number>(0);
  // Tracks if the user's drag action was interrupted by a second finger (meaning they switched to zooming)
  const [dragStopped, setDragStopped] = useState<boolean>(false);

  // --- BACKGROUND SYNC EFFECT ---
  // This useEffect runs every time `scale` or `position` changes.
  useEffect(() => {
    // We only update the background if the stage is actually mounted and ready.
    if (stageRef.current) {
      // Get the HTML <div> element that Konva uses as its main container
      const container = stageRef.current.container();
      
      // We use standard CSS to create the dotted background instead of drawing hundreds of 
      // tiny circles in Konva. CSS rendering is much faster for simple repeated patterns.
      container.style.backgroundColor = '#f8fafc';
      container.style.backgroundImage = 'radial-gradient(#cbd5e1 0.8px, transparent 0.8px)';
      
      // Adjust the size and position of the CSS dots based on how far we've zoomed or panned
      const baseGap = 100; // Normal distance between dots
      container.style.backgroundSize = `${baseGap * scale}px ${baseGap * scale}px`;
      container.style.backgroundPosition = `${position.x}px ${position.y}px`;
    }
  }, [scale, position]);

  // --- RESIZE THE CANVAS ON WINDOW RESIZE ---
  useEffect(() => {
    const handleResize = () => {
      // Update our state to the new window dimensions whenever the user resizes their browser
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    
    // Cleanup function: React runs this when the component unmounts to prevent memory leaks.
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- DESKTOP: MOUSE WHEEL ZOOMING ---
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault(); // Stop the entire web page from scrolling up/down
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    
    // Find out exactly where the user's mouse is pointing on the screen.
    // We want to zoom *towards* their mouse cursor.
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // We use a math formula to make zooming feel smooth, similar to Canva or Figma.
    // E.evt.deltaY is how fast/hard the user spun the mouse wheel.
    const zoomIntensity = 0.0065;
    const delta = -e.evt.deltaY;
    const newScale = oldScale * Math.exp(delta * zoomIntensity);

    // Don't let the user zoom out to microscopic levels or zoom in too far. (10% to 1000%)
    const minScale = 0.1;
    const maxScale = 10;
    const clampedScale = Math.max(minScale, Math.min(newScale, maxScale));

    // Complex math: Calculate how much we need to shift the `x` and `y` position
    // of the entire canvas so that the spot under the mouse cursor stays under the mouse cursor
    // after the scale changes.
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    // Update React state to trigger a re-render with the new zoom and position
    setScale(clampedScale);
    setPosition(newPos);
  };

  // --- PANNING / DRAGGING ---
  
  // Runs continuously while the user is actively dragging the canvas
  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    // PERFECT PERFORMANCE TRICK: 
    // We do NOT update the `setPosition` state here. Updating React state 60 times a second 
    // forces the whole app to re-render, causing lag.
    // Instead, we just directly manipulate the CSS background image so the dots move with the mouse.
    if (stageRef.current) {
      const container = stageRef.current.container();
      container.style.backgroundPosition = `${e.target.x()}px ${e.target.y()}px`;
    }
  };

  // Runs exactly once when the user lets go of the mouse/touch after dragging
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    setDragStopped(false);
    // Finally, we update the React state so the app knows the new final position.
    setPosition({ x: e.target.x(), y: e.target.y() });
  };

  // --- MOBILE: PINCH-TO-ZOOM ---
  // We wrap this in `useCallback` to prevent it from being recreated on every render.
  const handleTouchMove = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    e.evt.preventDefault();
    
    // Get the exact screen coordinates of the first two fingers touching the screen
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];
    const stage = stageRef.current;
    if (!stage) return;

    // If the user had two fingers down, and lifted one off, they want to go back to normal panning.
    if (touch1 && !touch2 && !stage.isDragging() && dragStopped) {
      stage.startDrag();
      setDragStopped(false);
    }

    // IF TWO FINGERS ARE CURRENTLY TOUCHING THE SCREEN:
    if (touch1 && touch2) {
      // Force stop standard panning because we are switching to pinch-zooming
      if (stage.isDragging()) {
        stage.stopDrag();
        setDragStopped(true);
      }

      // Figure out where the fingers are relative to the top-left corner of the canvas container
      const rect = stage.container().getBoundingClientRect();
      const p1 = {
        x: touch1.clientX - rect.left,
        y: touch1.clientY - rect.top,
      };
      const p2 = {
        x: touch2.clientX - rect.left,
        y: touch2.clientY - rect.top,
      };

      // If this is the very first frame of a two-finger touch, just record the starting center point and wait for the next frame.
      if (!lastCenter) {
        setLastCenter(getCenter(p1, p2));
        return;
      }

      const newCenter = getCenter(p1, p2); // Where are the fingers centered now?
      const dist = getDistance(p1, p2);    // How far apart are the fingers?

      // If we don't know the previous distance, record it and wait
      if (!lastDist) {
        setLastDist(dist);
        return;
      }

      // Convert the center point into "local space" (coordinates relative to the unscaled canvas)
      const pointTo = {
        x: (newCenter.x - position.x) / scale,
        y: (newCenter.y - position.y) / scale,
      };

      // Calculate the new zoom level based on how much the fingers spread apart or squeezed together
      const newScale = scale * (dist / lastDist);
      const clampedScale = Math.max(0.1, Math.min(newScale, 10));

      // Calculate how much the center point moved between the two fingers (for panning while zooming)
      const dx = newCenter.x - lastCenter.x;
      const dy = newCenter.y - lastCenter.y;

      // Calculate the new camera position
      const newPos = {
        x: newCenter.x - pointTo.x * clampedScale + dx,
        y: newCenter.y - pointTo.y * clampedScale + dy,
      };

      // Update state for this frame!
      setScale(clampedScale);
      setPosition(newPos);
      setLastDist(dist);
      setLastCenter(newCenter);
    }
  }, [dragStopped, lastCenter, lastDist, position, scale]); // Dependencies for useCallback

  // Runs when user lifts all fingers off the screen
  const handleTouchEnd = () => {
    // Reset our pinch-to-zoom tracking variables
    setLastDist(0);
    setLastCenter(null);
  };

  return (
    // The main wrapper for our canvas. We hide overflow so nothing bleeds off the edges.
    <div className="canvas-container w-full h-full absolute inset-0 overflow-hidden">
      
      {/* 
        The Konva <Stage> is the root element. It creates the actual HTML <canvas> tag.
        We pass it all of our state (size, scale, position) and event handlers (scroll, drag, touch).
      */}
      <Stage
        width={size.width}
        height={size.height}
        draggable // Enables dragging the entire stage by clicking and holding on empty space
        ref={stageRef}
        onWheel={handleWheel}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
      >
        {/* 
          A <Layer> is like a transparent sheet of plastic we draw shapes on. 
          You can have multiple layers for better performance if some things update often while others are static.
        */}
        <Layer>
          {/* THESE ARE DEMO SHAPES - Replace them with dynamic data mapping later */}
          <Rect 
            x={size.width / 2 - 50} 
            y={size.height / 2 - 50} 
            width={100} 
            height={100} 
            fill="#3b82f6" // Tailwind blue-500 equivalent
            cornerRadius={10} 
            shadowBlur={20} 
            shadowColor="rgba(59, 130, 246, 0.4)" 
          />
          <Circle 
            x={size.width / 2 + 100} 
            y={size.height / 2} 
            radius={40} 
            fill="#a855f7" // Tailwind purple-500 equivalent
            shadowBlur={20} 
            shadowColor="rgba(168, 85, 247, 0.4)" 
          />
          
          <Text 
            text="Space to Create" 
            x={size.width / 2 - 80} 
            y={size.height / 2 - 100} 
            fontSize={24} 
            fontFamily="Outfit" 
            fontStyle="bold"
            fill="#1e293b" // Tailwind slate-800 equivalent
          />
        </Layer>
      </Stage>
    </div>
  );
}
