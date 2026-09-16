'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Sparkles, Save, Plus, X, MapPin, Clock, User,
  ArrowRight, CheckCircle2, LogOut, Users
} from 'lucide-react';

const SKILL_SUGGESTIONS = [
  'Diseño gráfico', 'Fotografía', 'Video', 'Ilustración',
  'Sonido', 'DJ', 'Música', 'Producción musical',
  'Desarrollo web', 'React', 'JavaScript', 'WordPress',
  'Logística', 'Organización de eventos', 'Armado de estructuras',
  'Marketing digital', 'Redes sociales', 'Redacción',
  'Traducción ES-PT', 'Carpintería', 'Electricidad', 'Cocina',
];

const INTEREST_SUGGESTIONS = [
  'Arte y cultura', 'Música', 'Educación', 'Medio ambiente',
  'Deporte', 'Salud', 'Tecnología', 'Comunidad', 'Social',
  'Infancia', 'Animales', 'Adultos mayores', 'Cualquier tipo de causa',
];

const AVAILABILITY_OPTIONS = [
  'Fines de semana',
  'Sábados únicamente',
  'Domingos únicamente',
  'Entre semana (tarde/noche)',
  'Cualquier día con aviso previo',
  'Solo mañanas',
  'Solo tardes',
  'Horario flexible',
];

function getUser() {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.split(';').find(c => c.trim().startsWith('collabia_user='));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')));
  } catch { return null; }
}

export default function VolunteerProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== 'volunteer') { router.push('/'); return; }
    setUser(u);
    // Load existing data
    fetch(`/api/users?role=volunteer`)
      .then(r => r.json())
      .then(data => {
        const me = data.users?.find((u2: any) => u2.id === u.id);
        if (me) {
          setSkills(me.skills || []);
          setInterests(me.interests || []);
          setAvailability(me.availability || '');
          setLocation(me.location || '');
          setBio(me.bio || '');
        }
      });
  }, []);

  const toggleSkill = (skill: string) => {
    setSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const TODAS_LAS_CAUSAS = 'Cualquier tipo de causa';

  const toggleInterest = (interest: string) => {
    if (interest === TODAS_LAS_CAUSAS) {
      // Si ya estaban todas seleccionadas, deseleccionar todo
      const allSelected = INTEREST_SUGGESTIONS.every(i => interests.includes(i));
      setInterests(allSelected ? [] : [...INTEREST_SUGGESTIONS]);
    } else {
      setInterests(prev =>
        prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
      );
    }
  };

  const addCustomSkill = () => {
    const s = customSkill.trim().toLowerCase();
    if (s && !skills.includes(s)) {
      setSkills(prev => [...prev, s]);
      setCustomSkill('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          role: 'volunteer',
          skills,
          interests,
          availability,
          location,
          bio,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'collabia_user=; path=/; max-age=0';
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-800 bg-black">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-lg">Collab.ia</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/volunteer/matches">
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4" />
                Mis Matches
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 pt-12 pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded bg-blue-900/50 flex items-center justify-center text-3xl">
              🤝
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name || 'Mi Perfil'}</h1>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            Completa tu perfil para que la IA pueda hacer un match preciso con las necesidades de las organizaciones.
          </p>
        </div>

        <div className="space-y-6">
          {/* Skills */}
          <div className="border border-gray-800 bg-gray-900 rounded-xl p-6">
            <div className="pb-4">
              <h2 className="font-bold text-lg">💡 Habilidades</h2>
              <p className="text-sm text-gray-400">¿Qué sabes hacer? Selecciona tus habilidades técnicas</p>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {SKILL_SUGGESTIONS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill.toLowerCase())}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                      skills.includes(skill.toLowerCase())
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {skills.includes(skill.toLowerCase()) && '✓ '}
                    {skill}
                  </button>
                ))}
              </div>

              {/* Custom skill input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar habilidad personalizada..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
                  className="flex-1 bg-black"
                />
                <Button variant="outline" size="icon" onClick={addCustomSkill} className="border-gray-700">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Selected skills */}
              {skills.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Seleccionadas ({skills.length}):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-blue-900/50 text-blue-300"
                      >
                        {skill}
                        <button onClick={() => toggleSkill(skill)} className="hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interests */}
          <div className="border border-gray-800 bg-gray-900 rounded-xl p-6">
            <div className="pb-4">
              <h2 className="font-bold text-lg">❤️ Intereses</h2>
              <p className="text-sm text-gray-400">¿Qué causas te importan?</p>
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                {INTEREST_SUGGESTIONS.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                      interests.includes(interest)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {interests.includes(interest) && '✓ '}
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Availability + Location */}
          <div className="border border-gray-800 bg-gray-900 rounded-xl p-6">
            <div className="pb-4">
              <h2 className="font-bold text-lg">📅 Disponibilidad & Ubicación</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>¿Cuándo puedes ayudar?</Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAvailability(opt)}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                        availability === opt
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vol-location">
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  Ubicación
                </Label>
                <Input
                  id="vol-location"
                  placeholder="Rivera, Uruguay"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vol-bio">Cuéntanos sobre ti (opcional)</Label>
                <Textarea
                  id="vol-bio"
                  placeholder="Cuéntanos tu experiencia, motivaciones o cualquier cosa relevante..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="min-h-[80px] bg-black"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              id="save-profile-btn"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
              onClick={handleSave}
              disabled={saving}
            >
              {saved ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  ¡Perfil guardado!
                </span>
              ) : saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Guardar Perfil
                </span>
              )}
            </Button>
            <Link href="/volunteer/matches" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Ver mis matches
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
