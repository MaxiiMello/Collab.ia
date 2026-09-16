'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Users, Building2, MapPin, Zap, Heart, ArrowRight, Globe } from 'lucide-react';

type Role = 'volunteer' | 'org';

interface FormData {
  name: string;
  email: string;
  location: string;
}

export default function LandingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [form, setForm] = useState<FormData>({ name: '', email: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEnter = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Por favor completa nombre y email');
      return;
    }
    if (!selectedRole) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          role: selectedRole,
          location: form.location || (selectedRole === 'org' ? 'Rivera/Livramento' : 'Rivera/Livramento'),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Guardar usuario en cookie/localStorage (fake auth)
      document.cookie = `collabia_user=${JSON.stringify({ id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role })}; path=/; max-age=86400`;

      // Redirigir según rol
      if (selectedRole === 'org') {
        router.push('/org/dashboard');
      } else {
        router.push('/volunteer/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* ---- Header ---- */}
      <nav className="border-b border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Collab.ia</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Globe className="w-4 h-4" />
            <span>Rivera · Livramento</span>
          </div>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className="flex-1 flex items-center justify-center px-6 pt-12 pb-12">
        <div className="max-w-5xl w-full">
          {/* Hero Text */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Voluntariado Inteligente
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
              La IA conecta tu necesidad con el voluntario perfecto en la frontera Rivera · Livramento
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              { icon: Sparkles, label: 'Match por IA' },
              { icon: MapPin, label: 'Frontera UY-BR' },
              { icon: Heart, label: 'Impacto real' },
              { icon: Zap, label: 'En segundos' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-1 rounded border border-gray-700 bg-gray-800 text-sm">
                <Icon className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">{label}</span>
              </div>
            ))}
          </div>

          {/* ---- Role Selection + Form ---- */}
          <div className="max-w-lg mx-auto">
            {/* Role Selector */}
            {!selectedRole ? (
              <div className="space-y-4">
                <p className="text-center text-gray-400 text-sm mb-4 font-bold uppercase">
                  ¿Cómo quieres participar?
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <RoleCard
                    icon={Building2}
                    title="Soy Organización"
                    subtitle="Publico necesidades"
                    onClick={() => setSelectedRole('org')}
                  />
                  <RoleCard
                    icon={Users}
                    title="Soy Voluntario"
                    subtitle="Ofrezco mis habilidades"
                    onClick={() => setSelectedRole('volunteer')}
                  />
                </div>
              </div>
            ) : (
              <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
                <div className="pb-4 border-b border-gray-800 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <button
                      onClick={() => setSelectedRole(null)}
                      className="text-gray-400 hover:text-white text-sm"
                    >
                      ← Volver
                    </button>
                    <span className="px-2 py-1 bg-gray-800 text-xs rounded text-gray-300">
                      {selectedRole === 'org' ? 'Organización' : 'Voluntario'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold">
                    {selectedRole === 'org' ? 'Registro Organización' : 'Registro Voluntario'}
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      placeholder={selectedRole === 'org' ? 'Ej: Centro Cultural' : 'Ej: Ana García'}
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      className="bg-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="hola@ejemplo.com"
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      className="bg-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      placeholder="Rivera, Uruguay"
                      value={form.location}
                      onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                      className="bg-black"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 bg-red-900/50 p-2 rounded">
                      {error}
                    </p>
                  )}

                  <Button
                    id="enter-btn"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                    onClick={handleEnter}
                    disabled={loading}
                  >
                    {loading ? 'Ingresando...' : 'Ingresar'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="py-6 text-center text-sm text-gray-500 border-t border-gray-800">
        <p>Collab.ia · Hackathon 2026</p>
      </footer>
    </main>
  );
}

// ---- Sub-components ----

function RoleCard({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 text-left transition-colors"
    >
      <div className="w-10 h-10 rounded bg-blue-900/50 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-blue-400" />
      </div>
      <p className="font-bold text-sm mb-1">{title}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </button>
  );
}
