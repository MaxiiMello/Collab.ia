// ======================================
// Collab.ia — Matching Algorithm
// Cruza datos de Need con Volunteers
// ======================================
import { prisma } from './prisma';

export interface MatchResult {
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

/**
 * Calcula el score de compatibilidad entre un voluntario y una necesidad.
 * Score total: 0.0 → 1.0
 * - Habilidades: 55% (lo más importante)
 * - Localización: 30% (frontera Uruguay/Brasil, priorizar misma ciudad)
 * - Disponibilidad: 15% (texto libre, comparación fuzzy básica)
 */
function calculateScore(
  volunteerSkills: string[],
  volunteerLocation: string | null,
  volunteerAvailability: string | null,
  requiredSkills: string[],
  requiredLocation: string | null,
  requiredAvailability: string | null
): { score: number; matchedSkills: string[]; breakdown: { skills: number; location: number; availability: number } } {
  
  // --- 1. Skills match (55%) ---
  const normalizeSkill = (s: string) => s.toLowerCase().trim();
  const normVolSkills = volunteerSkills.map(normalizeSkill);
  const normReqSkills = requiredSkills.map(normalizeSkill);

  const matchedSkills: string[] = [];
  let skillScore = 0;

  for (const reqSkill of normReqSkills) {
    // Match exacto o parcial
    const matched = normVolSkills.some(
      (vs) => vs.includes(reqSkill) || reqSkill.includes(vs)
    );
    if (matched) {
      skillScore++;
      const originalSkill = requiredSkills[normReqSkills.indexOf(reqSkill)];
      matchedSkills.push(originalSkill);
    }
  }

  const skillsRatio = normReqSkills.length > 0 ? skillScore / normReqSkills.length : 0;
  const skillsContribution = skillsRatio * 0.55;

  // --- 2. Location match (30%) ---
  let locationScore = 0;
  if (volunteerLocation && requiredLocation) {
    const normVolLoc = volunteerLocation.toLowerCase();
    const normReqLoc = requiredLocation.toLowerCase();

    // Misma ciudad exacta
    if (normVolLoc === normReqLoc) {
      locationScore = 1;
    }
    // Misma ciudad (contiene)
    else if (normVolLoc.includes(normReqLoc.split(',')[0]) || normReqLoc.includes(normVolLoc.split(',')[0])) {
      locationScore = 0.8;
    }
    // Frontera: Rivera ↔ Livramento (siempre compatibles, ciudades gemelas)
    else if (
      (normVolLoc.includes('rivera') || normVolLoc.includes('livramento')) &&
      (normReqLoc.includes('rivera') || normReqLoc.includes('livramento'))
    ) {
      locationScore = 0.7;
    }
    // Mismo país
    else if (normVolLoc.includes('uruguay') && normReqLoc.includes('uruguay')) {
      locationScore = 0.4;
    } else if (normVolLoc.includes('brasil') && normReqLoc.includes('brasil')) {
      locationScore = 0.4;
    }
  } else {
    // Sin datos de ubicación, score neutro
    locationScore = 0.5;
  }
  const locationContribution = locationScore * 0.30;

  // --- 3. Availability match (15%) ---
  let availabilityScore = 0;
  if (volunteerAvailability && requiredAvailability) {
    const normVolAvail = volunteerAvailability.toLowerCase();
    const normReqAvail = requiredAvailability.toLowerCase();

    // Keywords de disponibilidad
    const weekendKeywords = ['sábado', 'domingo', 'fin de semana', 'finde', 'sábados', 'domingos', 'sabado', 'domingo'];
    const weekdayKeywords = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'entre semana', 'semana'];
    const anyKeywords = ['cualquier', 'siempre', 'disponible', 'flexible', 'aviso'];

    const isVolWeekend = weekendKeywords.some(kw => normVolAvail.includes(kw));
    const isVolWeekday = weekdayKeywords.some(kw => normVolAvail.includes(kw));
    const isVolAny = anyKeywords.some(kw => normVolAvail.includes(kw));

    const isReqWeekend = weekendKeywords.some(kw => normReqAvail.includes(kw));
    const isReqWeekday = weekdayKeywords.some(kw => normReqAvail.includes(kw));

    if (isVolAny) {
      availabilityScore = 0.9; // Disponible siempre = muy compatible
    } else if (isReqWeekend && isVolWeekend) {
      availabilityScore = 1;
    } else if (isReqWeekday && isVolWeekday) {
      availabilityScore = 1;
    } else if (isReqWeekend && isVolWeekday) {
      availabilityScore = 0.2;
    } else {
      availabilityScore = 0.3; // Sin match claro
    }
  } else {
    availabilityScore = 0.5;
  }
  const availabilityContribution = availabilityScore * 0.15;

  const totalScore = skillsContribution + locationContribution + availabilityContribution;

  return {
    score: Math.min(totalScore, 1), // cap at 1.0
    matchedSkills,
    breakdown: {
      skills: skillsContribution,
      location: locationContribution,
      availability: availabilityContribution,
    },
  };
}

/**
 * Ejecuta el matching completo para una Need.
 * Devuelve los top-N voluntarios ordenados por score.
 */
export async function runMatching(needId: string, topN = 5): Promise<MatchResult[]> {
  const need = await prisma.need.findUnique({ where: { id: needId } });
  if (!need) throw new Error(`Need ${needId} not found`);

  const requiredSkills: string[] = JSON.parse(need.requiredSkills || '[]');

  // Traer todos los voluntarios
  const volunteers = await prisma.user.findMany({
    where: { role: 'volunteer' },
  });

  if (volunteers.length === 0) return [];

  // Calcular scores para todos
  const scored = volunteers.map((vol) => {
    const volSkills: string[] = JSON.parse(vol.skills || '[]');
    const { score, matchedSkills, breakdown } = calculateScore(
      volSkills,
      vol.location,
      vol.availability,
      requiredSkills,
      need.location,
      need.requiredAvailability
    );

    return {
      volunteerId: vol.id,
      volunteerName: vol.name,
      volunteerEmail: vol.email,
      volunteerLocation: vol.location,
      volunteerAvailability: vol.availability,
      volunteerSkills: volSkills,
      volunteerBio: vol.bio,
      volunteerAvatar: vol.avatar,
      score,
      matchedSkills,
      scoreBreakdown: breakdown,
    };
  });

  // Filtrar score > 0 y ordenar
  const filtered = scored
    .filter((s) => s.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  // Guardar matches en la base de datos (upsert)
  for (const match of filtered) {
    await prisma.match.upsert({
      where: {
        needId_volunteerId: {
          needId,
          volunteerId: match.volunteerId,
        },
      },
      update: { score: match.score },
      create: {
        needId,
        volunteerId: match.volunteerId,
        score: match.score,
        status: 'pending',
      },
    });
  }

  return filtered;
}
