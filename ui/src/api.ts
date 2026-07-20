import { USER_ROLES } from './constants';
import type { Project, Feature, Subfeature, Ticket } from './types';

// Generic fetch wrapper to handle errors
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `API request failed with status ${res.status}`);
  }
  return res.json();
}

// -- Projects --

export async function getProjects(): Promise<Project[]> {
  return apiFetch<Project[]>('/api/projects');
}

export async function getProject(id: string): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${id}`);
}

export async function createProject(id: string, title: string, summary: string): Promise<Project> {
  return apiFetch<Project>('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title, summary, documentation: '', role: USER_ROLES.MANAGER }),
  });
}

export async function updateProject(id: string, title: string, summary: string): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, summary, role: USER_ROLES.MANAGER }),
  });
}

export async function updateProjectDocs(id: string, documentation: string): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${id}/docs`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentation, role: USER_ROLES.MANAGER }),
  });
}

// -- Features --

export async function getFeatures(projectId?: string): Promise<Feature[]> {
  const url = projectId ? `/api/features?project_id=${projectId}` : '/api/features';
  return apiFetch<Feature[]>(url);
}

export async function updateFeature(id: string, title: string, summary: string): Promise<Feature> {
  return apiFetch<Feature>(`/api/features/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, summary, role: USER_ROLES.MANAGER }),
  });
}

export async function deleteFeature(id: string): Promise<void> {
  return apiFetch<void>(`/api/features/${id}?role=${USER_ROLES.MANAGER}`, { method: 'DELETE' });
}

// -- Subfeatures --

export async function getSubfeatures(): Promise<Subfeature[]> {
  return apiFetch<Subfeature[]>('/api/subfeatures');
}

export async function getSubfeature(id: string): Promise<Subfeature> {
  return apiFetch<Subfeature>(`/api/subfeatures/${id}`);
}

export async function updateSubfeature(id: string, title: string, summary: string): Promise<Subfeature> {
  return apiFetch<Subfeature>(`/api/subfeatures/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, summary, role: USER_ROLES.MANAGER }),
  });
}

export async function deleteSubfeature(id: string): Promise<void> {
  return apiFetch<void>(`/api/subfeatures/${id}?role=${USER_ROLES.MANAGER}`, { method: 'DELETE' });
}

// -- Tickets --

export async function getTickets(parentId?: string): Promise<Ticket[]> {
  const url = parentId ? `/api/tickets?parent_id=${parentId}` : `/api/tickets`;
  return apiFetch<Ticket[]>(url);
}

export async function updateTicket(ticketId: string, data: Partial<Ticket>): Promise<Ticket> {
  return apiFetch<Ticket>(`/api/tickets/${ticketId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: data.title,
      type: data.type,
      priority: data.priority,
      summary: data.summary,
      context: data.context,
      role: USER_ROLES.MANAGER,
    }),
  });
}

export async function updateTicketStatus(ticketId: string, status: string): Promise<Ticket> {
  return apiFetch<Ticket>(`/api/tickets/${ticketId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, role: USER_ROLES.MANAGER }),
  });
}

export async function checkTicketTask(ticketId: string, taskIndex: number): Promise<Ticket> {
  return apiFetch<Ticket>(`/api/tickets/${ticketId}/tasks/check`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_index: taskIndex, role: USER_ROLES.DEVELOPER }),
  });
}

export async function addTicketNote(ticketId: string, content: string): Promise<Ticket> {
  return apiFetch<Ticket>(`/api/tickets/${ticketId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, role: USER_ROLES.MANAGER }),
  });
}

export async function deleteTicket(ticketId: string): Promise<void> {
  return apiFetch<void>(`/api/tickets/${ticketId}?role=${USER_ROLES.MANAGER}`, { method: 'DELETE' });
}
