import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @ts-nocheck
import { useMemo } from "react";
import { useCanvasStore } from "../state/canvasStore";
import { useConnectionStore } from "../state/connectionStore";
export const ConnectorLayer = () => {
  const connectionsRecord = useConnectionStore((s) => s.connections);
  const connections = useMemo(
    () => Object.values(connectionsRecord),
    [connectionsRecord],
  );
  const objectsRecord = useCanvasStore((s) => s.objects);
  const objects = useMemo(() => {
    return Object.values(objectsRecord);
  }, [objectsRecord]);
  console.log(
    `[ConnectorLayer] Rendering ${connections.length} connections with ${objects.length} objects.`,
  );
  return _jsxs("svg", {
    className: "absolute top-0 left-0 pointer-events-none",
    style: { overflow: "visible", width: 1, height: 1 },
    children: [
      _jsxs("defs", {
        children: [
          _jsxs("linearGradient", {
            id: "edge-gradient",
            x1: "0%",
            y1: "0%",
            x2: "100%",
            y2: "0%",
            children: [
              _jsx("stop", {
                offset: "0%",
                stopColor: "rgba(0, 194, 255, 0.2)",
              }),
              _jsx("stop", {
                offset: "50%",
                stopColor: "rgba(0, 194, 255, 0.6)",
              }),
              _jsx("stop", {
                offset: "100%",
                stopColor: "rgba(0, 194, 255, 0.2)",
              }),
            ],
          }),
          _jsx("marker", {
            id: "dot-end",
            markerWidth: "8",
            markerHeight: "8",
            refX: "4",
            refY: "4",
            orient: "auto",
            children: _jsx("circle", {
              cx: "4",
              cy: "4",
              r: "3",
              fill: "rgba(0, 194, 255, 1)",
              stroke: "rgba(255, 255, 255, 0.2)",
              strokeWidth: "1",
            }),
          }),
          _jsxs("filter", {
            id: "glow-connector",
            children: [
              _jsx("feGaussianBlur", {
                stdDeviation: "2",
                result: "coloredBlur",
              }),
              _jsxs("feMerge", {
                children: [
                  _jsx("feMergeNode", { in: "coloredBlur" }),
                  _jsx("feMergeNode", { in: "SourceGraphic" }),
                ],
              }),
            ],
          }),
        ],
      }),
      connections.map((conn) => {
        const sourceObj = objects.find((o) => o.id === conn.fromId);
        const targetObj = objects.find((o) => o.id === conn.toId);
        if (!sourceObj || !targetObj) return null;
        const startX = sourceObj.x + sourceObj.width;
        const startY = sourceObj.y + sourceObj.height / 2;
        const endX = targetObj.x;
        const endY = targetObj.y + targetObj.height / 2;
        const dx = Math.abs(endX - startX);
        const controlPointOffset = Math.min(Math.max(dx * 0.4, 50), 200);
        const path =
          "M " +
          startX +
          " " +
          startY +
          " C " +
          (startX + controlPointOffset) +
          " " +
          startY +
          ", " +
          (endX - controlPointOffset) +
          " " +
          endY +
          ", " +
          endX +
          " " +
          endY;
        return _jsxs(
          "g",
          {
            className: "group/edge",
            children: [
              _jsx("path", {
                d: path,
                fill: "none",
                stroke: "transparent",
                strokeWidth: 20,
                className: "pointer-events-auto cursor-pointer",
              }),
              _jsx("path", {
                d: path,
                fill: "none",
                stroke: "url(#edge-gradient)",
                strokeWidth: 3,
                className:
                  "transition-all duration-300 opacity-80 group-hover/edge:opacity-100 group-hover/edge:stroke-brand-cyan",
                markerEnd: "url(#dot-end)",
                filter: "url(#glow-connector)",
              }),
              _jsx("circle", {
                r: 3,
                fill: "#00c2ff",
                className: "shadow-[0_0_12px_rgba(0,194,255,1)]",
                children: _jsx("animateMotion", {
                  dur: "2s",
                  repeatCount: "indefinite",
                  path: path,
                }),
              }),
            ],
          },
          conn.id,
        );
      }),
    ],
  });
};
