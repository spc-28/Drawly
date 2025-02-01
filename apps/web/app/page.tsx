'use client'
import useRedirect from "../hooks/redirect";

export default function Home() {

  useRedirect(true);

  return (
    <div className="h-screen ">
    </div>
  );
}
