'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestPage() {
  const [users, setUsers] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    testConnection()
  }, [])

  async function testConnection() {
    const supabase = createClient()
    
    // Test 1: Get users count
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
    
    console.log('Test result:', { data, error, count })
    
    if (error) {
      setError(error.message)
    } else {
      setUsers(data || [])
    }
  }

  return (
    <div className="p-8">
      <h1>Supabase Connection Test</h1>
      {error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : (
        <p style={{ color: 'green' }}>✅ Connected! Found {users.length} users</p>
      )}
      <pre className="mt-4 bg-gray-100 p-4 rounded">
        {JSON.stringify(users, null, 2)}
      </pre>
    </div>
  )
}