// boardPage.store.js

import { create } from 'zustand'
import { 
  getBoardDetails, 
  getBoardMembers, 
  getPendingMembers,
  approveMemberRequest,
  rejectMemberRequest,
  removeBoardMember,
  transferAdminRights,
  leaveBoardRequest,
  deleteBoardRequest
} from './boardPage.api'

const useBoardPageStore = create((set, get) => ({
  boardDetails: null,
  members: [],
  pendingMembers: [],
  loading: false,
  error: null,

  fetchBoardData: async (boardId) => {
    set({ loading: true, error: null })
    
    try {
      // 1. Fetch board details first
      const boardResponse = await getBoardDetails(boardId)
      const boardData = boardResponse.data
      
      // 2. Fetch members
      const membersResponse = await getBoardMembers(boardId)
      const membersData = membersResponse.data.members || []
      
      // 3. Only fetch pending members if user is admin
      let pendingMembersData = []
      if (boardData.isAdmin) {
        try {
          const pendingResponse = await getPendingMembers(boardId)
          pendingMembersData = pendingResponse.data.pendingMembers || []
        } catch (error) {
          // If 403, user is not admin - that's OK, just skip pending members
          if (error.response?.status !== 403) {
            console.error('Error fetching pending members:', error)
          }
        }
      }
      
      set({
        boardDetails: boardData,
        members: membersData,
        pendingMembers: pendingMembersData,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error fetching board data:', error)
      set({
        loading: false,
        error: error.response?.data?.msg || 'Failed to load board'
      })
    }
  },

  approveMember: async (boardId, userId) => {
    try {
      await approveMemberRequest(boardId, userId)
      
      // Refresh board data
      await get().fetchBoardData(boardId)
    } catch (error) {
      console.error('Error approving member:', error)
      throw error
    }
  },

  rejectMember: async (boardId, userId) => {
    try {
      await rejectMemberRequest(boardId, userId)
      
      // Refresh board data
      await get().fetchBoardData(boardId)
    } catch (error) {
      console.error('Error rejecting member:', error)
      throw error
    }
  },

  removeMember: async (boardId, userId) => {
    try {
      await removeBoardMember(boardId, userId)
      
      // Refresh members list
      const membersResponse = await getBoardMembers(boardId)
      set({ members: membersResponse.data.members || [] })
    } catch (error) {
      console.error('Error removing member:', error)
      throw error
    }
  },

  makeBoardAdmin: async (boardId, userId) => {
    try {
      await transferAdminRights(boardId, userId)
      
      // Refresh board data to reflect admin change
      await get().fetchBoardData(boardId)
    } catch (error) {
      console.error('Error making admin:', error)
      throw error
    }
  },

  leaveBoard: async (boardId) => {
    try {
      await leaveBoardRequest(boardId)
    } catch (error) {
      console.error('Error leaving board:', error)
      throw error
    }
  },

  deleteBoard: async (boardId) => {
    try {
      await deleteBoardRequest(boardId)
    } catch (error) {
      console.error('Error deleting board:', error)
      throw error
    }
  },

  resetBoardState: () => {
    set({
      boardDetails: null,
      members: [],
      pendingMembers: [],
      loading: false,
      error: null
    })
  }
}))

export { useBoardPageStore }