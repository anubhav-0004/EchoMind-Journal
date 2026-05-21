import 'dotenv/config'
import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  const email = process.argv[2]
  if (!email) {
    console.error('Usage: npx tsx src/scripts/makeAdmin.ts <email>')
    process.exit(1)
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  })

  console.log(`${user.displayName} (${user.email}) is now ADMIN`)
  await prisma.$disconnect()
}

main().catch(console.error)