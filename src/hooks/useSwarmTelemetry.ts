import { useEffect, useState, useRef } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface SwarmPeer {
  id: string;
  name: string;
  avatar: string;
  status: 'Online' | 'Offline' | 'In-Field';
  location: string;
  lat: number;
  lng: number;
  activity: string;
  role: 'farmer' | 'expert' | 'machinery-hub';
}

export interface TelemetryEquipment {
  id: string;
  name: string;
  type: 'tractor' | 'drone' | 'sensor';
  model: string;
  status: 'Active' | 'Idle' | 'Charging' | 'Deploying';
  battery: number;
  performance: string;
  coordinates: { lat: number; lng: number };
  rate: number; // ₹ per hour
  owner: string;
}

export interface SoilTelemetry {
  moisture: number | null;
  temperature: number | null;
  ph: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  updatedAt: Date | null;
}

export const useSwarmTelemetry = () => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<SwarmPeer[]>([]);
  const [equipment, setEquipment] = useState<TelemetryEquipment[]>([]);
  const [soilStats, setSoilStats] = useState<SoilTelemetry>({
    moisture: null,
    temperature: null,
    ph: null,
    nitrogen: null,
    phosphorus: null,
    potassium: null,
    updatedAt: null
  });
  const [liveMessages, setLiveMessages] = useState<{ id: string; sender: string; content: string; timestamp: Date }[]>([]);

  const channelRef = useRef<BroadcastChannel | null>(null);

  // Real-time Firestore subscription: swarm peers
  useEffect(() => {
    const peersCol = collection(db, 'swarmPeers');
    const unsubPeers = onSnapshot(
      peersCol,
      (snapshot) => {
        const next: SwarmPeer[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Partial<SwarmPeer>;
          next.push({
            id: docSnap.id,
            name: data.name ?? 'Unknown',
            avatar: data.avatar ?? '',
            status: (data.status as SwarmPeer['status']) ?? 'Offline',
            location: data.location ?? '',
            lat: typeof data.lat === 'number' ? data.lat : 0,
            lng: typeof data.lng === 'number' ? data.lng : 0,
            activity: data.activity ?? '',
            role: (data.role as SwarmPeer['role']) ?? 'farmer'
          });
        });
        setPeers(next);
      },
      (err) => {
        console.warn('useSwarmTelemetry: swarmPeers subscription error', err);
        setPeers([]);
      }
    );
    return () => unsubPeers();
  }, []);

  // Real-time Firestore subscription: telemetry equipment
  useEffect(() => {
    const eqCol = collection(db, 'telemetryEquipment');
    const unsubEq = onSnapshot(
      eqCol,
      (snapshot) => {
        const next: TelemetryEquipment[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Partial<TelemetryEquipment>;
          next.push({
            id: docSnap.id,
            name: data.name ?? 'Unknown',
            type: (data.type as TelemetryEquipment['type']) ?? 'sensor',
            model: data.model ?? '',
            status: (data.status as TelemetryEquipment['status']) ?? 'Idle',
            battery: typeof data.battery === 'number' ? data.battery : 0,
            performance: data.performance ?? '',
            coordinates: {
              lat: data.coordinates?.lat ?? 0,
              lng: data.coordinates?.lng ?? 0
            },
            rate: typeof data.rate === 'number' ? data.rate : 0,
            owner: data.owner ?? ''
          });
        });
        setEquipment(next);
      },
      (err) => {
        console.warn('useSwarmTelemetry: telemetryEquipment subscription error', err);
        setEquipment([]);
      }
    );
    return () => unsubEq();
  }, []);

  // Real-time Firestore subscription: latest soil reading from user's fields
  useEffect(() => {
    if (!user?.uid) {
      setSoilStats({
        moisture: null,
        temperature: null,
        ph: null,
        nitrogen: null,
        phosphorus: null,
        potassium: null,
        updatedAt: null
      });
      return;
    }

    let cancelled = false;
    let fieldUnsubs: Array<() => void> = [];

    const setup = async () => {
      // We need to discover the user's field ids before we can listen to each
      // soilReadings subcollection. Read the user doc to obtain the fields list.
      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (cancelled) return;

        const fieldIds: string[] = [];
        if (userSnap.exists()) {
          const data = userSnap.data() as { fields?: Array<{ id?: string } | string> };
          if (Array.isArray(data.fields)) {
            for (const f of data.fields) {
              if (typeof f === 'string') fieldIds.push(f);
              else if (f && typeof f === 'object' && typeof f.id === 'string') fieldIds.push(f.id);
            }
          }
        }

        // For each known field, subscribe to its latest soil reading.
        if (fieldIds.length === 0) {
          setSoilStats({
            moisture: null,
            temperature: null,
            ph: null,
            nitrogen: null,
            phosphorus: null,
            potassium: null,
            updatedAt: null
          });
          return;
        }

        fieldIds.forEach((fieldId) => {
          const readingsCol = collection(db, 'users', user.uid, 'fields', fieldId, 'soilReadings');
          const q = query(readingsCol, orderBy('updatedAt', 'desc'), limit(1));
          const unsub = onSnapshot(
            q,
            (snapshot) => {
              if (snapshot.empty) {
                setSoilStats((prev) => ({
                  ...prev,
                  moisture: null,
                  temperature: null,
                  ph: null,
                  nitrogen: null,
                  phosphorus: null,
                  potassium: null,
                  updatedAt: null
                }));
                return;
              }
              const data = snapshot.docs[0].data() as Partial<SoilTelemetry> & {
                updatedAt?: { toDate?: () => Date } | Date | null;
              };
              const updatedAt =
                data.updatedAt && typeof (data.updatedAt as { toDate?: () => Date }).toDate === 'function'
                  ? (data.updatedAt as { toDate: () => Date }).toDate()
                  : data.updatedAt instanceof Date
                    ? data.updatedAt
                    : null;
              setSoilStats({
                moisture: typeof data.moisture === 'number' ? data.moisture : null,
                temperature: typeof data.temperature === 'number' ? data.temperature : null,
                ph: typeof data.ph === 'number' ? data.ph : null,
                nitrogen: typeof data.nitrogen === 'number' ? data.nitrogen : null,
                phosphorus: typeof data.phosphorus === 'number' ? data.phosphorus : null,
                potassium: typeof data.potassium === 'number' ? data.potassium : null,
                updatedAt
              });
            },
            (err) => {
              console.warn('useSwarmTelemetry: soilReadings subscription error', err);
            }
          );
          fieldUnsubs.push(unsub);
        });
      } catch (err) {
        console.warn('useSwarmTelemetry: failed to load user fields for soilReadings', err);
        if (!cancelled) {
          setSoilStats({
            moisture: null,
            temperature: null,
            ph: null,
            nitrogen: null,
            phosphorus: null,
            potassium: null,
            updatedAt: null
          });
        }
      }
    };

    setup();

    return () => {
      cancelled = true;
      fieldUnsubs.forEach((u) => u());
    };
  }, [user?.uid]);

  // Cross-tab chat channel for premium multi-tab live chat simulation.
  // The math.random() telemetry loop has been removed: we no longer fabricate
  // deltas, position jitter, or battery depletion locally. Real telemetry is
  // expected to land in the Firestore `telemetryEquipment` collection.
  useEffect(() => {
    const channel = new BroadcastChannel('smart_krishi_swarm_hub');
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === 'CHAT_MESSAGE') {
        setLiveMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), sender: data.sender, content: data.content, timestamp: new Date() }
        ]);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  const sendBroadcastMessage = (sender: string, content: string) => {
    if (!content.trim()) return;

    const messagePayload = {
      id: Date.now().toString(),
      sender,
      content,
      timestamp: new Date()
    };

    // Update local state instantly (Optimistic UI)
    setLiveMessages((prev) => [...prev, messagePayload]);

    // Dispatch payload globally over broadcast network
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'CHAT_MESSAGE',
        data: { sender, content }
      });
    }
  };

  return {
    peers,
    equipment,
    soilStats,
    liveMessages,
    sendBroadcastMessage
  };
};
