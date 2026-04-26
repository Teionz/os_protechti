import { getDb } from './server/db.ts';
import { equipments } from './drizzle/schema.ts';

const db = await getDb();
if (!db) {
  console.error('❌ Banco de dados não disponível');
  process.exit(1);
}

try {
  const result = await db.delete(equipments);
  console.log('✅ Todos os equipamentos foram deletados');
  process.exit(0);
} catch (error) {
  console.error('❌ Erro ao deletar:', error.message);
  process.exit(1);
}
