import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'

// Jediné místo, kde se migrace v produkci pouštějí — proto `force`.
export async function POST() {
  try {
    await initDb(true)
    return NextResponse.json({ success: true, message: 'Database initialized' })
  } catch (error) {
    console.error('DB init error:', error)
    return NextResponse.json({ error: 'Failed to initialize database', details: String(error) }, { status: 500 })
  }
}
