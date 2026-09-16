'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sparkles, MapPin, Clock, Building2, Star,
  CheckCircle2, XCircle, LogOut, User, ArrowLeft,
  Heart, AlertCircle
} from 'lucide-react';

interface Match {
  id: string;
  score: number;
  status: string;
  createdAt: string;
  need: {
    id: string;
    title: string;
    description: string;
    requiredSkills: string[];
    requiredAvailability: string;
    location: string;
    status: string;
    org: {
      name: string;
      avatar: string;
      location: string;
    };
  };
  volunteer: {
    skills: string[];
    location: string;
  };
}

function getUser() {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.split(';').find(c => c.trim().startsWith('collabia_user='));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')));
  } catch { return null; }
}

export default function VolunteerMatches() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== 'volunteer') { router.push('/'); return; }
    setUser(u);
    fetchMatches(u.id);
  }, []);

  const fetchMatches = async (volunteerId: string) => {
    try {
      const res = await fetch(`/api/matches?volunteerId=${volunteerId}`);
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateMatchStatus = async (matchId: string, status: 'accepted' | 'rejected') => {
    setUpdating(matchId);
    try {
      await fetch('/api/matches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, status }),
      });
      setMatches(prev =>
        prev.map(m => m.id === matchId ? { ...m, status } : m)
      );
    } finally {
      setUpdating(null);
    }
  };

  const handleLogout = () => {
    document.cookie = 'collabia_user=; path=/; max-age=0';
    router.push('/');
  };

  const pendingMatches = matches.filter(m => m.status === 'pending');
  const acceptedMatches = matches.filter(m => m.status === 'accepted');
  const rejectedMatches = matches.filter(m => m.status === 'rejected');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-800 bg-black">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-lg">Collab.ia</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/volunteer/profile">
              <Button variant="outline" size="sm">
                <User className="w-4 h-4" />
                Mi Perfil
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 pt-12 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Mis Oportunidades
          </h1>
          <p className="text-muted-foreground">
            La IA encontró estas oportunidades basándose en tu perfil
          </p>
        </div>

        {/* Stats row */}
        {matches.length > 0 && (
          <div className="flex gap-3 mb-8">
            <StatPill label="Pendientes" count={pendingMatches.length} color="amber" />
            <StatPill label="Aceptados" count={acceptedMatches.length} color="emerald" />
            <StatPill label="Rechazados" count={rejectedMatches.length} color="gray" />
          </div>
        )}

        {loading ? (
          <div className="text-center py-24">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Buscando matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <EmptyMatches />
        ) : (
          <div className="space-y-8">
            {/* Pending */}
            {pendingMatches.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-400 mb-4">
                  ⏳ Esperando tu respuesta ({pendingMatches.length})
                </h2>
                <div className="space-y-4">
                  {pendingMatches
                    .sort((a, b) => b.score - a.score)
                    .map(match => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        onAccept={() => updateMatchStatus(match.id, 'accepted')}
                        onReject={() => updateMatchStatus(match.id, 'rejected')}
                        updating={updating === match.id}
                      />
                    ))}
                </div>
              </section>
            )}

            {/* Accepted */}
            {acceptedMatches.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-4">
                  ✅ Aceptados ({acceptedMatches.length})
                </h2>
                <div className="space-y-4">
                  {acceptedMatches.map(match => (
                    <MatchCard key={match.id} match={match} accepted />
                  ))}
                </div>
              </section>
            )}

            {/* Rejected */}
            {rejectedMatches.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">
                  Rechazados ({rejectedMatches.length})
                </h2>
                <div className="space-y-4 opacity-60">
                  {rejectedMatches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ---- Sub-components ----

function StatPill({ label, count, color }: {
  label: string; count: number; color: 'amber' | 'emerald' | 'gray'
}) {
  const colorMap = {
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    gray: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  };
  return (
    <div className={`px-3 py-1.5 rounded-full border text-xs font-medium ${colorMap[color]}`}>
      {count} {label}
    </div>
  );
}

function MatchCard({
  match, onAccept, onReject, updating, accepted
}: {
  match: Match;
  onAccept?: () => void;
  onReject?: () => void;
  updating?: boolean;
  accepted?: boolean;
}) {
  const scorePercent = Math.round(match.score * 100);

  return (
    <div className={`border p-5 rounded-xl transition-all ${
      accepted ? 'border-green-800 bg-green-900/10' :
      match.status === 'rejected' ? 'border-gray-800 opacity-50' : 'border-gray-700 bg-gray-900 hover:border-blue-500'
    }`}>
      <div className="flex items-start gap-4">
        {/* Org Avatar */}
        <div className="w-12 h-12 rounded bg-blue-900/50 flex items-center justify-center text-xl flex-shrink-0">
          {match.need.org.avatar || '🏛️'}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="font-semibold text-sm leading-snug">{match.need.title}</p>
              <p className="text-xs text-muted-foreground">{match.need.org.name}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {match.status === 'accepted' && (
                <Badge variant="skill-match">✓ Aceptado</Badge>
              )}
              {match.status === 'rejected' && (
                <Badge variant="closed">Rechazado</Badge>
              )}
              <span className="text-sm font-bold text-white">{scorePercent}%</span>
            </div>
          </div>

          {/* Score Bar */}
          <div className="h-1.5 bg-gray-800 rounded mb-3">
            <div
              className="h-full rounded bg-blue-500"
              style={{ width: `${scorePercent}%` }}
            />
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{match.need.description}</p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
            {match.need.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {match.need.location}
              </span>
            )}
            {match.need.requiredAvailability && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {match.need.requiredAvailability}
              </span>
            )}
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(match.need.requiredSkills || []).slice(0, 4).map((skill) => {
              const isMySkill = (match.volunteer.skills || []).some(
                vs => vs.toLowerCase().includes(skill.toLowerCase()) ||
                      skill.toLowerCase().includes(vs.toLowerCase())
              );
              return (
                <span
                  key={skill}
                  className={isMySkill ? 'skill-chip-match' : 'skill-chip'}
                >
                  {isMySkill && '✓ '}{skill}
                </span>
              );
            })}
          </div>

          {/* Actions */}
          {match.status === 'pending' && onAccept && onReject && (
            <div className="flex gap-2">
              <Button
                id={`accept-match-${match.id}`}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
                onClick={onAccept}
                disabled={updating}
              >
                {updating ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Me interesa
                  </>
                )}
              </Button>
              <Button
                id={`reject-match-${match.id}`}
                variant="outline"
                size="sm"
                onClick={onReject}
                disabled={updating}
              >
                <XCircle className="w-4 h-4" />
                No puedo
              </Button>
            </div>
          )}

          {match.status === 'accepted' && (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>¡Genial! La organización fue notificada de tu interés</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyMatches() {
  return (
    <div className="text-center py-20 border border-gray-800 bg-gray-900 rounded-xl">
      <div className="w-20 h-20 rounded bg-blue-900/50 flex items-center justify-center mx-auto mb-6">
        <Star className="w-10 h-10 text-blue-400" />
      </div>
      <h3 className="text-xl font-bold mb-2">Sin matches aún</h3>
      <p className="text-gray-400 mb-6 max-w-sm mx-auto text-sm">
        Aún no hay necesidades que coincidan con tu perfil. Asegúrate de tener tus habilidades actualizadas.
      </p>
      <Link href="/volunteer/profile">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <User className="w-4 h-4" />
          Actualizar mi perfil
        </Button>
      </Link>
    </div>
  );
}
