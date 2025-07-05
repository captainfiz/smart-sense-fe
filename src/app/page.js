'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateToken, saveToken } from '@/utils/auth';

export default function Home() {
  const [employeeCode, setEmployeeCode] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    const token = generateToken(employeeCode);
    saveToken(token);
    router.push('/homepage');
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Enter Employee Code</h2>
      <input
        type="text"
        value={employeeCode}
        onChange={(e) => setEmployeeCode(e.target.value)}
        placeholder="Employee Code"
        style={{ marginRight: 10 }}
      />
      <button onClick={handleSubmit}>Generate Token & Proceed</button>
    </div>
  );
}
