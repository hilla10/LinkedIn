import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../lib/axios';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';

const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { mutate: signUPMutation, isLoading } = useMutation({
    mutationFn: async (data) => {
      // API call to register the user
      const res = await axiosInstance.post('/auth/signup', data);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Registered successfully! ');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to register. Please try again.'
      );
    },
  });

  const handleSignUp = async (e) => {
    e.preventDefault();
    signUPMutation({ name, username, email, password });
  };

  return (
    <form onSubmit={handleSignUp} className='flex flex-col gap-4'>
      <input
        type='text'
        placeholder='Full name'
        value={name}
        onChange={(e) => setName(e.target.value)}
        className='input input-bordered w-full'
        required
      />
      <input
        type='text'
        placeholder='Username'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className='input input-bordered w-full'
        required
      />
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
        placeholder='Password (6+ characters)'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className='input input-bordered w-full'
        required
      />

      <button
        type='submit'
        disabled={isLoading}
        className='btn btn-primary w-full text-white'>
        {isLoading ? (
          <Loader className='size-5 animate-spin' />
        ) : (
          'Agree & Join'
        )}
      </button>
    </form>
  );
};

export default SignupForm;
