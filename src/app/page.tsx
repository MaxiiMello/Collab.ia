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
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Collab<span className="gradient-text">.ia</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="w-4 h-4" />
            <span>Rivera · Livramento</span>
          </div>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
        <div className="max-w-5xl w-full">
          {/* Hero Text */}
          <div className="text-center mb-16 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8">
              <Zap className="w-3.5 h-3.5" />
              Powered by Gemini AI
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Voluntariado
              <br />
              <span className="gradient-text">Inteligente</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4">
              La IA conecta tu necesidad con el voluntario perfecto en la frontera
              <span className="text-foreground font-medium"> Rivera · Livramento</span>
            </p>

            <p className="text-base text-muted-foreground/70 italic">
              "O voluntariado certo, no momento certo, no lugar certo."
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-16 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {[
              { icon: Sparkles, label: 'Match por IA', color: 'text-violet-400' },
              { icon: MapPin, label: 'Frontera UY-BR', color: 'text-blue-400' },
              { icon: Heart, label: 'Impacto real', color: 'text-pink-400' },
              { icon: Zap, label: 'En segundos', color: 'text-amber-400' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* ---- Role Selection + Form ---- */}
          <div className="max-w-lg mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {/* Role Selector */}
            {!selectedRole ? (
              <div className="space-y-4">
                <p className="text-center text-muted-foreground text-sm mb-6 font-medium uppercase tracking-widest">
                  ¿Cómo quieres participar?
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <RoleCard
                    icon={Building2}
                    title="Soy Organización"
                    subtitle="Publico necesidades y busco voluntarios"
                    color="violet"
                    onClick={() => setSelectedRole('org')}
                  />
                  <RoleCard
                    icon={Users}
                    title="Sou Voluntário"
                    subtitle="Quiero ofrecer mis habilidades"
                    color="indigo"
                    onClick={() => setSelectedRole('volunteer')}
                  />
                </div>
              </div>
            ) : (
              <Card className="glass-card animate-fade-in">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedRole(null)}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      ← Volver
                    </button>
                    <div className="flex-1" />
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedRole === 'org'
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {selectedRole === 'org' ? '🏛️ Organización' : '🤝 Voluntario'}
                    </div>
                  </div>
                  <CardTitle className="text-xl mt-2">
                    {selectedRole === 'org' ? 'Registra tu organización' : 'Crea tu perfil'}
                  </CardTitle>
                  <CardDescription>
                    {selectedRole === 'org'
                      ? 'Publica necesidades y la IA encuentra los voluntarios perfectos'
                      : 'Completa tus datos y empieza a hacer match con causas que te importan'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {selectedRole === 'org' ? 'Nombre de la organización' : 'Tu nombre completo'}
                    </Label>
                    <Input
                      id="name"
                      placeholder={selectedRole === 'org' ? 'Centro Cultural Rivera' : 'Ana García'}
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      placeholder="Rivera, Uruguay"
                      value={form.location}
                      onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <Button
                    id="enter-btn"
                    className="w-full"
                    variant="gradient"
                    size="lg"
                    onClick={handleEnter}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Ingresando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Ingresar a Collab.ia
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Demo mode — sin contraseña requerida
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-white/5">
        <p>Collab.ia · Hackathon 2026 · 🇺🇾 Rivera / Santana do Livramento 🇧🇷</p>
      </footer>
    </main>
  );
}

// ---- Sub-components ----

function RoleCard({
  icon: Icon,
  title,
  subtitle,
  color,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: 'violet' | 'indigo';
  onClick: () => void;
}) {
  const colorClasses = {
    violet: {
      bg: 'hover:bg-violet-500/10 hover:border-violet-500/30',
      icon: 'bg-violet-500/20 text-violet-400',
    },
    indigo: {
      bg: 'hover:bg-indigo-500/10 hover:border-indigo-500/30',
      icon: 'bg-indigo-500/20 text-indigo-400',
    },
  };

  const cls = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className={`group p-6 rounded-2xl border border-white/10 bg-white/5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${cls.bg}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${cls.icon}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-semibold text-sm mb-1">{title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{subtitle}</p>
    </button>
  );
}
