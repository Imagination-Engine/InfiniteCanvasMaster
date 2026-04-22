import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Background,
  Controls,
  ReactFlow,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FileNode } from "./FileNode";
import type { FileSystemNodeData } from "./types";

const NODE_WIDTH = 240;
const NODE_HEIGHT = 96;

const FILE_NODE_TYPES: NodeTypes = {
  fileNode: FileNode,
};

type LassoPoint = { x: number; y: number };

type FilesystemCanvasProps = {
  isLassoActive: boolean;
  addNodeNonce: number;
  onSelectionDataChange: (
    selectedNodes: FileSystemNodeData[],
  ) => void;
};

let idCounter = 0;
const nextId = () =>
  `fs-node-${Date.now()}-${idCounter++}`;

const buildEmptyNode = (
  id: string,
  x: number,
  y: number,
  onChooseFiles: (nodeId: string) => void,
  onChooseFolder: (nodeId: string) => void,
): Node<FileSystemNodeData> => ({
  id,
  type: "fileNode",
  position: { x, y },
  data: {
    id,
    name: "Empty",
    type: "folder",
    path: "",
    isEmpty: true,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    onChooseFiles,
    onChooseFolder,
  },
});

const isTextBasedFile = (file: File) => {
  if (file.type.startsWith("text/")) return true;

  const textLikeMime = [
    "application/json",
    "application/javascript",
    "application/typescript",
    "application/xml",
    "application/x-httpd-php",
    "application/x-sh",
  ];
  if (textLikeMime.includes(file.type)) return true;

  const textExtensions = [
    "txt",
    "md",
    "mdx",
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "yml",
    "yaml",
    "xml",
    "html",
    "css",
    "scss",
    "py",
    "java",
    "go",
    "rs",
    "rb",
    "c",
    "cpp",
    "h",
    "hpp",
    "sql",
    "sh",
  ];

  const extension = file.name
    .split(".")
    .pop()
    ?.toLowerCase();
  return Boolean(
    extension && textExtensions.includes(extension),
  );
};

const readAsText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(String(reader.result ?? ""));
    reader.onerror = () =>
      reject(reader.error ?? new Error("read failed"));
    reader.readAsText(file);
  });

const getParentPath = (path: string) => {
  const index = path.lastIndexOf("/");
  return index < 0 ? "" : path.slice(0, index);
};

const pointInPolygon = (
  point: LassoPoint,
  polygon: LassoPoint[],
) => {
  let inside = false;
  for (
    let i = 0, j = polygon.length - 1;
    i < polygon.length;
    j = i++
  ) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersects =
      yi > point.y !== yj > point.y &&
      point.x <
        ((xj - xi) * (point.y - yi)) /
          (yj - yi || 1e-7) +
          xi;
    if (intersects) inside = !inside;
  }
  return inside;
};

const orientation = (
  p: LassoPoint,
  q: LassoPoint,
  r: LassoPoint,
) => {
  const value =
    (q.y - p.y) * (r.x - q.x) -
    (q.x - p.x) * (r.y - q.y);
  if (Math.abs(value) < 1e-9) return 0;
  return value > 0 ? 1 : 2;
};

const onSegment = (
  p: LassoPoint,
  q: LassoPoint,
  r: LassoPoint,
) =>
  q.x <= Math.max(p.x, r.x) &&
  q.x >= Math.min(p.x, r.x) &&
  q.y <= Math.max(p.y, r.y) &&
  q.y >= Math.min(p.y, r.y);

const linesIntersect = (
  a1: LassoPoint,
  a2: LassoPoint,
  b1: LassoPoint,
  b2: LassoPoint,
) => {
  const o1 = orientation(a1, a2, b1);
  const o2 = orientation(a1, a2, b2);
  const o3 = orientation(b1, b2, a1);
  const o4 = orientation(b1, b2, a2);

  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(a1, b1, a2)) return true;
  if (o2 === 0 && onSegment(a1, b2, a2)) return true;
  if (o3 === 0 && onSegment(b1, a1, b2)) return true;
  if (o4 === 0 && onSegment(b1, a2, b2)) return true;
  return false;
};

const rectIntersectsPolygon = (
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
  polygon: LassoPoint[],
) => {
  const corners = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    {
      x: rect.x + rect.width,
      y: rect.y + rect.height,
    },
    { x: rect.x, y: rect.y + rect.height },
  ];
  const rectEdges = [
    [corners[0], corners[1]],
    [corners[1], corners[2]],
    [corners[2], corners[3]],
    [corners[3], corners[0]],
  ] as const;

  const polygonBounds = polygon.reduce(
    (acc, p) => ({
      minX: Math.min(acc.minX, p.x),
      minY: Math.min(acc.minY, p.y),
      maxX: Math.max(acc.maxX, p.x),
      maxY: Math.max(acc.maxY, p.y),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  );

  if (
    rect.x > polygonBounds.maxX ||
    rect.x + rect.width < polygonBounds.minX ||
    rect.y > polygonBounds.maxY ||
    rect.y + rect.height < polygonBounds.minY
  ) {
    return false;
  }

  if (
    corners.some((corner) =>
      pointInPolygon(corner, polygon),
    )
  ) {
    return true;
  }

  if (
    polygon.some(
      (p) =>
        p.x >= rect.x &&
        p.x <= rect.x + rect.width &&
        p.y >= rect.y &&
        p.y <= rect.y + rect.height,
    )
  ) {
    return true;
  }

  for (let i = 0; i < polygon.length; i += 1) {
    const start = polygon[i];
    const end = polygon[(i + 1) % polygon.length];
    for (const [a, b] of rectEdges) {
      if (linesIntersect(start, end, a, b)) {
        return true;
      }
    }
  }

  return false;
};

export function FilesystemCanvas({
  isLassoActive,
  addNodeNonce,
  onSelectionDataChange,
}: FilesystemCanvasProps) {
  const [uploadNodeId, setUploadNodeId] = useState<
    string | null
  >(null);
  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<FileSystemNodeData>>([]);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<Edge>([]);
  const [isDrawingLasso, setIsDrawingLasso] =
    useState(false);
  const [lassoPoints, setLassoPoints] = useState<
    LassoPoint[]
  >([]);

  const nodesRef = useRef(nodes);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const flow = useReactFlow<Node<FileSystemNodeData>, Edge>();

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const chooseFiles = useCallback((nodeId: string) => {
    setUploadNodeId(nodeId);
    fileInputRef.current?.click();
  }, []);

  const chooseFolder = useCallback((nodeId: string) => {
    setUploadNodeId(nodeId);
    folderInputRef.current?.click();
  }, []);

  useEffect(() => {
    setNodes([
      buildEmptyNode(
        nextId(),
        120,
        120,
        chooseFiles,
        chooseFolder,
      ),
    ]);
    setEdges([]);
  }, [chooseFiles, chooseFolder, setEdges, setNodes]);

  useEffect(() => {
    if (addNodeNonce <= 0) return;

    setNodes((current) => [
      ...current,
      buildEmptyNode(
        nextId(),
        160 + current.length * 40,
        120 + current.length * 30,
        chooseFiles,
        chooseFolder,
      ),
    ]);
  }, [
    addNodeNonce,
    chooseFiles,
    chooseFolder,
    setNodes,
  ]);

  useEffect(() => {
    const selectedData = nodes
      .filter((node) => node.selected)
      .map((node) => node.data);
    onSelectionDataChange(selectedData);
  }, [nodes, onSelectionDataChange]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (
        !connection.source ||
        !connection.target ||
        connection.source === connection.target
      ) {
        return;
      }

      setNodes((current) =>
        current.map((node) => {
          if (node.id !== connection.target) {
            return node;
          }
          return {
            ...node,
            data: {
              ...node.data,
              parentId: connection.source ?? undefined,
            },
          };
        }),
      );

      setEdges((current) => {
        const withoutOldParent = current.filter(
          (edge) => edge.target !== connection.target,
        );
        return addEdge(
          {
            ...connection,
            id: `edge-${connection.source}-${connection.target}`,
          },
          withoutOldParent,
        );
      });
    },
    [setEdges, setNodes],
  );

  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      const deletedIds = new Set(
        deletedNodes.map((node) => node.id),
      );
      setNodes((current) =>
        current.map((node) =>
          node.data.parentId &&
          deletedIds.has(node.data.parentId)
            ? {
                ...node,
                data: {
                  ...node.data,
                  parentId: undefined,
                },
              }
            : node,
        ),
      );
    },
    [setNodes],
  );

  const processFilesUpload = useCallback(
    async (files: FileList | null, isFolderUpload: boolean) => {
      if (!files || !uploadNodeId) return;

      const textFiles = Array.from(files).filter(
        isTextBasedFile,
      );
      if (textFiles.length === 0) return;

      const loaded = await Promise.all(
        textFiles.map(async (file) => ({
          file,
          content: await readAsText(file),
        })),
      );

      setNodes((currentNodes) => {
        const rootIndex = currentNodes.findIndex(
          (node) => node.id === uploadNodeId,
        );
        if (rootIndex < 0) return currentNodes;

        const rootNode = currentNodes[rootIndex];
        const baseNodes = [...currentNodes];
        const nextNodes: Node<FileSystemNodeData>[] = [];
        const nextEdges: Edge[] = [];
        const childrenByParent: Record<string, number> = {};
        const positions = new Map<
          string,
          { x: number; y: number }
        >();

        const assignChildPosition = (parentId: string) => {
          const parentPosition = positions.get(parentId) ??
            rootNode.position;
          const index = childrenByParent[parentId] ?? 0;
          childrenByParent[parentId] = index + 1;
          return {
            x: parentPosition.x + index * 270 - 80,
            y: parentPosition.y + 140,
          };
        };

        if (!isFolderUpload && loaded.length === 1) {
          const only = loaded[0];
          baseNodes[rootIndex] = {
            ...rootNode,
            data: {
              ...rootNode.data,
              id: rootNode.id,
              name: only.file.name,
              type: "file",
              path: only.file.name,
              content: only.content,
              isEmpty: false,
              parentId: rootNode.data.parentId,
            },
          };
          return baseNodes;
        }

        const rootPath =
          loaded[0].file.webkitRelativePath.split("/")[0] ||
          "Uploaded Files";

        baseNodes[rootIndex] = {
          ...rootNode,
          data: {
            ...rootNode.data,
            id: rootNode.id,
            name: isFolderUpload ? rootPath : "Uploaded Files",
            type: "folder",
            path: isFolderUpload ? rootPath : "Uploaded Files",
            isEmpty: false,
          },
        };

        const pathToId = new Map<string, string>();
        const folderPaths = new Set<string>();
        pathToId.set(
          isFolderUpload ? rootPath : "Uploaded Files",
          rootNode.id,
        );
        positions.set(rootNode.id, rootNode.position);

        for (const item of loaded) {
          const rawPath = isFolderUpload
            ? item.file.webkitRelativePath
            : `Uploaded Files/${item.file.name}`;
          const parts = rawPath.split("/").filter(Boolean);
          for (let i = 1; i < parts.length - 1; i += 1) {
            folderPaths.add(parts.slice(0, i + 1).join("/"));
          }
        }

        const sortedFolders = Array.from(folderPaths).sort(
          (a, b) => a.split("/").length - b.split("/").length,
        );

        for (const folderPath of sortedFolders) {
          const parentPath = getParentPath(folderPath);
          const parentId =
            pathToId.get(parentPath) ?? rootNode.id;
          const folderId = nextId();
          pathToId.set(folderPath, folderId);
          const position = assignChildPosition(parentId);
          positions.set(folderId, position);

          const folderName = folderPath.split("/").pop()!;
          nextNodes.push({
            id: folderId,
            type: "fileNode",
            position,
            data: {
              id: folderId,
              name: folderName,
              type: "folder",
              path: folderPath,
              parentId,
              isEmpty: false,
              width: NODE_WIDTH,
              height: NODE_HEIGHT,
              onChooseFiles: chooseFiles,
              onChooseFolder: chooseFolder,
            },
          });
          nextEdges.push({
            id: `edge-${parentId}-${folderId}`,
            source: parentId,
            target: folderId,
          });
        }

        for (const item of loaded) {
          const fullPath = isFolderUpload
            ? item.file.webkitRelativePath
            : `Uploaded Files/${item.file.name}`;
          const parentPath = getParentPath(fullPath);
          const parentId =
            pathToId.get(parentPath) ?? rootNode.id;
          const fileId = nextId();
          const position = assignChildPosition(parentId);
          positions.set(fileId, position);
          nextNodes.push({
            id: fileId,
            type: "fileNode",
            position,
            data: {
              id: fileId,
              name: item.file.name,
              type: "file",
              path: fullPath,
              content: item.content,
              parentId,
              isEmpty: false,
              width: NODE_WIDTH,
              height: NODE_HEIGHT,
              onChooseFiles: chooseFiles,
              onChooseFolder: chooseFolder,
            },
          });
          nextEdges.push({
            id: `edge-${parentId}-${fileId}`,
            source: parentId,
            target: fileId,
          });
        }

        setEdges((currentEdges) => [
          ...currentEdges.filter(
            (edge) => edge.source !== rootNode.id,
          ),
          ...nextEdges,
        ]);

        return [...baseNodes, ...nextNodes];
      });
    },
    [chooseFiles, chooseFolder, setEdges, setNodes, uploadNodeId],
  );

  const onFilesInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      await processFilesUpload(event.target.files, false);
      event.target.value = "";
      setUploadNodeId(null);
    },
    [processFilesUpload],
  );

  const onFolderInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      await processFilesUpload(event.target.files, true);
      event.target.value = "";
      setUploadNodeId(null);
    },
    [processFilesUpload],
  );

  const lassoPathD = useMemo(() => {
    if (lassoPoints.length === 0) return "";
    const [first, ...rest] = lassoPoints;
    const commands = [
      `M ${first.x} ${first.y}`,
      ...rest.map((point) => `L ${point.x} ${point.y}`),
    ];
    if (!isDrawingLasso && lassoPoints.length > 2) {
      commands.push("Z");
    }
    return commands.join(" ");
  }, [isDrawingLasso, lassoPoints]);

  const onOverlayMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!isLassoActive || !wrapperRef.current) return;
      event.preventDefault();
      const rect =
        wrapperRef.current.getBoundingClientRect();
      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      setIsDrawingLasso(true);
      setLassoPoints([point]);
    },
    [isLassoActive],
  );

  const onOverlayMouseMove = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!isLassoActive || !isDrawingLasso) return;
      if (!wrapperRef.current) return;
      const rect =
        wrapperRef.current.getBoundingClientRect();
      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      setLassoPoints((current) => [...current, point]);
    },
    [isDrawingLasso, isLassoActive],
  );

  const onOverlayMouseUp = useCallback(() => {
    if (!isLassoActive || !isDrawingLasso) return;
    setIsDrawingLasso(false);

    if (lassoPoints.length < 3) {
      setLassoPoints([]);
      return;
    }

    const { x: viewX, y: viewY, zoom } =
      flow.getViewport();
    const selectedIds = new Set<string>();

    for (const node of nodesRef.current) {
      const width = node.data.width ?? NODE_WIDTH;
      const height = node.data.height ?? NODE_HEIGHT;
      const rect = {
        x: node.position.x * zoom + viewX,
        y: node.position.y * zoom + viewY,
        width: width * zoom,
        height: height * zoom,
      };
      if (rectIntersectsPolygon(rect, lassoPoints)) {
        selectedIds.add(node.id);
      }
    }

    setNodes((current) =>
      current.map((node) => ({
        ...node,
        selected: selectedIds.has(node.id),
      })),
    );
    setLassoPoints([]);
  }, [
    flow,
    isDrawingLasso,
    isLassoActive,
    lassoPoints,
    setNodes,
  ]);

  const onSelectionChange = useCallback(
    ({
      nodes: selectedNodes,
    }: {
      nodes: Node[];
      edges: Edge[];
    }) => {
      const selectedIds = new Set(
        selectedNodes.map((node) => node.id),
      );
      setNodes((current) =>
        current.map((node) => ({
          ...node,
          selected: selectedIds.has(node.id),
        })),
      );
    },
    [setNodes],
  );

  return (
    <div ref={wrapperRef} className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onNodesDelete}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={FILE_NODE_TYPES}
        fitView
        deleteKeyCode={["Backspace", "Delete"]}
      >
        <Background gap={20} size={1.5} color="#cbd5e1" />
        <Controls />
      </ReactFlow>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onFilesInputChange}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onFolderInputChange}
        {...({
          webkitdirectory: "",
          directory: "",
        } as Record<string, string>)}
      />

      {isLassoActive ? (
        <div
          className="absolute inset-0 z-20 cursor-crosshair"
          onMouseDown={onOverlayMouseDown}
          onMouseMove={onOverlayMouseMove}
          onMouseUp={onOverlayMouseUp}
          onMouseLeave={onOverlayMouseUp}
        >
          <svg className="h-full w-full">
            {lassoPathD ? (
              <path
                d={lassoPathD}
                fill="rgba(59, 130, 246, 0.14)"
                stroke="#3b82f6"
                strokeWidth={1.5}
                strokeDasharray="5 4"
              />
            ) : null}
          </svg>
        </div>
      ) : null}
    </div>
  );
}
