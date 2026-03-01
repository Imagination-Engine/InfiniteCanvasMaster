import Canvas from "../Components/Canvas";
import { Sidebar } from "../Components/Sidebar";

export default function ImaginationCanvas() {
  return (
    <div className="flex w-full h-full text-slate-900 shrink-0 flex-1">
      <Sidebar />
      <Canvas />
    </div>
  );
}
