import React, { useEffect, useRef } from 'react';

export interface LogEntry {
  id: string;
  agent: string;
  message: string;
}

export interface BuildLogUIProps {
  logs: LogEntry[];
}

const BuildLogUI: React.FC<BuildLogUIProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div 
      ref={containerRef}
      style={{
        height: '200px',
        overflowY: 'auto',
        background: '#1e1e1e',
        color: '#d4d4d4',
        padding: '10px',
        fontFamily: 'monospace'
      }}
      data-testid="build-log-container"
    >
      {logs.map(log => (
        <div key={log.id} style={{ marginBottom: '4px' }}>
          <strong style={{ color: '#569cd6' }}>{log.agent}: </strong>
          <span>{log.message}</span>
        </div>
      ))}
    </div>
  );
};

export default BuildLogUI;