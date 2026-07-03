// Grievance Service — Local storage based complaint management
import storageService from './storage';

export type GrievanceCategory =
  | 'Crop Disease' | 'Market Price' | 'Government Scheme'
  | 'Weather Information' | 'Irrigation' | 'Pest Control'
  | 'Seed Quality' | 'App Issue' | 'Other';

export type GrievanceStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Reopened';

export interface Grievance {
  id: string;
  userId: string;
  complaintId: string;
  name: string;
  email: string;
  phone: string;
  category: GrievanceCategory;
  description: string;
  location: { village: string; district: string; state: string };
  status: GrievanceStatus;
  adminResponse: string;
  createdAt: number;
  resolvedAt?: number;
}

const STORAGE_KEY = '@krishi_grievances';

class GrievanceService {
  async getGrievances(userId: string): Promise<Grievance[]> {
    const all = await storageService.getItem<Grievance[]>(STORAGE_KEY) || [];
    return all.filter(g => g.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  }

  async submitGrievance(data: {
    userId: string; name: string; email: string; phone: string;
    category: GrievanceCategory; description: string;
    location: { village: string; district: string; state: string };
  }): Promise<string> {
    const all = await storageService.getItem<Grievance[]>(STORAGE_KEY) || [];
    const complaintId = `GRV${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    const grievance: Grievance = {
      id: `grievance_${Date.now()}`,
      userId: data.userId,
      complaintId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      category: data.category,
      description: data.description,
      location: data.location,
      status: 'Pending',
      adminResponse: '',
      createdAt: Date.now(),
    };
    all.unshift(grievance);
    await storageService.setItem(STORAGE_KEY, all);
    return complaintId;
  }

  async updateStatus(grievanceId: string, status: GrievanceStatus, response?: string): Promise<void> {
    const all = await storageService.getItem<Grievance[]>(STORAGE_KEY) || [];
    const g = all.find(x => x.id === grievanceId);
    if (g) {
      g.status = status;
      if (response) g.adminResponse = response;
      if (status === 'Resolved') g.resolvedAt = Date.now();
      await storageService.setItem(STORAGE_KEY, all);
    }
  }
}

export const grievanceService = new GrievanceService();
export default grievanceService;
