import React, { useContext } from "react";
import { AdminDataContext } from "../../context/Admincontext";
import { useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";


import Sidebar from '../../components/admin/AdminSidebar'
import { User, } from "lucide-react"

const EditProfile = () => {

    const navigate = useNavigate();

    const { admin, setAdmin } = useContext(AdminDataContext);
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
            const userData = {
                name: data.name,
                email: data.email,
            };

            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/admin/edit-profile`,
                userData,
                { withCredentials: true }
            );

            if (response.data.success) {
                const responseUserData = response.data.admin;
                setAdmin(responseUserData)
                reset();
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
        <div className='flex h-screen bg-gray-50'>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
                {/* Header */}
                <header className="flex h-16 items-center gap-4 border-b bg-white px-4 lg:px-6">
                    <div className="flex items-center w-full bg-green-500-600 justify-between gap-2 ml-12 lg:ml-0">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">Edit profile</h1>
                        </div>
                        <Link to='/admin' className="bg-blue-700 flex items-center text-white w-8 h-8 rounded-full">
                            <User size={16} className="ml-[9px]" />
                        </Link>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto space-y-8">

                        <ToastContainer /> {/* Single ToastContainer (Extra hata diya) */}

                        <div className=" bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                            <div className="w-full max-w-md space-y-8">
                                {/* Logo */}


                                {/* Login Form Card */}
                                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Skillhub</h2>
                                        <p className="mt-2 text-sm text-gray-600">Edit your account</p>
                                    </div>

                                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                                        <div className="space-y-4">
                                            <div>

                                                <input
                                                    type="text"
                                                    autoComplete="off"
                                                    required
                                                    defaultValue={admin.name}
                                                    className="w-full px-4 py-2 border outline-none border-gray-300 rounded-sm  transition-colors duration-200 text-gray-900 placeholder-gray-500"
                                                    placeholder="Enter your name"
                                                    {...register("name", { required: { value: true, message: "name is required" }, minLength: { value: 3, message: "min length is 3" } })}
                                                />
                                                <div className=' flex items-center justify-end'>
                                                    {errors.name && <span className='text-red-600  text-sm '>{errors.name.message}</span>}
                                                </div>
                                            </div>

                                            {/* Email Input */}
                                            <div>

                                                <input
                                                    type="email"
                                                    autoComplete="email"
                                                    required
                                                    defaultValue={admin.email}
                                                    className="w-full px-4 py-2 border outline-none border-gray-300 rounded-sm  transition-colors duration-200 text-gray-900 placeholder-gray-500"
                                                    placeholder="Enter your email"
                                                    {...register("email", { required: { value: true, message: "email is required" }, minLength: { value: 11, message: "invaled email" } })}
                                                />
                                                <div className='flex items-center justify-end'>
                                                    {errors.email && <span className='text-red-600  text-sm '>{errors.email.message}</span>}
                                                </div>
                                            </div>

                                            {/* usertype Input */}

                                        </div>

                                        {/* Forgot Password Link */}


                                        {/* Login Button */}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`w-full bg-[#0015ff] text-white py-2 px-4 rounded-sm font-medium hover:bg-[#0011cd] ${loading ? "bg-blue-800 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"} transform hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg`}
                                        >
                                            {loading ? "Updating..." : "Update Profile"}
                                        </button>
                                    </form>
                                    <div className="text-center text-sm font-semibold text-blue-700 hover:text-blue-800">
                                        <Link to="/admin" className="text-center">
                                            Back to profile
                                        </Link>
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

                    </div>
                </main>

                {/* content */}

            </div>
        </div>
    )
}

export default EditProfile
