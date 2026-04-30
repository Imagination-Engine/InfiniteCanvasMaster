import React, { useEffect, useRef } from 'react';
import { Game, AUTO, Scale } from 'phaser';
import { SpinePlugin } from '@esotericsoftware/spine-phaser';

const EngineWrapper: React.FC = () => {
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Game({
        type: AUTO,
        width: 800,
        height: 600,
        parent: 'phaser-container',
        scale: {
          mode: Scale.FIT,
          autoCenter: Scale.CENTER_BOTH,
        },
        physics: {
          default: 'matter',
          matter: {
            debug: true,
            gravity: { x: 0, y: 1 }
          }
        },
        plugins: {
          scene: [
            { key: 'SpinePlugin', plugin: SpinePlugin, mapping: 'spine' }
          ]
        }
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div id="phaser-container" data-testid="phaser-container" style={{ width: '100%', height: '100%' }} />;
};

export default EngineWrapper;