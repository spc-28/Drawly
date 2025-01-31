import { useEffect, useRef, useState } from "react";
import Bar from "./bar";
import {
  Circle,
  Eraser,
  Lock,
  Minus,
  MousePointer2,
  Pencil,
  Plus,
  Share,
  Square,
  Type,
} from "lucide-react";
import image from "../public/image.png";
import Image from "next/image";
import DrawRoom from "../draw";
import toast from "react-hot-toast";

export default function Canvas({
  ws,
  roomId,
}: {
  ws: WebSocket;
  roomId: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const virtualRef = useRef<HTMLCanvasElement | null>(null);
  const [session, setSession] = useState<DrawRoom>();
  const [logo, setLogo] = useState<boolean>(true);

  const handleClick = (tool: string) => {
    session?.setTool(tool);
  };

  useEffect(() => {
    if (canvasRef.current && virtualRef.current) {
      const s = new DrawRoom(canvasRef.current, roomId, ws, virtualRef.current);
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
      <canvas
        className="absolute z-10"
        ref={virtualRef}
        height={window.innerHeight}
        width={window.innerWidth}
      ></canvas>
      <div className="self-end flex justify-between w-full z-40 mb-4 px-6 text-[#ECC19C]">
        <Bar
          onClick={() => {
            navigator.clipboard.writeText(
              `http://localhost:3000/draw/${roomId}`
            );
            toast.success("Link Copied");
          }}
          classname="gap-10 justify-between px-4 cursor-pointer "
        >
          {/* <Minus className="cursor-pointer"/>
                < div className="w-[20%] text-xl">100%</div>
                <Plus className="cursor-pointer"/> */}
          <Share />
        </Bar>
        <Bar classname="justify-between px-9 ">
          <div className="flex items-center gap-10 h-full">
            <MousePointer2 className="cursor-pointer" />
            <Lock className="cursor-pointer" />
            <div className="border-l-2 border-[#ECC19C] h-[55%]"></div>
          </div>
          <div className="flex gap-16 ml-10">
            <Type
              onClick={() => {
                handleClick("Text");
                toast.success("Text selected");
              }}
              className="cursor-pointer"
            />
            <Square
              onClick={() => {
                handleClick("Rectangle");
                toast.success("Rectangle selected");
              }}
              className="cursor-pointer"
            />
            <Minus
              onClick={() => {
                handleClick("Line");
                toast.success("Line selected");
              }}
              className="rotate-45 cursor-pointer"
            />
            <Circle
              onClick={() => {
                handleClick("Circle");
                toast.success("Circle selected");
              }}
              className="cursor-pointer"
            />
            <Pencil
              onClick={() => {
                handleClick("Pencil");
                toast.success("Pencil selected");
              }}
              className="cursor-pointer"
            />
            <Eraser
              onClick={() => {
                handleClick("Eraser");
                toast.success("Eraser selected");
              }}
              className="cursor-pointer"
            />
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
