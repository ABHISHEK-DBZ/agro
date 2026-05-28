import { useEffect, useState, useRef } from 'react';

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
  moisture: number;
  temperature: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  updatedAt: Date;
}

export const useSwarmTelemetry = () => {
  const [peers, setPeers] = useState<SwarmPeer[]>([]);
  const [equipment, setEquipment] = useState<TelemetryEquipment[]>([]);
  const [soilStats, setSoilStats] = useState<SoilTelemetry>({
    moisture: 42.5,
    temperature: 28.4,
    ph: 6.5,
    nitrogen: 140, // mg/kg
    phosphorus: 48,
    potassium: 220,
    updatedAt: new Date()
  });
  const [liveMessages, setLiveMessages] = useState<{ id: string; sender: string; content: string; timestamp: Date }[]>([]);

  const channelRef = useRef<BroadcastChannel | null>(null);

  // Initialize Swarm and Equipment
  useEffect(() => {
    // Initialize standard peer network
    const initialPeers: SwarmPeer[] = [
      { id: 'peer-1', name: 'Ramesh Patil', avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Ramesh%20Patil&backgroundColor=22c55e', status: 'In-Field', location: 'Kolhapur, MH', lat: 16.705, lng: 74.243, activity: 'Harvesting Sugarcane', role: 'farmer' },
      { id: 'peer-2', name: 'Dr. Sunita Deshmukh', avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Sunita%20Deshmukh&backgroundColor=0284c7', status: 'Online', location: 'Pune University, MH', lat: 18.520, lng: 73.856, activity: 'Analyzing Pest Reports', role: 'expert' },
      { id: 'peer-3', name: 'Satish Agro Rentals', avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Satish%20Agro&backgroundColor=d97706', status: 'Online', location: 'Sangli, MH', lat: 16.852, lng: 74.581, activity: 'Tractor Fleet Ready', role: 'machinery-hub' },
      { id: 'peer-4', name: 'Aniket More', avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Aniket%20More&backgroundColor=10b981', status: 'In-Field', location: 'Satara, MH', lat: 17.680, lng: 73.991, activity: 'Drone Spraying Active', role: 'farmer' }
    ];

    const initialEquipment: TelemetryEquipment[] = [
      { id: 'eq-1', name: 'John Deere Smart Tractor', type: 'tractor', model: '5050 D Autonomous', status: 'Active', battery: 88, performance: 'Optimal (12 km/h)', coordinates: { lat: 16.706, lng: 74.244 }, rate: 450, owner: 'Satish Agro Rentals' },
      { id: 'eq-2', name: 'Garuda Sprayer Drone v4', type: 'drone', model: 'AG-Q10 Heavy Payload', status: 'Idle', battery: 95, performance: 'Standby', coordinates: { lat: 17.681, lng: 73.992 }, rate: 300, owner: 'Aniket More' },
      { id: 'eq-3', name: 'Soil Monitoring Node', type: 'sensor', model: 'SoilSense Multi-Spectrum v2', status: 'Active', battery: 100, performance: 'Telemetry Transmitting', coordinates: { lat: 16.705, lng: 74.243 }, rate: 50, owner: 'Ramesh Patil' }
    ];

    setPeers(initialPeers);
    setEquipment(initialEquipment);

    // Instantiate BroadcastChannel for premium multi-tab live chat simulation
    const channel = new BroadcastChannel('smart_krishi_swarm_hub');
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === 'CHAT_MESSAGE') {
        setLiveMessages(prev => [
          ...prev,
          { id: Date.now().toString(), sender: data.sender, content: data.content, timestamp: new Date() }
        ]);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  // Continuous background loops driving simulated telemetry streaming data (Module B)
  useEffect(() => {
    const isLowBandwidth = localStorage.getItem('lowBandwidthMode') === 'true';
    // Dynamically adjust interval rate based on network speed preference settings
    const intervalTime = isLowBandwidth ? 8000 : 3000;

    const telemetryInterval = setInterval(() => {
      // 1. Update soil telemetry slightly (temperature, moisture fluctuations)
      setSoilStats(prev => {
        const moistureDelta = (Math.random() - 0.5) * 1.5;
        const tempDelta = (Math.random() - 0.5) * 0.8;
        return {
          ...prev,
          moisture: Math.max(10, Math.min(95, Number((prev.moisture + moistureDelta).toFixed(2)))),
          temperature: Math.max(5, Math.min(50, Number((prev.temperature + tempDelta).toFixed(2)))),
          updatedAt: new Date()
        };
      });

      // 2. Update peer positions and machinery telemetry (Tractor coordinates & battery depletion)
      setEquipment(prevEq => 
        prevEq.map(eq => {
          if (eq.status === 'Active') {
            const latDelta = (Math.random() - 0.5) * 0.0004;
            const lngDelta = (Math.random() - 0.5) * 0.0004;
            const batDepletion = Math.floor(Math.random() * 2);
            return {
              ...eq,
              battery: Math.max(1, eq.battery - batDepletion),
              coordinates: {
                lat: eq.coordinates.lat + latDelta,
                lng: eq.coordinates.lng + lngDelta
              }
            };
          }
          return eq;
        })
      );

      // 3. Broadcast random telemetric update packets (soft pulse notification trigger)
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'TELEMETRY_PACKET',
          data: { timestamp: new Date().getTime() }
        });
      }
    }, intervalTime);

    return () => clearInterval(telemetryInterval);
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
    setLiveMessages(prev => [...prev, messagePayload]);

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
