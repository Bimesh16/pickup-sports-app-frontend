import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProfile, updateProfile, fetchUsers } from '../api';
import type { SkillLevel } from '@/src/types/api';

export function useProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profileData: {
      firstName?: string;
      lastName?: string;
      skillLevel?: SkillLevel;
    }) => updateProfile(profileData),
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'profile'], data);
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}