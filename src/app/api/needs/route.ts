// ======================================
// POST /api/needs — El endpoint CORE del happy path
// 1. Recibe descripción en texto plano
// 2. Llama a Gemini para extraer datos estructurados
// 3. Guarda la Need en la DB
// 4. Ejecuta el algoritmo de matching
// 5. Devuelve need + matches
//
// GET /api/needs?orgId=xxx — Listar needs de una org
// ======================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractNeedFromText } from '@/lib/gemini';
import { runMatching } from '@/lib/matching';

// ======================================
// Fallback inteligente: extrae datos del texto sin IA
// ======================================
function smartFallbackExtract(description: string) {
  const text = description.toLowerCase();

  // Mapeo de keywords → habilidades normalizadas
  const SKILL_KEYWORDS: Record<string, string> = {
    'diseñ': 'diseño gráfico', 'design': 'diseño gráfico', 'flyer': 'diseño gráfico',
    'photoshop': 'photoshop', 'illustrator': 'illustrator', 'canva': 'canva',
    'fotograf': 'fotografía', 'foto': 'fotografía', 'fotógrafo': 'fotografía',
    'video': 'video', 'videoast': 'video', 'filmacion': 'video',
    'sonido': 'sonido', 'audio': 'sonido', 'técnico de sonido': 'sonido', 'dj': 'DJ',
    'música': 'música', 'musico': 'música', 'produccion musical': 'producción musical',
    'web': 'desarrollo web', 'react': 'React', 'javascript': 'JavaScript', 'wordpress': 'WordPress',
    'logístic': 'logística', 'logistic': 'logística',
    'armado': 'armado de estructuras', 'escenario': 'armado de estructuras',
    'organizacion': 'organización de eventos', 'coordinacion': 'organización de eventos',
    'redaccion': 'redacción', 'texto': 'redacción', 'copywriting': 'redacción',
    'redes sociales': 'redes sociales', 'instagram': 'redes sociales', 'facebook': 'redes sociales',
    'marketing': 'marketing digital',
    'traduccion': 'traducción ES-PT', 'traductor': 'traducción ES-PT',
    'carpintería': 'carpintería', 'carpinter': 'carpintería',
    'electricidad': 'electricidad', 'electricista': 'electricidad',
  };

  const foundSkills = new Set<string>();
  for (const [keyword, skill] of Object.entries(SKILL_KEYWORDS)) {
    if (text.includes(keyword)) foundSkills.add(skill);
  }

  // Extraer disponibilidad
  let availability = 'a coordinar';
  if (text.includes('sábado') || text.includes('sabado') || text.includes('domingo') || text.includes('fin de semana') || text.includes('finde')) {
    availability = text.includes('sábado') ? 'este sábado' : 'este fin de semana';
  } else if (text.includes('viernes')) availability = 'este viernes';
  else if (text.includes('semana')) availability = 'durante la semana';

  // Extraer ubicación
  let location = 'Rivera/Livramento';
  if (text.includes('livramento')) location = 'Santana do Livramento, Brasil';
  else if (text.includes('rivera')) location = 'Rivera, Uruguay';

  // Título limpio
  const title = description.length > 60
    ? description.substring(0, 57) + '...'
    : description;

  return {
    title,
    required_skills: Array.from(foundSkills),
    required_availability: availability,
    location,
  };
}

// GET /api/needs?orgId=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');

  try {
    const needs = await prisma.need.findMany({
      where: orgId ? { orgId } : undefined,
      include: {
        org: { select: { name: true, avatar: true } },
        matches: {
          include: {
            volunteer: { select: { name: true, email: true, avatar: true } },
          },
          orderBy: { score: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsed = needs.map((n) => ({
      ...n,
      requiredSkills: JSON.parse(n.requiredSkills),
      matches: n.matches.map((m) => ({ ...m })),
    }));

    return NextResponse.json({ needs: parsed });
  } catch (error) {
    console.error('GET /api/needs error:', error);
    return NextResponse.json({ error: 'Error al obtener needs' }, { status: 500 });
  }
}

// POST /api/needs — Happy Path principal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, orgId } = body;

    if (!description || !orgId) {
      return NextResponse.json(
        { error: 'description y orgId son requeridos' },
        { status: 400 }
      );
    }

    if (description.trim().length < 10) {
      return NextResponse.json(
        { error: 'La descripción debe tener al menos 10 caracteres' },
        { status: 400 }
      );
    }

    // ---- PASO 2: IA analiza el texto ----
    console.log('🤖 Extrayendo datos con Gemini...');
    let extracted;
    try {
      extracted = await extractNeedFromText(description);
      console.log('✅ Gemini extrajo:', extracted);
    } catch (aiError) {
      console.error('❌ Error con Gemini (usando fallback):', aiError);
      // Fallback inteligente: extracción por keywords sin IA
      extracted = smartFallbackExtract(description);
      console.log('🔄 Fallback extrajo:', extracted);
    }

    // ---- PASO 3: Guardar Need en DB ----
    const need = await prisma.need.create({
      data: {
        orgId,
        title: extracted.title,
        description,
        requiredSkills: JSON.stringify(extracted.required_skills),
        requiredAvailability: extracted.required_availability,
        location: extracted.location,
        status: 'open',
      },
    });

    // ---- PASO 4: Ejecutar matching ----
    console.log('🔍 Ejecutando matching...');
    let matchResults: any[] = [];
    try {
      matchResults = await runMatching(need.id, 5);
      console.log(`✅ Matching encontró ${matchResults.length} voluntarios`);
    } catch (matchError) {
      console.error('❌ Error en matching:', matchError);
    }

    // ---- PASO 5: Retornar resultados ----
    return NextResponse.json({
      need: {
        ...need,
        requiredSkills: JSON.parse(need.requiredSkills),
        extracted, // Debug info visible en frontend
      },
      matches: matchResults,
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/needs error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
