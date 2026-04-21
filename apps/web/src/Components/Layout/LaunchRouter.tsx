import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

export type SurfaceType = 'playable' | 'conductor' | 'reel' | 'forge';

export const getRouteForSurface = (surface: SurfaceType, sessionId: string): string => {
  switch (surface) {
    case 'playable':
      return `/playable/${sessionId}`;
    case 'conductor':
      return `/conductor/${sessionId}`;
    case 'reel':
      return `/reel/${sessionId}`;
    case 'forge':
      return `/forge/${sessionId}`;
    default:
      return `/chat/${sessionId}`;
  }
};

interface LaunchRouterProps {
  surface?: SurfaceType;
  sessionId?: string;
}

export const LaunchRouter: React.FC<LaunchRouterProps> = ({ surface, sessionId }) => {
  const params = useParams();
  const id = sessionId || params.id;
  const type = surface || (params.surface as SurfaceType);

  if (!id) return <Navigate to="/chat" replace />;

  const targetRoute = getRouteForSurface(type, id);
  return <Navigate to={targetRoute} replace />;
};
