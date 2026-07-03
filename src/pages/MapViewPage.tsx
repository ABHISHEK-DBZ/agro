import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin, Users, MessageCircle, AlertTriangle,
  X, Search, Layers, ZoomIn, ZoomOut, Locate,
  ChevronRight
} from 'lucide-react';
import { collection, query, where, getDocs, limit, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Kpi, Button, PageHeader, EmptyState } from '../components/ui';
import communityService from '../services/communityService';
import type { FarmerGroup, Location, PestAlert } from '../services/communityService';

type MapItemType = 'farmer' | 'post' | 'group' | 'alert';

interface MapItem {
  id: string;
  type: MapItemType;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  meta?: Record<string, string | number>;
  distanceKm?: number;
}

interface FarmerDoc {
  uid: string;
  displayName?: string;
  name?: string;
  photoURL?: string;
  shareLocation?: boolean;
  location?: {
    coordinates?: { latitude?: number; longitude?: number };
    village?: string;
    district?: string;
    state?: string;
  };
  village?: string;
  district?: string;
  state?: string;
  lastActiveAt?: Timestamp | Date | null;
  crops?: string[];
}

interface PostDoc {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  urgency?: 'low' | 'medium' | 'high';
  location?: Location;
  replies?: number;
  isAlert?: boolean;
}

// India bounding box: lat 8-37, lng 68-97. Project lat/lng to a percentage within the viewBox.
const INDIA_BBOX = { minLat: 8, maxLat: 37, minLng: 68, maxLng: 97 };

const projectToViewBox = (lat: number, lng: number) => {
  const x = ((lng - INDIA_BBOX.minLng) / (INDIA_BBOX.maxLng - INDIA_BBOX.minLng)) * 100;
  // invert Y so north is up
  const y = (1 - (lat - INDIA_BBOX.minLat) / (INDIA_BBOX.maxLat - INDIA_BBOX.minLat)) * 100;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
};

const TYPE_META: Record<MapItemType, { label: string; color: string; bgClass: string; borderClass: string; textClass: string; Icon: any }> = {
  farmer: { label: 'Farmers', color: '#16a34a', bgClass: 'bg-leaf-50', borderClass: 'border-leaf-500', textClass: 'text-leaf-700', Icon: Users },
  post:   { label: 'Posts',   color: '#2563eb', bgClass: 'bg-sky-50',  borderClass: 'border-sky-500',  textClass: 'text-sky-700',  Icon: MessageCircle },
  group:  { label: 'Groups',  color: '#9333ea', bgClass: 'bg-[#f3e8ff]', borderClass: 'border-[#9333ea]', textClass: 'text-[#7e22ce]', Icon: Users },
  alert:  { label: 'Alerts',  color: '#dc2626', bgClass: 'bg-[#fef2f2]', borderClass: 'border-danger-500', textClass: 'text-danger-600', Icon: AlertTriangle },
};

const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const extractLatLng = (loc: any): { lat: number; lng: number } | null => {
  if (!loc) return null;
  if (typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
    return { lat: loc.latitude, lng: loc.longitude };
  }
  if (Array.isArray(loc.coordinates) && loc.coordinates.length === 2) {
    const [lat, lng] = loc.coordinates;
    if (typeof lat === 'number' && typeof lng === 'number') return { lat, lng };
  }
  return null;
};

const formatOnline = (lastActiveAt?: Timestamp | Date | null): string => {
  if (!lastActiveAt) return '—';
  const date = lastActiveAt instanceof Timestamp ? lastActiveAt.toDate() : lastActiveAt;
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return 'Online';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}h ago`;
  return `${Math.floor(diffMin / (60 * 24))}d ago`;
};

const MapViewPage: React.FC = () => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const [filterType, setFilterType] = useState<'all' | MapItemType>('all');
  const [selected, setSelected] = useState<MapItem | null>(null);
  const [search, setSearch] = useState('');
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({ lat: 22.5, lng: 80 });
  const [radiusKm, setRadiusKm] = useState<number | 'all'>(50);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [items, setItems] = useState<MapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const mapRef = useRef<SVGSVGElement>(null);

  // Wire my location
  useEffect(() => {
    // AuthContext location has { state, district, village } - not coordinates
    // For map, we use browser geolocation or fall back to defaults
    if (userProfile?.location) {
      // If location has coordinates (from some user profiles), use them
      const loc = userProfile.location as any;
      if (loc.coordinates && typeof loc.coordinates.latitude === 'number' && typeof loc.coordinates.longitude === 'number') {
        setMyLocation({ lat: loc.coordinates.latitude, lng: loc.coordinates.longitude });
      }
    }
  }, [userProfile]);

  // Load all map data from Firestore once on mount.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    (async () => {
      const collected: MapItem[] = [];

      // 1. Farmers (users) where shareLocation === true
      try {
        const farmersQ = query(
          collection(db, 'users'),
          where('shareLocation', '==', true),
          limit(50)
        );
        const farmersSnap = await getDocs(farmersQ);
        farmersSnap.forEach((docSnap) => {
          const f = docSnap.data() as FarmerDoc;
          const coords = extractLatLng(f.location?.coordinates);
          if (!coords) return;
          const name = f.displayName || f.name || 'Farmer';
          const village = f.village || f.location?.village || f.district || f.location?.district || '';
          const state = f.state || f.location?.state || '';
          const subtitle = [f.crops?.join(', '), village].filter(Boolean).join(' · ') || 'Farmer';
          collected.push({
            id: `farmer-${docSnap.id}`,
            type: 'farmer',
            lat: coords.lat,
            lng: coords.lng,
            title: name,
            subtitle,
            meta: { village: village || state || '—', online: formatOnline(f.lastActiveAt) }
          });
        });
      } catch (err) {
        console.warn('MapViewPage: failed to load farmers', err);
      }

      // 2. Community posts that have a location
      try {
        const postsQ = query(
          collection(db, 'communityPosts'),
          where('location', '!=', null),
          limit(30)
        );
        const postsSnap = await getDocs(postsQ);
        postsSnap.forEach((docSnap) => {
          const p = docSnap.data() as PostDoc;
          const coords = extractLatLng(p.location);
          if (!coords) return;
          collected.push({
            id: `post-${docSnap.id}`,
            type: 'post',
            lat: coords.lat,
            lng: coords.lng,
            title: p.title || p.description?.slice(0, 60) || 'Community post',
            subtitle: p.category || 'Discussion',
            meta: {
              replies: typeof p.replies === 'number' ? p.replies : 0,
              urgency: p.urgency ? p.urgency : 'Normal'
            }
          });
        });
      } catch (err) {
        console.warn('MapViewPage: failed to load community posts', err);
      }

      // 3. Groups (from communityService)
      try {
        const groups: FarmerGroup[] = await communityService.getGroups();
        for (const g of groups) {
          const coords = extractLatLng(g.location);
          if (!coords) continue;
          collected.push({
            id: `group-${g.id}`,
            type: 'group',
            lat: coords.lat,
            lng: coords.lng,
            title: g.name,
            subtitle: `Group · ${Array.isArray(g.members) ? g.members.length : 0} members`
          });
        }
      } catch (err) {
        console.warn('MapViewPage: failed to load groups', err);
      }

      // 4. Active pest alerts (from communityService)
      try {
        const alerts: PestAlert[] = await communityService.getActiveAlerts();
        for (const a of alerts) {
          const coords = extractLatLng(a.location);
          if (!coords) continue;
          collected.push({
            id: `alert-${a.id}`,
            type: 'alert',
            lat: coords.lat,
            lng: coords.lng,
            title: a.pestName || 'Pest alert',
            subtitle: a.cropAffected || 'Pest Alert',
            meta: {
              severity: a.severity,
              issued: a.timestamp
                ? (a.timestamp instanceof Date
                    ? a.timestamp.toLocaleDateString()
                    : new Date(a.timestamp as any).toLocaleDateString())
                : '—'
            }
          });
        }
      } catch (err) {
        console.warn('MapViewPage: failed to load alerts', err);
      }

      if (!cancelled) {
        setItems(collected);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter and project data
  const filtered = useMemo(() => {
    let arr = items;
    if (filterType !== 'all') arr = arr.filter((i) => i.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.subtitle ?? '').toLowerCase().includes(q),
      );
    }
    if (myLocation && radiusKm !== 'all') {
      arr = arr
        .map((i) => ({ ...i, distanceKm: haversineKm(myLocation.lat, myLocation.lng, i.lat, i.lng) }))
        .filter((i) => (i.distanceKm ?? 0) <= radiusKm);
    }
    return arr;
  }, [items, filterType, search, myLocation, radiusKm]);

  // Stats by type
  const stats = useMemo(() => {
    const inRadius = (type: MapItemType) => items.filter((i) => i.type === type).length;
    return {
      farmers: inRadius('farmer'),
      posts: inRadius('post'),
      groups: inRadius('group'),
      alerts: inRadius('alert'),
    };
  }, [items]);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setGeoError(t('weather.noGeolocation') || 'Geolocation is not supported by your browser');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyLocation(c);
        setCenter(c);
        setZoom(2.5);
        setGeoLoading(false);
      },
      (err) => {
        setGeoError(t('weather.locationError') || 'Location access denied');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const viewBoxWidth = 100 / zoom;
  const viewBoxHeight = 100 / zoom;
  const viewBoxX = ((center.lng - INDIA_BBOX.minLng) / (INDIA_BBOX.maxLng - INDIA_BBOX.minLng)) * 100 - viewBoxWidth / 2;
  const viewBoxY = (1 - (center.lat - INDIA_BBOX.minLat) / (INDIA_BBOX.maxLat - INDIA_BBOX.minLat)) * 100 - viewBoxHeight / 2;
  const viewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;

  const filterTypes: Array<{ id: 'all' | MapItemType; label: string; color: string; Icon: any }> = [
    { id: 'all', label: 'All', color: '#39542f', Icon: Layers },
    { id: 'farmer', label: TYPE_META.farmer.label, color: TYPE_META.farmer.color, Icon: TYPE_META.farmer.Icon },
    { id: 'post', label: TYPE_META.post.label, color: TYPE_META.post.color, Icon: TYPE_META.post.Icon },
    { id: 'group', label: TYPE_META.group.label, color: TYPE_META.group.color, Icon: TYPE_META.group.Icon },
    { id: 'alert', label: TYPE_META.alert.label, color: TYPE_META.alert.color, Icon: TYPE_META.alert.Icon },
  ];

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-subtle sticky top-14 md:top-16 z-30">
        <div className="container-app py-3">
          <PageHeader
            eyebrow="Community"
            title={t('map.title', 'Map View')}
            description={t('map.subtitle', 'Discover farmers, posts, groups, and alerts near you')}
            actions={
              <Button
                variant="primary"
                size="sm"
                onClick={handleLocate}
                loading={geoLoading}
                leftIcon={<Locate className="w-4 h-4" />}
              >
                {t('weather.useCurrentLocation', 'My Location')}
              </Button>
            }
          />
        </div>

        {/* Filters bar */}
        <div className="container-app pb-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[14rem]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('map.searchPlaceholder', 'Search farmers, posts, groups...')}
              className="input pl-8 w-full"
            />
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-sunken rounded-md">
            {filterTypes.map((ft) => {
              const active = filterType === ft.id;
              return (
                <button
                  key={ft.id}
                  type="button"
                  onClick={() => setFilterType(ft.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                    active ? 'bg-surface text-strong shadow-sm' : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  <ft.Icon className="w-3.5 h-3.5" style={{ color: active ? ft.color : undefined }} />
                  <span>{ft.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-ink-600">Radius:</span>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="input py-1.5 text-sm"
            >
              <option value="all">All India</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
              <option value={500}>500 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container-app py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="Farmers" value={stats.farmers} icon={<Users className="w-4 h-4" />} />
          <Kpi label="Posts" value={stats.posts} icon={<MessageCircle className="w-4 h-4" />} />
          <Kpi label="Groups" value={stats.groups} icon={<Users className="w-4 h-4" />} />
          <Kpi label="Alerts" value={stats.alerts} icon={<AlertTriangle className="w-4 h-4" />} />
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="flex-1 container-app pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="relative bg-gradient-to-br from-[#e8f0e3] to-[#d8e5f0] dark:from-slate-800 dark:to-slate-900 aspect-[5/4] sm:aspect-[16/10]">
              <svg
                ref={mapRef}
                viewBox={viewBox}
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full"
                onClick={() => setSelected(null)}
              >
                {/* India outline (simplified) */}
                <path
                  d="M 50 5 L 60 10 L 70 15 L 78 18 L 85 22 L 88 30 L 86 38 L 82 45 L 80 55 L 78 65 L 75 75 L 70 85 L 60 92 L 50 95 L 42 92 L 38 85 L 32 78 L 25 70 L 20 60 L 18 50 L 15 40 L 12 30 L 18 22 L 25 15 L 35 8 L 45 5 Z"
                  fill="#cfe2d3"
                  stroke="#39542f"
                  strokeWidth="0.4"
                  opacity="0.7"
                />
                {/* State grid lines for context */}
                {[20, 40, 60, 80].map((y) => (
                  <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#39542f" strokeWidth="0.05" opacity="0.3" />
                ))}
                {[20, 40, 60, 80].map((x) => (
                  <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100" stroke="#39542f" strokeWidth="0.05" opacity="0.3" />
                ))}

                {/* User's location pin */}
                {myLocation && (() => {
                  const p = projectToViewBox(myLocation.lat, myLocation.lng);
                  return (
                    <g>
                      <circle cx={p.x} cy={p.y} r="1.2" fill="#39542f" opacity="0.2">
                        <animate attributeName="r" from="0.6" to="2" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={p.x} cy={p.y} r="0.6" fill="#39542f" stroke="#fff" strokeWidth="0.3" />
                    </g>
                  );
                })()}

                {/* Markers */}
                {filtered.map((item) => {
                  const p = projectToViewBox(item.lat, item.lng);
                  const meta = TYPE_META[item.type];
                  const isSelected = selected?.id === item.id;
                  return (
                    <g
                      key={item.id}
                      transform={`translate(${p.x}, ${p.y})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(item);
                      }}
                      className="cursor-pointer"
                    >
                      {isSelected && (
                        <circle r="2" fill={meta.color} opacity="0.2">
                          <animate attributeName="r" from="1" to="3" dur="1s" repeatCount="indefinite" />
                          <animate attributeName="opacity" from="0.6" to="0" dur="1s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <circle
                        r={isSelected ? 1.4 : 1}
                        fill={meta.color}
                        stroke="#fff"
                        strokeWidth="0.3"
                      />
                      {isSelected && (
                        <text y="-2" textAnchor="middle" fontSize="1.2" fontWeight="600" fill="#1f2937">
                          {item.title.length > 30 ? item.title.slice(0, 28) + '…' : item.title}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Map controls */}
              <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(z * 1.4, 5))}
                  className="w-9 h-9 bg-surface rounded-md shadow-sm flex items-center justify-center hover:bg-sunken focus-ring"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(z / 1.4, 0.5))}
                  className="w-9 h-9 bg-surface rounded-md shadow-sm flex items-center justify-center hover:bg-sunken focus-ring"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleLocate}
                  className="w-9 h-9 bg-surface rounded-md shadow-sm flex items-center justify-center hover:bg-sunken focus-ring"
                  aria-label="Locate me"
                >
                  <Locate className={`w-4 h-4 ${geoLoading ? 'animate-pulse' : ''}`} />
                </button>
              </div>

              {/* Legend */}
              <div className="absolute bottom-3 left-3 card p-2.5 max-w-[10rem]">
                <div className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Legend</div>
                <div className="space-y-1">
                  {(['farmer', 'post', 'group', 'alert'] as MapItemType[]).map((type) => {
                    const m = TYPE_META[type];
                    return (
                      <div key={type} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                        <span className="text-ink-700">{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Zoom info */}
              <div className="absolute top-3 left-3 card px-2.5 py-1 text-xs text-ink-700">
                Zoom: {zoom.toFixed(1)}x · {filtered.length} of {items.length} visible
              </div>
            </div>

            {geoError && (
              <div className="alert alert-danger m-3">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{geoError}</span>
              </div>
            )}
            {loadError && (
              <div className="alert alert-warn m-3">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{loadError}</span>
              </div>
            )}
          </div>

          {/* Sidebar — list of items */}
          <div className="card overflow-hidden flex flex-col max-h-[34rem] lg:max-h-[40rem]">
            <div className="px-4 py-3 border-b border-subtle flex items-center justify-between">
              <h3 className="text-sm font-semibold text-strong">
                {filterType === 'all' ? 'All items' : TYPE_META[filterType as MapItemType].label} ({filtered.length})
              </h3>
              {selected && (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="p-1 hover:bg-sunken rounded"
                  aria-label="Clear selection"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
              {loading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton h-12 w-full" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={<MapPin className="w-8 h-8" />}
                  title="No items in this area"
                  description={items.length === 0
                    ? 'No farmers, posts, groups, or alerts have been shared with location yet.'
                    : 'Try increasing the radius or clearing the search.'}
                />
              ) : (
                filtered.map((item) => {
                  const m = TYPE_META[item.type];
                  const active = selected?.id === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setSelected(item);
                        setCenter({ lat: item.lat, lng: item.lng });
                        setZoom(2.5);
                      }}
                      className={`w-full text-left p-2.5 rounded-md transition-colors flex items-start gap-2.5 ${
                        active ? `${m.bgClass} ring-1 ring-offset-0 ring-2 ring-leaf-300` : 'hover:bg-sunken'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0`}
                        style={{ background: m.color + '20', color: m.color }}
                      >
                        <m.Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-strong truncate">{item.title}</div>
                        <div className="text-xs text-muted truncate">{item.subtitle}</div>
                        {item.distanceKm !== undefined && (
                          <div className="text-[10px] text-ink-500 mt-0.5">
                            {item.distanceKm < 1
                              ? `${Math.round(item.distanceKm * 1000)} m away`
                              : `${item.distanceKm.toFixed(1)} km away`}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-ink-400 flex-shrink-0 mt-1" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected item detail (sticky bottom sheet on mobile, sidebar on desktop) */}
      {selected && (
        <div className="fixed inset-x-0 bottom-0 md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:max-w-lg z-40 px-3 pb-3 md:pb-0">
          <div className="card card-padded shadow-lg">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                {(() => {
                  const m = TYPE_META[selected.type];
                  return (
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: m.color + '20', color: m.color }}
                    >
                      <m.Icon className="w-4 h-4" />
                    </div>
                  );
                })()}
                <div>
                  <div className="text-sm font-semibold text-strong">{selected.title}</div>
                  <div className="text-xs text-muted">{selected.subtitle}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-1 hover:bg-sunken rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {selected.meta && (
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                {Object.entries(selected.meta).map(([k, v]) => (
                  <div key={k} className="flex flex-col">
                    <span className="text-muted capitalize">{k}</span>
                    <span className="font-medium text-ink-900">{v}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs text-ink-600 mb-3 font-mono">
              {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="primary">
                View details
              </Button>
              <Button size="sm" variant="ghost">
                Directions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapViewPage;
