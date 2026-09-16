// ======================================
// GET  /api/matches?volunteerId=xxx — Matches del voluntario
// PATCH /api/matches/[id] — Actualizar status (accept/reject)
// ======================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/matches?volunteerId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const volunteerId = searchParams.get('volunteerId');
  const needId = searchParams.get('needId');

  try {
    const matches = await prisma.match.findMany({
      where: {
        ...(volunteerId ? { volunteerId } : {}),
        ...(needId ? { needId } : {}),
      },
      include: {
        need: {
          include: {
            org: { select: { name: true, avatar: true, location: true } },
          },
        },
        volunteer: { select: { name: true, email: true, avatar: true, skills: true, location: true } },
      },
      orderBy: { score: 'desc' },
    });

    const parsed = matches.map((m) => ({
      ...m,
      need: {
        ...m.need,
        requiredSkills: JSON.parse(m.need.requiredSkills),
      },
      volunteer: {
        ...m.volunteer,
        skills: JSON.parse(m.volunteer.skills),
      },
    }));

    return NextResponse.json({ matches: parsed });
  } catch (error) {
    console.error('GET /api/matches error:', error);
    return NextResponse.json({ error: 'Error al obtener matches' }, { status: 500 });
  }
}

// PATCH /api/matches — Actualizar status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, status } = body;

    if (!matchId || !status) {
      return NextResponse.json({ error: 'matchId y status son requeridos' }, { status: 400 });
    }

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'status inválido' }, { status: 400 });
    }

    const match = await prisma.match.update({
      where: { id: matchId },
      data: { status },
    });

    return NextResponse.json({ match });
  } catch (error) {
    console.error('PATCH /api/matches error:', error);
    return NextResponse.json({ error: 'Error al actualizar match' }, { status: 500 });
  }
}
