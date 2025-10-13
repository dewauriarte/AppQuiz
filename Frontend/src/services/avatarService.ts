/**
 * Avatar Service
 * Sprint 7: Avatar API calls
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export interface AvatarParts {
  base_skin?: number | null;
  hair?: number | null;
  eyes?: number | null;
  mouth?: number | null;
  clothes?: number | null;
  accessories?: number[];
  background?: number | null;
}

export interface AvatarData {
  user_id: number;
  avatar_url: string | null;
  avatar_parts: AvatarParts | null;
  avatar_frame_url: string | null;
  composed_url?: string | null;
  updated_at?: string;
}

export interface AvatarUpdatePayload {
  avatar_parts: AvatarParts;
  avatar_frame_id?: number | null;
}

export const avatarService = {
  /**
   * Get user avatar
   */
  async getUserAvatar(userId: number, token: string): Promise<AvatarData> {
    const response = await axios.get(`${API_URL}/users/${userId}/avatar`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },

  /**
   * Update user avatar
   */
  async updateAvatar(payload: AvatarUpdatePayload, token: string): Promise<AvatarData> {
    const response = await axios.put(`${API_URL}/users/avatar`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },

  /**
   * Reset avatar to default
   */
  async resetAvatar(token: string): Promise<AvatarData> {
    const response = await axios.delete(`${API_URL}/users/avatar`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },
};

