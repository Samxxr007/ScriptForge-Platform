const API_URL = '/api';

export async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('scriptforge_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
      const json = await res.json();
      errorMsg = json.error || json.message || errorMsg;
    } catch (e) {
      errorMsg = res.statusText;
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  auth: {
    register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () => request('/auth/me'),
    updateOnboarding: (data: any) => request('/auth/onboarding', { method: 'PATCH', body: JSON.stringify(data) }),
  },

  // Projects
  projects: {
    list: () => request('/projects'),
    get: (id: string) => request(`/projects/${id}`),
    create: (data: any) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/projects/${id}`, { method: 'DELETE' }),
    addMember: (projectId: string, email: string, role: string) =>
      request(`/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify({ email, role }) }),
    updateMemberRole: (projectId: string, memberId: string, role: string) =>
      request(`/projects/${projectId}/members/${memberId}`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    removeMember: (projectId: string, memberId: string) =>
      request(`/projects/${projectId}/members/${memberId}`, { method: 'DELETE' }),
  },

  // Documents
  documents: {
    get: (id: string) => request(`/documents/${id}`),
    updateContent: (id: string, content: string, createCheckpoint = false) =>
      request(`/documents/${id}`, { method: 'PATCH', body: JSON.stringify({ content, createCheckpoint }) }),
    createScene: (docId: string, data: any) => request(`/documents/${docId}/scenes`, { method: 'POST', body: JSON.stringify(data) }),
    updateScene: (sceneId: string, data: any) => request(`/documents/scenes/${sceneId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    reorderScenes: (docId: string, sceneIds: string[]) =>
      request(`/documents/${docId}/scenes/reorder`, { method: 'POST', body: JSON.stringify({ sceneIds }) }),
    deleteScene: (sceneId: string) => request(`/documents/scenes/${sceneId}`, { method: 'DELETE' }),

    // Versions
    listVersions: (docId: string) => request(`/documents/${docId}/versions`),
    createVersion: (docId: string, changeSummary?: string) =>
      request(`/documents/${docId}/versions`, { method: 'POST', body: JSON.stringify({ changeSummary }) }),
    restoreVersion: (versionId: string) => request(`/documents/versions/${versionId}/restore`, { method: 'POST' }),
    compareVersions: (v1Id: string, v2Id: string) => request(`/documents/versions/compare/${v1Id}/${v2Id}`),

    // Branches
    listBranches: (docId: string) => request(`/documents/${docId}/branches`),
    createBranch: (docId: string, name: string, description?: string) =>
      request(`/documents/${docId}/branches`, { method: 'POST', body: JSON.stringify({ name, description }) }),
    saveBranchContent: (branchId: string, content: string) =>
      request(`/documents/branches/${branchId}/save`, { method: 'POST', body: JSON.stringify({ content }) }),
    mergeBranch: (branchId: string, documentId: string) =>
      request(`/documents/branches/${branchId}/merge`, { method: 'POST', body: JSON.stringify({ documentId }) }),
    deleteBranch: (branchId: string) => request(`/documents/branches/${branchId}`, { method: 'DELETE' }),

    // Comments
    listComments: (docId: string) => request(`/documents/${docId}/comments`),
    createComment: (docId: string, data: any) => request(`/documents/${docId}/comments`, { method: 'POST', body: JSON.stringify(data) }),
    resolveComment: (commentId: string) => request(`/documents/comments/${commentId}/resolve`, { method: 'PATCH' }),
    reopenComment: (commentId: string) => request(`/documents/comments/${commentId}/reopen`, { method: 'PATCH' }),
    deleteComment: (commentId: string) => request(`/documents/comments/${commentId}`, { method: 'DELETE' }),

    // Suggestions
    listSuggestions: (docId: string) => request(`/documents/${docId}/suggestions`),
    createSuggestion: (docId: string, data: any) => request(`/documents/${docId}/suggestions`, { method: 'POST', body: JSON.stringify(data) }),
    acceptSuggestion: (suggestionId: string) => request(`/documents/suggestions/${suggestionId}/accept`, { method: 'POST' }),
    rejectSuggestion: (suggestionId: string) => request(`/documents/suggestions/${suggestionId}/reject`, { method: 'POST' }),
  },

  // Characters
  characters: {
    list: (projectId: string) => request(`/characters/project/${projectId}`),
    create: (projectId: string, data: any) => request(`/characters/project/${projectId}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/characters/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/characters/${id}`, { method: 'DELETE' }),
  },

  // Shots & Previs
  shots: {
    list: (sceneId: string) => request(`/shots/scene/${sceneId}`),
    create: (sceneId: string, data: any) => request(`/shots/scene/${sceneId}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/shots/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/shots/${id}`, { method: 'DELETE' }),
    generateFrame: (shotId: string, data: any) => request(`/shots/${shotId}/generate-frame`, { method: 'POST', body: JSON.stringify(data) }),

    // Camera Setups
    getCameraSetups: (sceneId: string) => request(`/shots/camera/scene/${sceneId}`),
    createCameraSetup: (sceneId: string, data: any) => request(`/shots/camera/scene/${sceneId}`, { method: 'POST', body: JSON.stringify(data) }),
    updateCameraSetup: (id: string, data: any) => request(`/shots/camera/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteCameraSetup: (id: string) => request(`/shots/camera/${id}`, { method: 'DELETE' }),

    // Scene Layout
    getSceneLayout: (sceneId: string) => request(`/shots/layout/scene/${sceneId}`),
    updateSceneLayout: (sceneId: string, data: any) => request(`/shots/layout/scene/${sceneId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  // AI Studio
  ai: {
    storyStudio: (data: any) => request('/ai/story-studio', { method: 'POST', body: JSON.stringify(data) }),
    directScene: (data: any) => request('/ai/direct-scene', { method: 'POST', body: JSON.stringify(data) }),
    cinematographer: (data: any) => request('/ai/cinematographer', { method: 'POST', body: JSON.stringify(data) }),
    generateShotList: (data: any) => request('/ai/shot-list', { method: 'POST', body: JSON.stringify(data) }),
    continueWriting: (data: any) => request('/ai/continue', { method: 'POST', body: JSON.stringify(data) }),
    improveDialogue: (data: any) => request('/ai/dialogue', { method: 'POST', body: JSON.stringify(data) }),
    rewrite: (data: any) => request('/ai/rewrite', { method: 'POST', body: JSON.stringify(data) }),
    brainstorm: (data: any) => request('/ai/brainstorm', { method: 'POST', body: JSON.stringify(data) }),
    healthCheck: (data: any) => request('/ai/health-check', { method: 'POST', body: JSON.stringify(data) }),
    continuity: (data: any) => request('/ai/continuity', { method: 'POST', body: JSON.stringify(data) }),
    getHistory: (projectId: string) => request(`/ai/history/${projectId}`),
  },

  // Notifications & Activity
  notifications: {
    list: () => request('/notifications'),
    markRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/read-all', { method: 'POST' }),
    getActivity: (projectId: string) => request(`/notifications/activity/${projectId}`),
  },
};
