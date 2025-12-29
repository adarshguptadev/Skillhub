import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Protect = ({ children }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/auth-check`, {
                    withCredentials: true,
                });

                if (!response.data.success) {
                    navigate('/home');
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                navigate('/home');
            }
        };

        checkAuth();
    }, [navigate]);

    if (isLoading) return <div className='text-center'>Loading...</div>; // or show spinner

    return <>{children}</>;
};

export default Protect;
