'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Sparkles, Plus, MapPin, Clock, Users, ChevronRight,
  Building2, LogOut, TrendingUp, CheckCircle2, Circle
} from 'lucide-react';

interface Need {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  requiredAvailability: string;
  location: string;
  status: string;
  createdAt: string;
  org: { name: string; avatar: string };
  matches: Array<{
    id: string;
    score: number;
    status: string;
    volunteer: { name: string; email: string; avatar: string };
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.split(';').find(c => c.trim().startsWith('collabia_user='));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')));
  } catch {
    return null;
  }
}

export default function OrgDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== 'org') {
      router.push('/');
      return;
    }
    setUser(u);
    fetchNeeds(u.id);
  }, []);

  const fetchNeeds = async (orgId: string) => {
    try {
      const res = await fetch(`/api/needs?orgId=${orgId}`);
      const data = await res.json();
      setNeeds(data.needs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'collabia_user=; path=/; max-age=0';
    router.push('/');
  };

  const totalMatches = needs.reduce((acc, n) => acc + n.matches.length, 0);
  const openNeeds = needs.filter(n => n.status === 'open').length;
  const acceptedMatches = needs.reduce((acc, n) =>
    acc + n.matches.filter(m => m.status === 'accepted').length, 0
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <nav className="border-b border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Collab.ia</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-gray-700 bg-gray-800">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm font-bold text-gray-300">{user?.name || '...'}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Salir" className="text-gray-400">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-12 pb-12">
        {/* Hero Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Panel de Organización
            </h1>
            <p className="text-muted-foreground">
              Publica necesidades y la IA hace el match automáticamente
            </p>
          </div>
          <Link href="/org/new-need">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="lg" id="new-need-btn">
              <Plus className="w-5 h-5 mr-2" />
              Nueva Necesidad
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <StatCard
            icon={Circle}
            label="Necesidades Activas"
            value={openNeeds}
            color="violet"
          />
          <StatCard
            icon={Users}
            label="Matches Encontrados"
            value={totalMatches}
            color="indigo"
          />
          <StatCard
            icon={CheckCircle2}
            label="Matches Aceptados"
            value={acceptedMatches}
            color="emerald"
          />
        </div>

        {/* Needs List */}
        {loading ? (
          <div className="text-center py-24 text-muted-foreground">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
            Cargando necesidades...
          </div>
        ) : needs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {needs.map((need, i) => (
              <NeedCard
                key={need.id}
                need={need}
                index={i}
                isSelected={selectedNeed?.id === need.id}
                onClick={() => setSelectedNeed(selectedNeed?.id === need.id ? null : need)}
              />
            ))}
          </div>
        )}

        {/* Match Detail Panel */}
        {selectedNeed && selectedNeed.matches.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Voluntarios recomendados para:{' '}
              <span className="text-blue-300">{selectedNeed.title}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedNeed.matches
                .sort((a, b) => b.score - a.score)
                .map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ---- Sub-components ----

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="border border-gray-800 bg-gray-900 rounded-xl p-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center text-blue-400">
        <Icon className="w-6 h-6" />
      </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-400">{label}</p>
        </div>
    </div>
  );
}

function NeedCard({ need, index, isSelected, onClick }: {
  need: Need;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left w-full rounded-xl border transition-all duration-300 p-5 group
        ${isSelected
          ? 'border-blue-500 bg-gray-800'
          : 'border-gray-800 bg-gray-900 hover:bg-gray-800'
        }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={need.status === 'open' ? 'open' : 'closed'}>
              {need.status === 'open' ? '● Activa' : '○ Cerrada'}
            </Badge>
            {need.matches.length > 0 && (
              <Badge variant="skill">
                {need.matches.length} match{need.matches.length !== 1 ? 'es' : ''}
              </Badge>
            )}
          </div>
          <h3 className="font-bold text-sm leading-snug">{need.title}</h3>
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${isSelected ? 'rotate-90 text-blue-400' : 'group-hover:translate-x-0.5'}`} />
      </div>

      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{need.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {(need.requiredSkills || []).slice(0, 3).map((skill) => (
          <span key={skill} className="skill-chip">{skill}</span>
        ))}
        {(need.requiredSkills || []).length > 3 && (
          <span className="skill-chip">+{need.requiredSkills.length - 3}</span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {need.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {need.location}
          </span>
        )}
        {need.requiredAvailability && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {need.requiredAvailability}
          </span>
        )}
      </div>
    </button>
  );
}

function MatchCard({ match }: { match: Need['matches'][0] }) {
  const scorePercent = Math.round(match.score * 100);

  return (
    <div className="border border-gray-800 bg-gray-900 rounded-xl hover:border-gray-700 transition-all p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded bg-blue-900/50 flex items-center justify-center text-lg flex-shrink-0">
            {match.volunteer.avatar || '👤'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{match.volunteer.name}</p>
            <p className="text-xs text-muted-foreground truncate">{match.volunteer.email}</p>
          </div>
          <Badge variant={match.status === 'accepted' ? 'skill-match' : match.status === 'rejected' ? 'closed' : 'status'}>
            {match.status === 'accepted' ? '✓ Aceptado' : match.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
          </Badge>
        </div>

        {/* Score Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Compatibilidad</span>
            <span className="font-bold text-white">{scorePercent}%</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded overflow-hidden">
            <div
              className="h-full rounded bg-blue-500"
              style={{ width: `${scorePercent}%` }}
            />
          </div>
        </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24 border border-gray-800 bg-gray-900 rounded-xl">
      <div className="w-20 h-20 rounded bg-gray-800 flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-10 h-10 text-blue-500" />
      </div>
      <h3 className="text-xl font-bold mb-2">Aún no hay necesidades</h3>
      <p className="text-gray-400 mb-8 max-w-sm mx-auto">
        Publica tu primera necesidad y la IA encontrará los voluntarios perfectos en segundos
      </p>
      <Link href="/org/new-need">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Publicar primera necesidad
        </Button>
      </Link>
    </div>
  );
}
