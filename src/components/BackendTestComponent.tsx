import React, { useState } from 'react';

interface TestResult {
  test: string;
  status: 'SUCCESS' | 'FAILED' | 'ERROR';
  data: any;
}

export const BackendTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = [];

    // Test 1: Health Check
    try {
      const healthResponse = await fetch('https://oxitrans-backend.onrender.com/api/health');
      const healthData = await healthResponse.json();
      results.push({
        test: 'Health Check',
        status: healthResponse.ok ? 'SUCCESS' as const : 'FAILED' as const,
        data: healthData
      });
    } catch (error) {
      results.push({
        test: 'Health Check',
        status: 'ERROR' as const,
        data: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 2: Cargos
    try {
      const cargosResponse = await fetch('https://oxitrans-backend.onrender.com/api/cargos');
      const cargosData = await cargosResponse.json();
      results.push({
        test: 'Cargos Endpoint',
        status: cargosResponse.ok ? 'SUCCESS' as const : 'FAILED' as const,
        data: cargosData
      });
    } catch (error) {
      results.push({
        test: 'Cargos Endpoint',
        status: 'ERROR' as const,
        data: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 3: Regionales
    try {
      const regionalesResponse = await fetch('https://oxitrans-backend.onrender.com/api/regionales');
      const regionalesData = await regionalesResponse.json();
      results.push({
        test: 'Regionales Endpoint',
        status: regionalesResponse.ok ? 'SUCCESS' as const : 'FAILED' as const,
        data: regionalesData
      });
    } catch (error) {
      results.push({
        test: 'Regionales Endpoint',
        status: 'ERROR' as const,
        data: error instanceof Error ? error.message : String(error)
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="p-4 bg-gray-100 m-4 rounded">
      <h2 className="text-xl font-bold mb-4">🔧 Backend Connectivity Test</h2>
      
      <button 
        onClick={runTests}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Run Backend Tests'}
      </button>

      {testResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
          {testResults.map((result, index) => (
            <div key={index} className="mb-3 p-3 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{result.test}:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  result.status === 'SUCCESS' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.status}
                </span>
              </div>
              <pre className="bg-gray-50 p-2 rounded text-sm overflow-auto max-h-32">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
