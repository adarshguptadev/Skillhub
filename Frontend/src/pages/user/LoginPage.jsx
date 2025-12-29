import React, { useContext } from "react";
import { UserDataContext } from "../../context/Usercontext";

import { useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";




const LoginPage = () => {

    const navigate = useNavigate();

    const { setUser } = useContext(UserDataContext);
    const [loading, setLoading] = useState(false);

    const [toastId, setToastId] = useState(null); // Store toast ID
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm()


    const onSubmit = async (data) => {
        setLoading(true);

        try {
            const userData = {
                email: data.email,
                password: data.password,
            };

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/user/login`,
                userData,
                { withCredentials: true }
            );

            if (response.data.success) {
                const responseUserData = response.data.user;
                setUser(responseUserData)
                reset();
                navigate("/");
            }
        } catch (error) {
            if (toastId) {
                toast.dismiss(toastId);
            }

            const newToastId = toast.error(error.response.data.message, {
                position: "top-center",
                autoClose: 5000,
                theme: "dark",
            });
            setToastId(newToastId);
        } finally {
            setLoading(false);
        }

    };

    return (
        <>
            <ToastContainer /> {/* Single ToastContainer (Extra hata diya) */}

            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">

                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Skillhub</h2>
                            <p className="mt-2 text-sm text-gray-600">Login to your account</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-4">
                                {/* Email Input */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="w-full px-4 py-2 border outline-none border-gray-300 rounded-sm  transition-colors duration-200 text-gray-900 placeholder-gray-500"
                                        placeholder="Enter your email"
                                        {...register("email", { required: { value: true, message: "email is required" }, minLength: { value: 11, message: "invaled email" } })}
                                    />
                                    <div className='flex items-center justify-end'>
                                        {errors.email && <span className='text-red-600  text-sm '>{errors.email.message}</span>}
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <input


                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-sm outline-none transition-colors duration-200 text-gray-900 placeholder-gray-500"
                                        placeholder="Enter your password"
                                        {...register("password", { required: { value: true, message: "password is required" }, minLength: { value: 6, message: "min length is 6" } })}
                                    />
                                    <div className=' flex items-center justify-end'>
                                        {errors.password && <span className='text-red-600  text-sm '>{errors.password.message}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Forgot Password Link */}
                            <div className="text-right">
                                <Link to="/forgotpassword" className="text-sm text-blue-800 hover:text-blue-600 transition-colors duration-200">
                                    Forgot your password?
                                </Link>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full text-white py-2 px-4 rounded-sm font-medium transform hover:scale-[1.02]  ${loading ? "bg-blue-800 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} transition-all duration-200 shadow-md hover:shadow-lg`}
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </form>

                        {/* Sign Up Link */}
                        <div className="text-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{" "}
                                <Link to="/register" className="font-medium text-blue-800 hover:text-blue-600 transition-colors duration-200">
                                    Register
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Additional Footer Text */}
                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>
            </div>
        </>
    );

}
export default LoginPage
