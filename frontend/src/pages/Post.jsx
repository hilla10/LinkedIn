import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../lib/axios';
import { Loader } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PostComponent from '../components/Post';

const Post = () => {
  const { postId } = useParams();
  const { data: authUser } = useQuery({ queryKey: ['authUser'] });

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => axiosInstance.get(`/posts/${postId}`),
  });

  if (isLoading)
    return (
      <div className='flex items-center justify-center w-100 h-screen '>
        <Loader className='animate-spin w-24' />{' '}
      </div>
    );
  if (!post?.data) return <div>Post not found</div>;

  return (
    <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
      <div className='hidden lg:block lg:col-span-1'>
        <Sidebar user={authUser} />
      </div>

      <div className='col-span-1 lg:col-span-3'>
        <PostComponent post={post.data} />
      </div>
    </div>
  );
};

export default Post;
