import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
import Konva from 'konva';

/**
 * KonvaCanvas Component - Clean Setup
 * 
 * A robust infinite canvas built with react-konva.
 * Includes panning (draggable) and zooming (scroll wheel).
 */
export default function Canvas() {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const stageRef = useRef<Konva.Stage>(null);

  // Sync CSS Dotted Background
  useEffect(() => {
    if (stageRef.current) {
      const container = stageRef.current.container();
      
      // Define the dot pattern in CSS
      container.style.backgroundColor = '#f8fafc';
      container.style.backgroundImage = 'radial-gradient(#cbd5e1 0.8px, transparent 0.8px)';
      
      // Update background to match zoom and pan
      const baseGap = 100;
      container.style.backgroundSize = `${baseGap * scale}px ${baseGap * scale}px`;
      container.style.backgroundPosition = `${position.x}px ${position.y}px`;
    }
  }, [scale, position]);

  // Resize Listener
  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Zoom Handler
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // Smoother, Delta-based zooming (Canva-style)
    // We use Math.exp to make zooming feel linear as we move through scales
    const zoomIntensity = 0.0065;
    const delta = -e.evt.deltaY;
    const newScale = oldScale * Math.exp(delta * zoomIntensity);

    // Clamp zoom to reasonable limits
    const minScale = 0.3;
    const maxScale = 5;
    const clampedScale = Math.max(minScale, Math.min(newScale, maxScale));

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    setScale(clampedScale);
    setPosition(newPos);
  };

  // Drag Handler
  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    // Important: Use onDragMove for smooth background syncing
    setPosition({ x: e.target.x(), y: e.target.y() });
  };

  return (
    <div className="canvas-container w-full h-full">
      <Stage
        width={size.width}
        height={size.height}
        draggable
        ref={stageRef}
        onWheel={handleWheel}
        onDragMove={handleDragMove}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
      >
        <Layer>
          {/* Default shapes for spatial reference */}
          <Rect x={window.innerWidth / 2 - 50} y={window.innerHeight / 2 - 50} width={100} height={100} fill="#3b82f6" cornerRadius={10} shadowBlur={20} shadowColor="#3b82f644" />
          <Circle x={window.innerWidth / 2 + 100} y={window.innerHeight / 2} radius={40} fill="#a855f7" shadowBlur={20} shadowColor="#a855f744" />
          
          <Text 
            text="Space to Create" 
            x={window.innerWidth / 2 - 80} 
            y={window.innerHeight / 2 - 100} 
            fontSize={24} 
            fontFamily="Outfit" 
            fontStyle="bold"
            fill="#1e293b" 
          />
        </Layer>
      </Stage>
    </div>
  );
}



