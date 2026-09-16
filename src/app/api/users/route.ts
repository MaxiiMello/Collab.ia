// ======================================
// POST /api/users — Crear o buscar usuario (fake auth)
// GET  /api/users — Listar voluntarios
// ======================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runMatching } from '@/lib/matching';

// GET /api/users?role=volunteer
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');

  try {
    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    const parsed = users.map((u) => ({
      ...u,
      skills: JSON.parse(u.skills),
      interests: JSON.parse(u.interests),
    }));

    return NextResponse.json({ users: parsed });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

// POST /api/users — Upsert user (login/register simplificado)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role, skills, interests, availability, location, bio, avatar } = body;

    if (!email || !name || !role) {
      return NextResponse.json(
        { error: 'email, name y role son requeridos' },
        { status: 400 }
      );
    }

    if (!['volunteer', 'org'].includes(role)) {
      return NextResponse.json(
        { error: 'role debe ser "volunteer" o "org"' },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        skills: skills ? JSON.stringify(skills) : undefined,
        interests: interests ? JSON.stringify(interests) : undefined,
        availability: availability ?? undefined,
        location: location ?? undefined,
        bio: bio ?? undefined,
        avatar: avatar ?? undefined,
      },
      create: {
        email,
        name,
        role,
        skills: JSON.stringify(skills || []),
        interests: JSON.stringify(interests || []),
        availability: availability || null,
        location: location || null,
        bio: bio || null,
        avatar: avatar || null,
      },
    });

    // Si es voluntario y tiene habilidades, re-ejecutar matching retroactivo
    // para que aparezca en necesidades que ya existían antes de su registro.
    if (user.role === 'volunteer' && skills && skills.length > 0) {
      try {
        const openNeeds = await prisma.need.findMany({ where: { status: 'open' } });
        for (const need of openNeeds) {
          await runMatching(need.id, 5);
        }
        console.log(`🔄 Re-matching retroactivo para ${user.email} en ${openNeeds.length} necesidades`);
      } catch (matchErr) {
        console.error('Error en matching retroactivo:', matchErr);
        // No interrumpir el flujo si el matching falla
      }
    }

    return NextResponse.json({
      user: {
        ...user,
        skills: JSON.parse(user.skills),
        interests: JSON.parse(user.interests),
      },
    });
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json({ error: 'Error al crear/actualizar usuario' }, { status: 500 });
  }
}
