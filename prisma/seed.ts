// ======================================
// Collab.ia — Seed Data
// Datos de demo para el hackathon
// ======================================
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Collab.ia database...');

  // ---- Organizaciones ----
  const org1 = await prisma.user.upsert({
    where: { email: 'centrocultural@rivera.uy' },
    update: {},
    create: {
      email: 'centrocultural@rivera.uy',
      name: 'Centro Cultural Rivera',
      role: 'org',
      location: 'Rivera, Uruguay',
      bio: 'Espacio cultural dedicado a promover el arte y la cultura en la frontera.',
      avatar: '🏛️',
    },
  });

  const org2 = await prisma.user.upsert({
    where: { email: 'fundacion@livramento.br' },
    update: {},
    create: {
      email: 'fundacion@livramento.br',
      name: 'Fundação Esperança Livramento',
      role: 'org',
      location: 'Santana do Livramento, Brasil',
      bio: 'Organização sem fins lucrativos dedicada ao apoio social.',
      avatar: '🤝',
    },
  });

  // ---- Voluntarios ----
  const v1 = await prisma.user.upsert({
    where: { email: 'ana.design@gmail.com' },
    update: {},
    create: {
      email: 'ana.design@gmail.com',
      name: 'Ana García',
      role: 'volunteer',
      skills: JSON.stringify(['diseño gráfico', 'illustrator', 'photoshop', 'canva', 'branding']),
      interests: JSON.stringify(['arte', 'cultura', 'medio ambiente']),
      availability: 'fines de semana',
      location: 'Rivera, Uruguay',
      bio: 'Diseñadora gráfica con 3 años de experiencia. Me encanta apoyar causas sociales.',
      avatar: '🎨',
    },
  });

  const v2 = await prisma.user.upsert({
    where: { email: 'carlos.sound@hotmail.com' },
    update: {},
    create: {
      email: 'carlos.sound@hotmail.com',
      name: 'Carlos Ferreira',
      role: 'volunteer',
      skills: JSON.stringify(['sonido', 'producción musical', 'DJ', 'técnico de audio']),
      interests: JSON.stringify(['música', 'eventos', 'cultura']),
      availability: 'sábados y domingos',
      location: 'Santana do Livramento, Brasil',
      bio: 'Técnico de sonido con experiencia en eventos y festivales.',
      avatar: '🎵',
    },
  });

  const v3 = await prisma.user.upsert({
    where: { email: 'lucia.web@gmail.com' },
    update: {},
    create: {
      email: 'lucia.web@gmail.com',
      name: 'Lucía Martínez',
      role: 'volunteer',
      skills: JSON.stringify(['desarrollo web', 'react', 'javascript', 'diseño web', 'wordpress']),
      interests: JSON.stringify(['tecnología', 'educación', 'social']),
      availability: 'entre semana por las noches',
      location: 'Rivera, Uruguay',
      bio: 'Desarrolladora front-end. Quiero usar mis habilidades para el bien.',
      avatar: '💻',
    },
  });

  const v4 = await prisma.user.upsert({
    where: { email: 'pedro.logistica@yahoo.com' },
    update: {},
    create: {
      email: 'pedro.logistica@yahoo.com',
      name: 'Pedro Souza',
      role: 'volunteer',
      skills: JSON.stringify(['logística', 'organización de eventos', 'armado de estructuras', 'transporte']),
      interests: JSON.stringify(['eventos', 'comunidad', 'deporte']),
      availability: 'cualquier día con aviso previo',
      location: 'Santana do Livramento, Brasil',
      bio: 'Coordinador de eventos con 5 años de experiencia en festivales y ferias.',
      avatar: '📦',
    },
  });

  const v5 = await prisma.user.upsert({
    where: { email: 'sofia.foto@gmail.com' },
    update: {},
    create: {
      email: 'sofia.foto@gmail.com',
      name: 'Sofía Torres',
      role: 'volunteer',
      skills: JSON.stringify(['fotografía', 'video', 'edición de video', 'redes sociales', 'contenido digital']),
      interests: JSON.stringify(['arte', 'comunicación', 'cultura']),
      availability: 'fines de semana',
      location: 'Rivera, Uruguay',
      bio: 'Fotógrafa y videoasta freelance. Me apasiona documentar la cultura local.',
      avatar: '📷',
    },
  });

  // ---- Needs de demo ----
  await prisma.need.upsert({
    where: { id: 'demo-need-001' },
    update: {},
    create: {
      id: 'demo-need-001',
      orgId: org1.id,
      title: 'Diseñador para flyer de evento benéfico',
      description: 'Necesitamos un diseñador gráfico para crear un flyer para nuestro evento benéfico el próximo sábado en Rivera.',
      requiredSkills: JSON.stringify(['diseño gráfico', 'canva', 'photoshop', 'illustrator']),
      requiredAvailability: 'este sábado',
      location: 'Rivera, Uruguay',
      status: 'open',
    },
  });

  console.log('✅ Seed completado!');
  console.log(`   - 2 organizaciones creadas`);
  console.log(`   - 5 voluntarios creados`);
  console.log(`   - 1 need de demo creada`);
  console.log('\n📧 Emails para probar:');
  console.log('   Org:        centrocultural@rivera.uy');
  console.log('   Org:        fundacion@livramento.br');
  console.log('   Voluntario: ana.design@gmail.com');
  console.log('   Voluntario: carlos.sound@hotmail.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
