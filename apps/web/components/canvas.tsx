import { useEffect, useRef, useState } from "react";
import Bar from "./bar";
import {
  Circle,
  Eraser,
  Hand,
  Lock,
  LockOpen,
  Minus,
  Plus,
  MousePointer2,
  Pencil,
  Redo2,
  Share,
  Square,
  Type,
  Undo2,
} from "lucide-react";
import DrawRoom from "../draw/drawRoom";
import toast from "react-hot-toast";

export default function Canvas({
  ws,
  roomId,
}: {
  ws: WebSocket;
  roomId: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [session, setSession] = useState<DrawRoom>();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeTool, setActiveTool] = useState<string>("Arrow");
  const [locked, setLocked] = useState<boolean>(false);
  //const [logo, setLogo] = useState<boolean>(true);

  const handleClick = (tool: string) => {
    session?.setTool(tool);
    setActiveTool(tool);
  };

  const toggleLock = () => {
    const next = !locked;
    session?.setLocked(next);
    setLocked(next);
    toast.success(next ? "Canvas locked" : "Canvas unlocked");
  };

  const handleZoomChange = (scale: number) => {
    setZoomLevel(Math.round(scale * 100));
  };

  const ToolButton = ({
    tool,
    label,
    children,
  }: {
    tool: string;
    label: string;
    children: any;
  }) => {
    const isActive = activeTool === tool;
    return (
      <button
        type="button"
        onClick={() => {
          handleClick(tool);
          toast.success(`${label} selected`);
        }}
        aria-label={label}
        aria-pressed={isActive}
        title={label}
        className={`flex items-center justify-center size-9 rounded-lg transition-colors cursor-pointer ${
          isActive
            ? "bg-[#ECC19C] text-[#1C726D]"
            : "text-[#ECC19C] hover:bg-[#ECC19C]/15"
        }`}
      >
        {children}
      </button>
    );
  };

  useEffect(() => {
    if (canvasRef.current) {
      const s = new DrawRoom(canvasRef.current, roomId, ws, handleZoomChange);
      s.setTool("Arrow");
      setSession(s);
    }

    return () => session?.kill();
  }, []);

  if (!canvasRef) {
    return;
  }

  return (
    <div className="h-screen flex relative bg-[#121212] overflow-hidden">
      {/* <div
        onClick={() => {
          setLogo(false);
        }}
        className={`${logo ? "" : "hidden"} absolute z-50 h-screen flex justify-center items-center w-screen`}
      >
        <Image className="size-56 opacity-75" src={image} alt={"logo"}></Image>
      </div> */}
      <canvas
        className="absolute z-20"
        ref={canvasRef}
        height={window.innerHeight}
        width={window.innerWidth}
      ></canvas>
      <div className="absolute top-4 right-6 z-40 text-[#ECC19C]">
        <Bar
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/draw/${roomId}`
            );
            toast.success("Link Copied");
          }}
          classname="px-4 cursor-pointer"
        >
          <Share />
        </Bar>
      </div>
      <div className="self-end flex justify-between w-full z-40 mb-4 px-6 text-[#ECC19C]">
        <div className="flex gap-3">
          <Bar classname="gap-3 items-center justify-between px-4">
            <Minus
              className="cursor-pointer"
              onClick={() => session?.zoomOut()}
            />
            <div
              className="w-14 text-center text-sm cursor-pointer select-none"
              onClick={() => {
                session?.resetZoom();
                setZoomLevel(100);
              }}
              title="Reset zoom"
            >
              {zoomLevel}%
            </div>
            <Plus
              className="cursor-pointer"
              onClick={() => session?.zoomIn()}
            />
          </Bar>
          <Bar classname="gap-4 px-4 items-center">
            <Undo2
              className="cursor-pointer"
              onClick={() => session?.undo()}
              aria-label="Undo"
            />
            <Redo2
              className="cursor-pointer"
              onClick={() => session?.redo()}
              aria-label="Redo"
            />
          </Bar>
        </div>
        <Bar classname="justify-between px-6 gap-6">
          <div className="flex items-center gap-2 h-full">
            <ToolButton tool="Arrow" label="Select">
              <MousePointer2 className="size-5" />
            </ToolButton>
            <ToolButton tool="Hand" label="Pan">
              <Hand className="size-5" />
            </ToolButton>
            <button
              type="button"
              onClick={toggleLock}
              aria-label={locked ? "Unlock canvas" : "Lock canvas"}
              aria-pressed={locked}
              title={locked ? "Unlock canvas" : "Lock canvas"}
              className={`flex items-center justify-center size-9 rounded-lg transition-colors cursor-pointer ${
                locked
                  ? "bg-[#ECC19C] text-[#1C726D]"
                  : "text-[#ECC19C] hover:bg-[#ECC19C]/15"
              }`}
            >
              {locked ? <Lock className="size-5" /> : <LockOpen className="size-5" />}
            </button>
            <div className="border-l-2 border-[#ECC19C] h-[55%] mx-1"></div>
          </div>
          <div className="flex items-center gap-2">
            <ToolButton tool="Text" label="Text">
              <Type className="size-5" />
            </ToolButton>
            <ToolButton tool="Rectangle" label="Rectangle">
              <Square className="size-5" />
            </ToolButton>
            <ToolButton tool="Line" label="Line">
              <Minus className="size-5 rotate-45" />
            </ToolButton>
            <ToolButton tool="Circle" label="Circle">
              <Circle className="size-5" />
            </ToolButton>
            <ToolButton tool="Pencil" label="Pencil">
              <Pencil className="size-5" />
            </ToolButton>
            <ToolButton tool="Eraser" label="Eraser">
              <Eraser className="size-5" />
            </ToolButton>
          </div>
        </Bar>
        <Bar classname="px-5 gap-4">
          {[
            { a: "#ffffff", b: "bg-white" },
            { a: "#22c55e", b: "bg-green-500" },
            { a: "#3b82f6", b: "bg-blue-500" },
            { a: "#ef4444", b: "bg-red-500" },
          ].map((e, i) => {
            return (
              <div
                onClick={() => {
                  session?.setColor(e.a);
                  toast("Selected", { style: { background: e.a } });
                }}
                key={i}
                className={` cursor-pointer size-10 border-4 ${e.b} border-[#ECC19C] rounded-lg`}
              ></div>
            );
          })}
        </Bar>
      </div>
    </div>
  );
}
