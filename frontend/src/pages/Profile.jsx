import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';
import ProfileHeader from '../components/Profile/ProfileHeader';
import AboutSection from '../components/Profile/AboutSection';
import EducationSection from '../components/Profile/EducationSection';
import SkillsSection from '../components/Profile/SkillsSection';
import ExperienceSection from '../components/Profile/ExperienceSection';

const Profile = () => {
  const { username } = useParams();
  const queryClient = useQueryClient();

  const { data: authUser, isLoading } = useQuery({
    queryKey: ['authUser'],
  });

  const { data: userProfile, isLoading: isUserProfileLoading } = useQuery({
    queryKey: ['userProfile', username],
    queryFn: () => axiosInstance.get(`/users/${username}`),
  });

  const { mutate: updateProfile } = useMutation({
    mutationFn: async (updatedData) => {
      await axiosInstance.put('/users/profile', updatedData);
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries(['userProfile', username]);
    },
  });

  if (isLoading || isUserProfileLoading)
    return (
      <div className='h-screen w-screen flex items-center justify-center'>
        <span className='loading loading-infinity loading-xl text-primary w-24' />
      </div>
    );

  const isOwnProfile = authUser.username === userProfile.data.username;
  const userData = isOwnProfile ? authUser : userProfile.data;

  const handleSave = (updatedData) => {
    updateProfile(updatedData);
  };

  return (
    <div className='max-w-4xl mx-auto p-4'>
      <ProfileHeader
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <AboutSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <ExperienceSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <EducationSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <SkillsSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
    </div>
  );
};

export default Profile;
