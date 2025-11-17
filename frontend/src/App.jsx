import Layout from './components/Layout/Layout';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Auth/Signup';
import Login from './pages/Auth/Login';
import toast, { Toaster } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from './lib/axios';
import Notification from './pages/Notification';
import Network from './pages/Network';

const App = () => {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        return res.data;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          return null; // Not logged in
        }
        toast.error(
          error?.response?.data?.message ||
            'Failed to fetch user data. Please try again.'
        );
        throw error; // Other errors
      }
    },
  });

  if (isLoading) {
    return (
      <div className='h-screen w-screen flex items-center justify-center'>
        <span className='loading loading-infinity loading-xl text-primary w-24' />
      </div>
    );
  }

  return (
    <Layout>
      <Toaster />
      <Routes>
        <Route
          path='/'
          element={authUser ? <Home /> : <Navigate to='/login' />}
        />
        <Route
          path='/signup'
          element={!authUser ? <Signup /> : <Navigate to='/' />}
        />
        <Route
          path='/login'
          element={!authUser ? <Login /> : <Navigate to='/' />}
        />
        <Route
          path='/notifications'
          element={authUser ? <Notification /> : <Navigate to='/login' />}
        />
        <Route
          path='/network'
          element={authUser ? <Network /> : <Navigate to='/login' />}
        />
      </Routes>
    </Layout>
  );
};

export default App;
