import { HTMLContainer, ShapeUtil } from "tldraw";
import type { TLBaseShape } from "tldraw";
import "tldraw/tldraw.css";
import { NODE_CATALOG } from "../nodes/nodeCatalog";

// Define the Tldraw shape for our Imagination Engine Blocks
export type IemBlockShape = TLBaseShape<
  "iem-block",
  {
    w: number;
    h: number;
    blockId: string;
    label: string;
    inputs: Record<string, any>;
    outputs: Record<string, any>;
  }
>;

export class IemBlockShapeUtil extends ShapeUtil<any> {
  static override type = "iem-block" as const;

  override getDefaultProps(): IemBlockShape["props"] {
    return {
      w: 240,
      h: 120,
      blockId: "unknown",
      label: "Unknown Block",
      inputs: {},
      outputs: {},
    };
  }

  getGeometry(shape: IemBlockShape) {
    return new (window as any).tldraw.Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  component(shape: IemBlockShape) {
    const catalogEntry = NODE_CATALOG[shape.props.blockId];
    const categoryColor =
      catalogEntry?.category === "creative"
        ? "bg-brand-purple/20 border-brand-purple/50"
        : "bg-brand-cyan/20 border-brand-cyan/50";

    return (
      <HTMLContainer
        id={shape.id}
        className={`pointer-events-auto flex flex-col rounded-xl border-2 shadow-2xl backdrop-blur-xl overflow-hidden ${categoryColor}`}
        style={{
          width: shape.props.w,
          height: shape.props.h,
          color: "white",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div className="bg-black/40 px-3 py-2 font-bold text-sm border-b border-white/10 flex items-center justify-between">
          <span className="truncate">{shape.props.label}</span>
          <span className="text-[10px] opacity-50 uppercase tracking-widest">
            {catalogEntry?.category || "Block"}
          </span>
        </div>

        <div className="flex-1 p-3 flex flex-col justify-between text-xs">
          <div className="flex flex-col gap-1">
            {Object.keys(shape.props.inputs || {}).map((key) => (
              <div key={key} className="flex items-center gap-1.5 opacity-80">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                <span>{key}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1 items-end">
            {Object.keys(shape.props.outputs || {}).map((key) => (
              <div key={key} className="flex items-center gap-1.5 opacity-80">
                <span>{key}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
              </div>
            ))}
          </div>
        </div>
      </HTMLContainer>
    );
  }

  indicator(shape: IemBlockShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
