// ======================================
// Collab.ia - Seed Data
// Datos de demo para el hackathon (Masivo y Anonimizado)
// ======================================
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando carga masiva de datos en Collab.ia...');

  // 1. ORGANIZACIONES (Agregamos una mas para dar volumen)
  const org1 = await prisma.user.upsert({
    where: { email: 'centrocultural@rivera.uy' },
    update: {},
    create: { email: 'centrocultural@rivera.uy', name: 'Centro Cultural Rivera', role: 'org', location: 'Rivera, Uruguay', bio: 'Espacio cultural dedicado a promover el arte y la cultura en la frontera.', avatar: 'CC' },
  });

  const org2 = await prisma.user.upsert({
    where: { email: 'fundacion@livramento.br' },
    update: {},
    create: { email: 'fundacion@livramento.br', name: 'Fundacao Esperanca Livramento', role: 'org', location: 'Santana do Livramento, Brasil', bio: 'Organizacao sem fins lucrativos dedicada ao apoio social.', avatar: 'FE' },
  });

  const org3 = await prisma.user.upsert({
    where: { email: 'clubdeportivo@frontera.com' },
    update: {},
    create: { email: 'clubdeportivo@frontera.com', name: 'Club Deportivo Frontera', role: 'org', location: 'Rivera, Uruguay', bio: 'Fomentamos el deporte y la inclusion en los barrios.', avatar: 'CD' },
  });

  // 2. VOLUNTARIOS ORIGINALES DE MAXI
  await prisma.user.upsert({
    where: { email: 'ana.design@gmail.com' },
    update: {},
    create: { email: 'ana.design@gmail.com', name: 'Ana Garcia', role: 'volunteer', skills: JSON.stringify(['diseno grafico', 'illustrator', 'photoshop', 'canva', 'branding']), interests: JSON.stringify(['arte', 'cultura', 'medio ambiente']), availability: 'fines de semana', location: 'Rivera, Uruguay', bio: 'Disenadora grafica con 3 anos de experiencia.', avatar: 'AG' },
  });

  await prisma.user.upsert({
    where: { email: 'carlos.sound@hotmail.com' },
    update: {},
    create: { email: 'carlos.sound@hotmail.com', name: 'Carlos Ferreira', role: 'volunteer', skills: JSON.stringify(['sonido', 'produccion musical', 'DJ', 'tecnico de audio']), interests: JSON.stringify(['musica', 'eventos', 'cultura']), availability: 'sabados y domingos', location: 'Santana do Livramento, Brasil', bio: 'Tecnico de sonido con experiencia en eventos.', avatar: 'CF' },
  });

  await prisma.user.upsert({
    where: { email: 'lucia.web@gmail.com' },
    update: {},
    create: { email: 'lucia.web@gmail.com', name: 'Lucia Martinez', role: 'volunteer', skills: JSON.stringify(['desarrollo web', 'react', 'javascript', 'diseno web']), interests: JSON.stringify(['tecnologia', 'educacion']), availability: 'entre semana por las noches', location: 'Rivera, Uruguay', bio: 'Desarrolladora front-end.', avatar: 'LM' },
  });

  // 3. CARGA MASIVA DE VOLUNTARIOS GENERICOS
  const voluntariosMasivos = [
    { email: 'martin.dj@gmail.com', name: 'Martin', role: 'volunteer', skills: JSON.stringify(['DJ open-format', 'Rekordbox', 'operacion de sonido']), interests: JSON.stringify(['Eventos', 'Cultura', 'Musica']), availability: 'fines de semana', location: 'Rivera, Uruguay', bio: 'DJ y operador de audio para movidas solidarias.', avatar: 'M' },
    { email: 'valeria.salud@gmail.com', name: 'Valeria', role: 'volunteer', skills: JSON.stringify(['kinesiologia', 'masajes terapeuticos', 'bienestar', 'salud']), interests: JSON.stringify(['Salud', 'Cuidado mayor']), availability: 'tardes', location: 'Santana do Livramento, Brasil', bio: 'Especialista en rehabilitacion.', avatar: 'V' },
    { email: 'marcos.flete@yahoo.com', name: 'Marcos', role: 'volunteer', skills: JSON.stringify(['flete', 'mecanica basica', 'transporte']), interests: JSON.stringify(['Logistica', 'Accion Social']), availability: 'mananas', location: 'Rivera, Uruguay', bio: 'Tengo camioneta disponible para mover donaciones.', avatar: 'M' },
    { email: 'thiago.video@gmail.com', name: 'Thiago', role: 'volunteer', skills: JSON.stringify(['edicion de video', 'CapCut', 'DaVinci Resolve']), interests: JSON.stringify(['Cultura', 'Redes Sociales']), availability: 'noches', location: 'Rivera, Uruguay', bio: 'Editor rapido para redes.', avatar: 'T' },
    { email: 'mariana.deporte@hotmail.com', name: 'Mariana', role: 'volunteer', skills: JSON.stringify(['entrenamiento fisico', 'futbol', 'recreacion']), interests: JSON.stringify(['Deportes', 'Juventud']), availability: 'sabados', location: 'Santana do Livramento, Brasil', bio: 'Profe de educacion fisica.', avatar: 'M' },
    { email: 'julia.cocina@gmail.com', name: 'Julia', role: 'volunteer', skills: JSON.stringify(['cocina artesanal', 'pizzas', 'guisos']), interests: JSON.stringify(['Comedores', 'Accion Social']), availability: 'domingos', location: 'Santana do Livramento, Brasil', bio: 'Cocinera para ollas populares.', avatar: 'J' },
    { email: 'pedro.elec@gmail.com', name: 'Pedro', role: 'volunteer', skills: JSON.stringify(['electricidad', 'mantenimiento', 'armado']), interests: JSON.stringify(['Infraestructura', 'Barrios']), availability: 'sabados', location: 'Rivera, Uruguay', bio: 'Electricista matriculado.', avatar: 'P' },
    { email: 'diego.redes@yahoo.com', name: 'Diego', role: 'volunteer', skills: JSON.stringify(['redes', 'armado de PC', 'hardware']), interests: JSON.stringify(['Inclusion digital', 'Educacion']), availability: 'tardes', location: 'Livramento, Brasil', bio: 'Reparo computadoras donadas.', avatar: 'D' },
    { email: 'sofia.marketing@gmail.com', name: 'Sofia', role: 'volunteer', skills: JSON.stringify(['marketing', 'redes sociales', 'comunicacion']), interests: JSON.stringify(['ONGS', 'Difusion']), availability: 'flexible', location: 'Rivera, Uruguay', bio: 'Community Manager solidaria.', avatar: 'S' },
    { email: 'roberto.contable@hotmail.com', name: 'Roberto', role: 'volunteer', skills: JSON.stringify(['contabilidad', 'excel', 'finanzas']), interests: JSON.stringify(['Gestion', 'Transparencia']), availability: 'mananas', location: 'Livramento, Brasil', bio: 'Ayudo a ONGs con sus planillas.', avatar: 'R' }
  ];

  for (const vol of voluntariosMasivos) {
    await prisma.user.upsert({
      where: { email: vol.email },
      update: {},
      create: vol,
    });
  }

  // 4. NECESIDADES MASIVAS (Para testear la IA a fondo)
  const necesidadesMasivas = [
    { id: 'need-001', orgId: org1.id, title: 'Disenador para flyer de evento benefico', description: 'Necesitamos un disenador grafico para crear un flyer para nuestro evento benefico el proximo sabado en Rivera.', requiredSkills: JSON.stringify(['diseno grafico', 'canva', 'illustrator']), requiredAvailability: 'fines de semana', location: 'Rivera, Uruguay', status: 'open' },
    { id: 'need-002', orgId: org1.id, title: 'DJ para cierre de festival', description: 'Precisamos um DJ ou sonoplasta para tocar no encerramento da nossa feira cultural.', requiredSkills: JSON.stringify(['DJ open-format', 'sonido']), requiredAvailability: 'fines de semana', location: 'Rivera, Uruguay', status: 'open' },
    { id: 'need-003', orgId: org2.id, title: 'Jornada de bienestar para abuelos', description: 'Buscamos especialistas em massagens terapeuticas para uma tarde com os idosos.', requiredSkills: JSON.stringify(['kinesiologia', 'masajes', 'salud']), requiredAvailability: 'tardes', location: 'Santana do Livramento, Brasil', status: 'open' },
    { id: 'need-004', orgId: org2.id, title: 'Logistica de alimentos', description: 'Necesitamos alguien con vehiculo (flete) para buscar una donacion de alimentos.', requiredSkills: JSON.stringify(['flete', 'transporte', 'logistica']), requiredAvailability: 'mananas', location: 'Rivera, Uruguay', status: 'open' },
    { id: 'need-005', orgId: org3.id, title: 'Arbitro para torneo infantil', description: 'Precisamos de um professor de educacao fisica ou arbitro para um torneio de futebol infantil.', requiredSkills: JSON.stringify(['deportes', 'futbol', 'recreacion']), requiredAvailability: 'sabados', location: 'Santana do Livramento, Brasil', status: 'open' },
    { id: 'need-006', orgId: org3.id, title: 'Arreglo electrico en vestuarios', description: 'Necesitamos un electricista que nos de una mano para arreglar las luces del club.', requiredSkills: JSON.stringify(['electricidad', 'mantenimiento']), requiredAvailability: 'sabados', location: 'Rivera, Uruguay', status: 'open' },
    { id: 'need-007', orgId: org1.id, title: 'Edicion de video para campana', description: 'Alguien que maneje CapCut o DaVinci para editarnos un video corto de la ONG.', requiredSkills: JSON.stringify(['edicion de video', 'CapCut']), requiredAvailability: 'noches', location: 'Rivera, Uruguay', status: 'open' },
    { id: 'need-008', orgId: org2.id, title: 'Ayuda con planillas de gastos', description: 'Precisamos de um voluntario com conhecimento em Excel para organizar nossas contas.', requiredSkills: JSON.stringify(['contabilidad', 'excel']), requiredAvailability: 'mananas', location: 'Santana do Livramento, Brasil', status: 'open' },
    { id: 'need-009', orgId: org2.id, title: 'Cocineros para olla popular', description: 'Buscamos pessoas que saibam fazer guisos e comida em grande quantidade para este domingo.', requiredSkills: JSON.stringify(['cocina', 'guisos']), requiredAvailability: 'domingos', location: 'Santana do Livramento, Brasil', status: 'open' },
    { id: 'need-010', orgId: org3.id, title: 'Reciclaje de computadoras', description: 'Precisamos de alguem de redes ou hardware para formatar PCs doados.', requiredSkills: JSON.stringify(['redes', 'hardware', 'armado de PC']), requiredAvailability: 'tardes', location: 'Livramento, Brasil', status: 'open' }
  ];

  for (const need of necesidadesMasivas) {
    await prisma.need.upsert({
      where: { id: need.id },
      update: {},
      create: need,
    });
  }

  console.log('Seed masivo completado con exito!');
  console.log('Total de registros: 3 Organizaciones | 13 Voluntarios | 10 Necesidades');
  console.log('Emails de ONGs para probar:');
  console.log(' - centrocultural@rivera.uy');
  console.log(' - fundacion@livramento.br');
  console.log(' - clubdeportivo@frontera.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });