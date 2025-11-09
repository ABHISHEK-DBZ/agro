import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Grievance Status Types
export type GrievanceStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Reopened';

// Grievance Category Types
export type GrievanceCategory = 
  | 'Crop Disease'
  | 'Market Price'
  | 'Government Scheme'
  | 'Weather Information'
  | 'Irrigation'
  | 'Pest Control'
  | 'Seed Quality'
  | 'App Issue'
  | 'Other';

// Grievance Interface
export interface Grievance {
  complaint_id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  category: GrievanceCategory;
  description: string;
  image_url?: string;
  location: {
    village?: string;
    district?: string;
    state?: string;
  };
  status: GrievanceStatus;
  assigned_to?: string;
  admin_response?: string;
  created_at: Date;
  updated_at?: Date;
  resolved_at?: Date;
  reopened_reason?: string;
}

// Comment/Update Interface
export interface GrievanceUpdate {
  id: string;
  complaint_id: string;
  user_id: string;
  user_name: string;
  user_role: 'farmer' | 'admin' | 'expert';
  message: string;
  created_at: Date;
}

class GrievanceService {
  // Generate unique complaint ID
  generateComplaintId(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `G${year}${month}${day}${random}`;
  }

  // Submit new grievance
  async submitGrievance(
    userId: string,
    grievanceData: Omit<Grievance, 'complaint_id' | 'user_id' | 'status' | 'created_at'>
  ): Promise<string> {
    try {
      const complaint_id = this.generateComplaintId();
      const grievanceRef = doc(db, 'grievances', complaint_id);

      const newGrievance: Grievance = {
        complaint_id,
        user_id: userId,
        ...grievanceData,
        status: 'Pending',
        created_at: new Date(),
      };

      await setDoc(grievanceRef, {
        ...newGrievance,
        created_at: Timestamp.fromDate(newGrievance.created_at),
      });

      return complaint_id;
    } catch (error) {
      console.error('Error submitting grievance:', error);
      throw error;
    }
  }

  // Get single grievance by ID
  async getGrievance(complaintId: string): Promise<Grievance | null> {
    try {
      const grievanceRef = doc(db, 'grievances', complaintId);
      const grievanceSnap = await getDoc(grievanceRef);

      if (grievanceSnap.exists()) {
        const data = grievanceSnap.data();
        return {
          ...data,
          created_at: data.created_at?.toDate(),
          updated_at: data.updated_at?.toDate(),
          resolved_at: data.resolved_at?.toDate(),
        } as Grievance;
      }
      return null;
    } catch (error) {
      console.error('Error fetching grievance:', error);
      return null;
    }
  }

  // Get all grievances for a user
  async getUserGrievances(userId: string): Promise<Grievance[]> {
    try {
      const grievancesRef = collection(db, 'grievances');
      const q = query(
        grievancesRef,
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const grievances: Grievance[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        grievances.push({
          ...data,
          created_at: data.created_at?.toDate(),
          updated_at: data.updated_at?.toDate(),
          resolved_at: data.resolved_at?.toDate(),
        } as Grievance);
      });

      return grievances;
    } catch (error) {
      console.error('Error fetching user grievances:', error);
      return [];
    }
  }

  // Get all grievances (Admin view)
  async getAllGrievances(filters?: {
    status?: GrievanceStatus;
    category?: GrievanceCategory;
    state?: string;
  }): Promise<Grievance[]> {
    try {
      const grievancesRef = collection(db, 'grievances');
      let q = query(grievancesRef, orderBy('created_at', 'desc'));

      if (filters?.status) {
        q = query(grievancesRef, where('status', '==', filters.status), orderBy('created_at', 'desc'));
      }

      const querySnapshot = await getDocs(q);
      let grievances: Grievance[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        grievances.push({
          ...data,
          created_at: data.created_at?.toDate(),
          updated_at: data.updated_at?.toDate(),
          resolved_at: data.resolved_at?.toDate(),
        } as Grievance);
      });

      // Apply additional filters
      if (filters?.category) {
        grievances = grievances.filter(g => g.category === filters.category);
      }
      if (filters?.state) {
        grievances = grievances.filter(g => g.location.state === filters.state);
      }

      return grievances;
    } catch (error) {
      console.error('Error fetching all grievances:', error);
      return [];
    }
  }

  // Update grievance status
  async updateGrievanceStatus(
    complaintId: string,
    status: GrievanceStatus,
    adminResponse?: string,
    assignedTo?: string
  ): Promise<void> {
    try {
      const grievanceRef = doc(db, 'grievances', complaintId);
      const updateData: any = {
        status,
        updated_at: Timestamp.now(),
      };

      if (adminResponse) {
        updateData.admin_response = adminResponse;
      }

      if (assignedTo) {
        updateData.assigned_to = assignedTo;
      }

      if (status === 'Resolved') {
        updateData.resolved_at = Timestamp.now();
      }

      await updateDoc(grievanceRef, updateData);
    } catch (error) {
      console.error('Error updating grievance status:', error);
      throw error;
    }
  }

  // Update grievance details (for admin edit)
  async updateGrievance(
    complaintId: string,
    updates: {
      name?: string;
      email?: string;
      phone?: string;
      category?: GrievanceCategory;
      description?: string;
      location?: {
        village?: string;
        district?: string;
        state?: string;
      };
    }
  ): Promise<void> {
    try {
      const grievanceRef = doc(db, 'grievances', complaintId);
      const updateData: any = {
        ...updates,
        updated_at: Timestamp.now(),
      };

      await updateDoc(grievanceRef, updateData);
    } catch (error) {
      console.error('Error updating grievance:', error);
      throw error;
    }
  }

  // Reopen a resolved grievance
  async reopenGrievance(complaintId: string, reason: string): Promise<void> {
    try {
      const grievanceRef = doc(db, 'grievances', complaintId);
      await updateDoc(grievanceRef, {
        status: 'Reopened',
        reopened_reason: reason,
        updated_at: Timestamp.now(),
        resolved_at: null,
      });
    } catch (error) {
      console.error('Error reopening grievance:', error);
      throw error;
    }
  }

  // Add update/comment to grievance
  async addGrievanceUpdate(
    complaintId: string,
    userId: string,
    userName: string,
    userRole: 'farmer' | 'admin' | 'expert',
    message: string
  ): Promise<void> {
    try {
      const updateId = `${complaintId}_${Date.now()}`;
      const updateRef = doc(db, 'grievance_updates', updateId);

      const update: GrievanceUpdate = {
        id: updateId,
        complaint_id: complaintId,
        user_id: userId,
        user_name: userName,
        user_role: userRole,
        message,
        created_at: new Date(),
      };

      await setDoc(updateRef, {
        ...update,
        created_at: Timestamp.fromDate(update.created_at),
      });
    } catch (error) {
      console.error('Error adding grievance update:', error);
      throw error;
    }
  }

  // Get updates for a grievance
  async getGrievanceUpdates(complaintId: string): Promise<GrievanceUpdate[]> {
    try {
      const updatesRef = collection(db, 'grievance_updates');
      const q = query(
        updatesRef,
        where('complaint_id', '==', complaintId),
        orderBy('created_at', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const updates: GrievanceUpdate[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        updates.push({
          ...data,
          created_at: data.created_at?.toDate(),
        } as GrievanceUpdate);
      });

      return updates;
    } catch (error) {
      console.error('Error fetching grievance updates:', error);
      return [];
    }
  }

  // Subscribe to real-time grievance updates
  subscribeToGrievance(complaintId: string, callback: (grievance: Grievance) => void): () => void {
    const grievanceRef = doc(db, 'grievances', complaintId);
    
    const unsubscribe = onSnapshot(grievanceRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          ...data,
          created_at: data.created_at?.toDate(),
          updated_at: data.updated_at?.toDate(),
          resolved_at: data.resolved_at?.toDate(),
        } as Grievance);
      }
    });

    return unsubscribe;
  }

  // Subscribe to user's grievances
  subscribeToUserGrievances(userId: string, callback: (grievances: Grievance[]) => void): () => void {
    const grievancesRef = collection(db, 'grievances');
    const q = query(
      grievancesRef,
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const grievances: Grievance[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          grievances.push({
            ...data,
            created_at: data.created_at?.toDate(),
            updated_at: data.updated_at?.toDate(),
            resolved_at: data.resolved_at?.toDate(),
          } as Grievance);
        });
        callback(grievances);
      },
      (error) => {
        console.error('Error in grievances subscription:', error);
        // Return empty array on error
        callback([]);
      }
    );

    return unsubscribe;
  }

  // Delete grievance (soft delete or hard delete)
  async deleteGrievance(complaintId: string): Promise<void> {
    try {
      const grievanceRef = doc(db, 'grievances', complaintId);
      await deleteDoc(grievanceRef);
    } catch (error) {
      console.error('Error deleting grievance:', error);
      throw error;
    }
  }

  // Get grievance statistics (for admin dashboard)
  async getGrievanceStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    reopened: number;
    byCategory: Record<GrievanceCategory, number>;
    byState: Record<string, number>;
  }> {
    try {
      const grievances = await this.getAllGrievances();

      const stats = {
        total: grievances.length,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        reopened: 0,
        byCategory: {} as Record<GrievanceCategory, number>,
        byState: {} as Record<string, number>,
      };

      grievances.forEach((g) => {
        // Status counts
        if (g.status === 'Pending') stats.pending++;
        if (g.status === 'In Progress') stats.inProgress++;
        if (g.status === 'Resolved') stats.resolved++;
        if (g.status === 'Reopened') stats.reopened++;

        // Category counts
        stats.byCategory[g.category] = (stats.byCategory[g.category] || 0) + 1;

        // State counts
        if (g.location.state) {
          stats.byState[g.location.state] = (stats.byState[g.location.state] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching grievance stats:', error);
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        reopened: 0,
        byCategory: {} as Record<GrievanceCategory, number>,
        byState: {} as Record<string, number>,
      };
    }
  }
}

const grievanceService = new GrievanceService();
export default grievanceService;
