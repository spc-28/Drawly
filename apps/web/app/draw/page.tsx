'use client'
import React, { useState } from 'react';
import { Users, ArrowRight, Plus, LogIn } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createRoom } from '../../utils/requests';
import toast from 'react-hot-toast';
import useRedirect from '../../hooks/redirect';

export default function Room() {
  const [roomId, setRoomId] = useState('');

  useRedirect(false);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Joining room: ${roomId}`);
    redirect(`/draw/${roomId}`)
  };

  const handleCreateRoom = async () => {
    const { room } = await createRoom();
    if(room) {
      toast.success("Room Created");
      redirect(`/draw/${room.id}`)
    }
    else{
      toast.error("Room not Created");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md relative">
        <div className="absolute -inset-1 bg-[#1C726D] rounded-2xl blur-2xl opacity-75"></div>
        <div className="absolute -inset-2 bg-[#ECC19C] rounded-2xl blur-3xl opacity-20"></div>
        
        <div className="bg-[#121212] rounded-2xl shadow-xl overflow-hidden relative">
          <div className="bg-[#1C726D] px-8 py-6 text-white">
            <h2 className="text-3xl font-bold text-center">Join a Room</h2>
            <p className="text-[#ECC19C] mt-2 text-center">
              Create or join an existing room
            </p>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <button
                onClick={handleCreateRoom}
                className="w-full bg-[#1C726D] text-white py-3 px-4 rounded-lg hover:bg-[#1C726D]/90 transition-colors duration-200 flex items-center justify-center gap-2 group"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">New Room</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200 ml-1" />
              </button>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1C726D]/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#121212] text-[#ECC19C]">or</span>
              </div>
            </div>

            <form onSubmit={handleJoinRoom}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#1C726D] mb-1">
                    Room ID
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1C726D]/60 h-5 w-5" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 border border-[#1C726D]/20 rounded-lg focus:ring-2 focus:ring-[#1C726D] focus:border-transparent bg-[#121212] text-white"
                      placeholder="Enter room ID"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#ECC19C] text-[#121212] py-2 px-4 rounded-lg hover:bg-[#ECC19C]/90 transition-colors duration-200 flex items-center justify-center gap-2 group font-medium"
                >
                  <LogIn className="h-5 w-5" />
                  Join Room
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

