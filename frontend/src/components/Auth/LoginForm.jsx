import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../../lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const queryClient = useQueryClient();

  const { mutate: loginMutation, isLoading } = useMutation({
    mutationFn: async (userData) => {
      // API call to log in the user
      await axiosInstance.post('/auth/login', userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to log in. Please try again.'
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4 w-full max-w-md'>
      <input
        type='email'
        placeholder='Email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className='input input-bordered w-full'
        required
      />
      <input
        type='password'
        placeholder='Password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className='input input-bordered w-full'
        required
      />

      <button type='submit' className='btn btn-primary w-full'>
        {isLoading ? <Loader className='size-5 animate-spin' /> : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;
