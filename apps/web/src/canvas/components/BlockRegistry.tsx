import React, { Suspense } from "react";
import { ProseView } from "@iem/surface-scribe";

// A registry mapping block IDs to their specific React views
const blockViews: Record<string, React.FC<any>> = {};

export function registerBlockView(blockId: string, Component: React.FC<any>) {
  blockViews[blockId] = Component;
}

// Initial registrations
registerBlockView("iem.scribe.prose", ProseView);

export function getBlockView(blockId: string) {
  return blockViews[blockId];
}

const GenericFallbackView: React.FC<{ data: any; blockId: string }> = ({
  data,
  blockId,
}) => (
  <div className="p-2 text-xs opacity-70 break-all font-mono">
    {Object.keys(data || {}).length > 0 ? (
      <pre>{JSON.stringify(data, null, 2)}</pre>
    ) : (
      <div className="italic text-center mt-4">No payload configuration.</div>
    )}
  </div>
);

export function BlockRenderer({
  blockId,
  data,
}: {
  blockId: string;
  data: any;
}) {
  const Component = getBlockView(blockId);
  if (!Component) {
    return <GenericFallbackView data={data} blockId={blockId} />;
  }
  return (
    <Suspense
      fallback={<div className="p-2 text-xs">Loading {blockId}...</div>}
    >
      <Component data={data} />
    </Suspense>
  );
}
