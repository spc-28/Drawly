'use client'
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { signIn, signUp } from '../../utils/requests';
import { redirect } from 'next/navigation';
import toast from 'react-hot-toast';

function App() {
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let res = { token: "" };
        if (isLogin) {
            res = await signIn(formData.username, formData.password);
        }
        else {
            res = await signUp(formData.username, formData.password, formData.name);
        }
        if (res.token != "Invalid") {
            localStorage.setItem('token', res.token);
            toast.success("Login Success");
            redirect('/draw');
        }
        else {
            toast.error("Login Failed");
        }
    }


    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
            <div className="w-full max-w-md relative">
                {/* Glow Effects */}
                <div className="absolute -inset-1 bg-[#1C726D] rounded-2xl blur-2xl opacity-75"></div>
                <div className="absolute -inset-2 bg-[#ECC19C] rounded-2xl blur-3xl opacity-20"></div>

                <div className="bg-[#121212] rounded-2xl shadow-xl overflow-hidden relative">
                    {/* Header */}
                    <div className="bg-[#1C726D] px-8 py-6 text-white">
                        <h2 className="text-3xl font-bold text-center">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-[#ECC19C] mt-2 text-center">
                            {isLogin
                                ? 'Please enter your credentials'
                                : 'Sign up for a new account'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="space-y-5">
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-[#1C726D] mb-1">
                                        Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1C726D]/60 h-5 w-5" />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2 border border-[#1C726D]/20 rounded-lg focus:ring-2 focus:ring-[#1C726D] focus:border-transparent bg-[#121212] text-white"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-[#1C726D] mb-1">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1C726D]/60 h-5 w-5" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2 border border-[#1C726D]/20 rounded-lg focus:ring-2 focus:ring-[#1C726D] focus:border-transparent bg-[#121212] text-white"
                                        placeholder="you@example.com"
                                        value={formData.username}
                                        onChange={(e) =>
                                            setFormData({ ...formData, username: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1C726D] mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1C726D]/60 h-5 w-5" />
                                    <input
                                        type="password"
                                        className="w-full pl-10 pr-4 py-2 border border-[#1C726D]/20 rounded-lg focus:ring-2 focus:ring-[#1C726D] focus:border-transparent bg-[#121212] text-white"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className=" mt-4 w-full bg-[#1C726D] text-white py-2 px-4 rounded-lg hover:bg-[#1C726D]/90 transition-colors duration-200 flex items-center justify-center gap-2 group"
                            >
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                            </button>
                        </div>
                    </form>

                    <div className="px-8 pb-6 text-center">
                        <p className="text-sm text-[#1C726D]">
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-1 text-[#ECC19C] hover:text-[#ECC19C]/80 font-medium"
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;