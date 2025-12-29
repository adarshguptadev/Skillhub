import React from 'react'
import { useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";




const ResetPassword = () => {

    const navigate = useNavigate();


    const [toastId, setToastId] = useState(null); // Store toast ID
    const [loading, setloading] = useState(false)
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm()


    const onSubmit = async (data) => {
        setloading(true)

        try {
            const userData = {
                newpassword: data.newpassword,
            };

            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/admin/change-password`,
                userData,
                { withCredentials: true }
            );

            if (response.data.success) {
                reset();
           
                navigate("/admin/login");
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
            setloading(false)
        }
    };

    return (
        <>
            <ToastContainer /> {/* Single ToastContainer (Extra hata diya) */}

            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo */}
                    <div className="text-center">
                        <img
                            className="mx-auto h-16 w-auto sm:h-20"
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1U9JgypRbCtg0hoBbAaZMy6Tf0ZA3X-Gtjw&s"
                            alt="Company Logo"
                        />
                    </div>

                    {/* Login Form Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Skillhub</h2>
                            <p className="mt-2 text-sm text-gray-600">Password Reset</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-4">
                                {/* Email Input */}
                                <div>
                                    <label htmlFor="newpassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter new password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-2 border outline-none border-gray-300 rounded-sm  transition-colors duration-200 text-gray-900 placeholder-gray-500"
                                        placeholder="Enter New password"
                                        {...register("newpassword", { required: { value: true, message: "Password is required" }, minLength: { value: 6, message: "min length 6" } })}
                                    />
                                    <div className='flex items-center justify-end'>
                                        {errors.newpassword && <span className='text-red-600  text-sm '>{errors.newpassword.message}</span>}
                                    </div>
                                </div>

                              
                            </div>

                            {/* Forgot Password Link */}
                         

                            {/* Login Button */}
                            <button
                                type="submit"
                                className={`w-full ${loading ? "bg-blue-800 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"} text-white py-2 px-4 rounded-sm font-medium  transform hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg`}
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "Reset Password"}
                            </button>
                        </form>

                     
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
export default ResetPassword
