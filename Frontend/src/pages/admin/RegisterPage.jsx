import React, { useContext } from "react";
import { AdminDataContext } from "../../context/Admincontext";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useForm } from "react-hook-form"
import { useState } from 'react';
import axios from "axios";
const RegisterPage = () => {

    const navigate = useNavigate();

    const { setAdmin } = useContext(AdminDataContext);
    const [loading, setloading] = useState(false)

    const [toastId, setToastId] = useState(null); // Store toast ID

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
            const adminData = {
                name: data.name,
                email: data.email,
                password: data.password,

            };

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/admin/register`,
                adminData,
                { withCredentials: true }
            );

            if (response.data.success) {
                reset();
                const responseAdminData = response.data.admin;
                setAdmin(responseAdminData)
                navigate("/admin");
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
                   
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Skillhub</h2>
                            <p className="mt-2 text-sm text-gray-600">Register to your account</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-4">
                                {/* Email Input */}
                                <div>

                                    <input
                                        type="text"
                                        autoComplete="off"
                                        required
                                        className="w-full px-4 py-2 border outline-none border-gray-300 rounded-sm  transition-colors duration-200 text-gray-900 placeholder-gray-500"
                                        placeholder="Enter your name"
                                        {...register("name", { required: { value: true, message: "name is required" }, minLength: { value: 3, message: "min length is 3" } })}
                                    />
                                    <div className=' flex items-center justify-end'>
                                        {errors.name && <span className='text-red-600  text-sm '>{errors.name.message}</span>}
                                    </div>
                                </div>
                                <div>

                                    <input
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="w-full px-4 py-2 border outline-none border-gray-300 rounded-sm  transition-colors duration-200 text-gray-900 placeholder-gray-500"
                                        placeholder="Enter your email"
                                        {...register("email", { required: { value: true, message: "email is required" }, minLength: { value: 11, message: "invaled email" } })}
                                    />
                                    <div className=' flex items-center justify-end'>
                                        {errors.email && <span className='text-red-600  text-sm '>{errors.email.message}</span>}
                                    </div>
                                </div>


                                {/* Password Input */}
                                <div>

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


                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-[#0015ff] text-white py-2 px-4 rounded-sm font-medium hover:bg-[#0011cd] transform ${loading ? "bg-blue-800 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg`}
                            >
                                {loading ? "Registering..." : "Register"}
                            </button>
                        </form>

                        {/* Sign Up Link */}
                        <div className="text-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                have an account?{" "}
                                <Link to="/admin/login" className="font-medium text-blue-800 hover:text-blue-600 transition-colors duration-200">
                                    Login
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

export default RegisterPage
