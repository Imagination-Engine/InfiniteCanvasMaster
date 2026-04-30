import React from 'react';

export interface TimelineScene {
  id: string;
  startTimeMs: number;
  durationMs: number;
  name: string;
  thumbnailUrl?: string;
}

interface TimelineUIProps {
  scenes: TimelineScene[];
}

const TimelineUI: React.FC<TimelineUIProps> = ({ scenes }) => {
  return (
    <div style={{ width: '100%', height: '150px', background: '#333', overflowX: 'auto', display: 'flex' }} data-testid="timeline-track">
      {scenes.map(scene => (
        <div 
          key={scene.id} 
          style={{ 
            minWidth: `${Math.max(100, scene.durationMs / 20)}px`, 
            border: '1px solid #555',
            background: '#444',
            color: '#fff',
            padding: '4px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ fontSize: '12px', marginBottom: '4px' }}>{scene.name}</div>
          {scene.thumbnailUrl && (
            <img 
              src={scene.thumbnailUrl} 
              alt={`thumbnail for ${scene.name}`} 
              style={{ width: '100%', height: '80px', objectFit: 'cover' }} 
              loading="lazy" 
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default TimelineUI;