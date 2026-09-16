'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Sparkles, ArrowLeft, Send, MapPin, Clock, Zap,
  CheckCircle2, User, Star, AlertCircle, Lightbulb
} from 'lucide-react';

interface ExtractedData {
  title: string;
  required_skills: string[];
  required_availability: string;
  location: string;
}

interface MatchResult {
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerLocation: string | null;
  volunteerAvailability: string | null;
  volunteerSkills: string[];
  volunteerBio: string | null;
  volunteerAvatar: string | null;
  score: number;
  matchedSkills: string[];
  scoreBreakdown: {
    skills: number;
    location: number;
    availability: number;
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

const EXAMPLE_DESCRIPTIONS = [
  "Necesito un diseñador gráfico para crear el flyer y las piezas digitales para nuestro evento benéfico este sábado en Rivera",
  "Buscamos un técnico de sonido para el festival de música del próximo fin de semana en Livramento",
  "Necesitamos personas para ayudar con el armado del escenario y la logística el viernes en la tarde en Rivera",
  "Buscamos un fotógrafo o videoasta para cubrir nuestra feria de emprendedores el sábado en Livramento",
];

type Stage = 'form' | 'analyzing' | 'results';

export default function NewNeedPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<Stage>('form');
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState('');
  const [needId, setNeedId] = useState('');

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== 'org') { router.push('/'); return; }
    setUser(u);
  }, []);

  const handleSubmit = async () => {
    if (description.trim().length < 10) {
      setError('La descripción debe ser más detallada (mínimo 10 caracteres)');
      return;
    }
    setError('');
    setStage('analyzing');

    try {
      const res = await fetch('/api/needs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, orgId: user.id }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setExtracted(data.need.extracted);
      setMatches(data.matches || []);
      setNeedId(data.need.id);
      setStage('results');
    } catch (err: any) {
      setError(err.message || 'Error al procesar la necesidad');
      setStage('form');
    }
  };

  const handleReset = () => {
    setStage('form');
    setDescription('');
    setExtracted(null);
    setMatches([]);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/org/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-sm text-muted-foreground">Nueva Necesidad</span>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-24 pb-12">
        {stage === 'form' && (
          <FormStage
            description={description}
            setDescription={setDescription}
            onSubmit={handleSubmit}
            error={error}
          />
        )}
        {stage === 'analyzing' && <AnalyzingStage description={description} />}
        {stage === 'results' && extracted && (
          <ResultsStage
            description={description}
            extracted={extracted}
            matches={matches}
            onReset={handleReset}
            onViewDashboard={() => router.push('/org/dashboard')}
          />
        )}
      </main>
    </div>
  );
}

// ---- Stage: Form ----
function FormStage({
  description, setDescription, onSubmit, error
}: {
  description: string;
  setDescription: (v: string) => void;
  onSubmit: () => void;
  error: string;
}) {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-4">
          <Zap className="w-3 h-3" />
          Powered by Gemini AI
        </div>
        <h1 className="text-3xl font-bold mb-2">¿Qué necesitas?</h1>
        <p className="text-muted-foreground">
          Describe tu necesidad en lenguaje natural. La IA extraerá las habilidades, 
          disponibilidad y ubicación para encontrar al voluntario perfecto.
        </p>
      </div>

      <Card className="glass-card mb-6">
        <CardContent className="p-6 space-y-4">
          <Textarea
            id="need-description"
            placeholder="Ej: Necesito un diseñador gráfico para crear el flyer de nuestro evento benéfico este sábado en Rivera..."
            className="min-h-[140px] text-base leading-relaxed"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {description.length} caracteres
            </span>
            <Button
              id="analyze-btn"
              variant="gradient"
              onClick={onSubmit}
              disabled={description.trim().length < 10}
            >
              <Sparkles className="w-4 h-4" />
              Analizar con IA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Examples */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Ejemplos de necesidades:</span>
        </div>
        <div className="space-y-2">
          {EXAMPLE_DESCRIPTIONS.map((ex, i) => (
            <button
              key={i}
              onClick={() => setDescription(ex)}
              className="w-full text-left px-4 py-3 rounded-xl border border-white/8 bg-white/3 hover:bg-white/8 hover:border-white/15 text-sm text-muted-foreground transition-all duration-200 line-clamp-2"
            >
              "{ex}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Stage: Analyzing ----
function AnalyzingStage({ description }: { description: string }) {
  const steps = [
    { label: 'Enviando a Gemini AI...', done: true },
    { label: 'Extrayendo habilidades requeridas...', done: true },
    { label: 'Identificando disponibilidad y ubicación...', done: false },
    { label: 'Ejecutando algoritmo de matching...', done: false },
  ];

  return (
    <div className="max-w-2xl mx-auto text-center py-16 animate-fade-in">
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 opacity-20 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 opacity-10 animate-pulse" />
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-600/30 border border-violet-500/40 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-violet-400" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2">La IA está analizando...</h2>
      <p className="text-muted-foreground mb-10 text-sm">
        Gemini está procesando tu descripción y buscando voluntarios compatibles
      </p>

      <div className="text-left space-y-3 max-w-sm mx-auto">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              step.done ? 'bg-emerald-500/20 border border-emerald-500/40' : 'border border-white/20'
            }`}>
              {step.done
                ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                : <div className="w-2 h-2 rounded-full border-2 border-violet-500/50 border-t-violet-500 animate-spin" />
              }
            </div>
            <span className={`text-sm ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Stage: Results ----
function ResultsStage({
  description, extracted, matches, onReset, onViewDashboard
}: {
  description: string;
  extracted: ExtractedData;
  matches: MatchResult[];
  onReset: () => void;
  onViewDashboard: () => void;
}) {
  return (
    <div className="animate-fade-in space-y-8">
      {/* Success Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">¡Análisis completado!</h1>
          <p className="text-muted-foreground text-sm">
            Se encontraron {matches.length} voluntario{matches.length !== 1 ? 's' : ''} compatible{matches.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Extracted Data */}
        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" />
            Datos extraídos por IA
          </h2>

          <Card className="glass-card">
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Título generado</p>
                <p className="font-semibold text-sm">{extracted.title}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Habilidades requeridas</p>
                <div className="flex flex-wrap gap-1.5">
                  {extracted.required_skills.map((skill) => (
                    <span key={skill} className="skill-chip">{skill}</span>
                  ))}
                  {extracted.required_skills.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No detectadas</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Disponibilidad
                  </p>
                  <p className="text-sm">{extracted.required_availability || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Ubicación
                  </p>
                  <p className="text-sm">{extracted.location || '—'}</p>
                </div>
              </div>

              {/* Original text */}
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Texto original</p>
                <p className="text-xs text-muted-foreground italic line-clamp-3">"{description}"</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Matches */}
        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Voluntarios recomendados
          </h2>

          {matches.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <User className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium mb-1">Sin matches por ahora</p>
                <p className="text-sm text-muted-foreground">
                  No encontramos voluntarios con esas habilidades todavía. 
                  Tu necesidad quedó guardada y te notificaremos cuando alguien se registre.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {matches.map((match, i) => (
                <VolunteerMatchCard key={match.volunteerId} match={match} rank={i + 1} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
        <Button variant="outline" onClick={onReset}>
          + Publicar otra necesidad
        </Button>
        <Button variant="gradient" onClick={onViewDashboard}>
          Ver dashboard completo
        </Button>
      </div>
    </div>
  );
}

function VolunteerMatchCard({ match, rank }: { match: MatchResult; rank: number }) {
  const scorePercent = Math.round(match.score * 100);
  const gradientColor =
    scorePercent >= 70 ? 'from-emerald-500 to-teal-400' :
    scorePercent >= 40 ? 'from-amber-500 to-orange-400' : 'from-rose-500 to-pink-400';

  return (
    <div className="glass-card p-4 rounded-2xl hover:border-white/20 transition-all group">
      <div className="flex items-start gap-3">
        {/* Rank */}
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-muted-foreground">
          {rank}
        </div>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg flex-shrink-0">
          {match.volunteerAvatar || '👤'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-sm">{match.volunteerName}</p>
            <span className="text-sm font-bold text-white">{scorePercent}%</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
            {match.volunteerLocation && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {match.volunteerLocation}
              </span>
            )}
            {match.volunteerAvailability && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {match.volunteerAvailability}
              </span>
            )}
          </div>

          {/* Score bar */}
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${gradientColor} transition-all duration-700`}
              style={{ width: `${scorePercent}%` }}
            />
          </div>

          {/* Matched skills */}
          {match.matchedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-xs text-muted-foreground mr-1">Match:</span>
              {match.matchedSkills.slice(0, 3).map((skill) => (
                <span key={skill} className="skill-chip-match">{skill}</span>
              ))}
            </div>
          )}

          {/* Score Breakdown */}
          <div className="grid grid-cols-3 gap-1 mt-2 text-xs text-muted-foreground">
            <span>Skills: {Math.round(match.scoreBreakdown.skills * 100)}%</span>
            <span>Loc: {Math.round(match.scoreBreakdown.location * 100)}%</span>
            <span>Disp: {Math.round(match.scoreBreakdown.availability * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
