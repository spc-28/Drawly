'use client'
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { signIn, signUp } from '../../utils/requests';
import { redirect } from 'next/navigation';
import toast from 'react-hot-toast';

function App() {
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let res = { token: "" };
        setLoading(true);
        if (isLogin) {
            res = await signIn(formData.username, formData.password);
        }
        else {
            res = await signUp(formData.username, formData.password, formData.name);
        }
        if (res.token != "Invalid") {
            localStorage.setItem('token', res.token);
            toast.success("Login Success");
            setLoading(false);
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
                                {loading ? <div role="status">
                                                <svg aria-hidden="true" className="inline w-5 h-5 text-transparent animate-spin fill-slate-100" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                                </svg>
                                            <span className="sr-only">Loading...</span>
                                            </div> : 
                                            isLogin ? 'Sign In' : 'Create Account'}
                                {loading?"":<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />}
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