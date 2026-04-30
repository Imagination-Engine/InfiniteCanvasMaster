import React, { useState } from 'react';

const PlayableCanvas: React.FC = () => {
  const [isPlayableMode, setIsPlayableMode] = useState(false);

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', background: '#ccc' }}>
        <button onClick={() => setIsPlayableMode(!isPlayableMode)}>
          Toggle Mode
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isPlayableMode ? (
          <div>Playable Engine Mode</div>
        ) : (
          <div>Standard Canvas Mode</div>
        )}
      </div>
    </div>
  );
};

export default PlayableCanvas;