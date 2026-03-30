import { useEffect, useState } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase/firebaseService';



export const DebugFirestore = () => {
    const [resultado, setResultado] = useState('');

    const verificarTudo = async () => {
        let logs = ['=== VERIFICAÇÃO COMPLETA ===\n'];

        const collectionsParaTestar = [
            'reclamacoes'
        ];

        for (const nome of collectionsParaTestar) {
            try {
                const snap = await getDocs(query(collection(db, nome), limit(3)));
                logs.push(`📁 ${nome}: ${snap.size} docs`);

                snap.forEach(d => {
                    const data = d.data();
                    logs.push(`   └─ ${d.id}: ${data.nomeEmpresa || data.dadosEmpresa?.nomeEmpresa || 'sem nome'}`);
                });
            } catch (e: any) {
                logs.push(`❌ ${nome}: ${e.message}`);
            }
        }

        setResultado(logs.join('\n'));
        console.log(logs.join('\n'));
    };

    return (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-xl border max-w-lg w-full z-50">
            <h3 className="font-bold mb-2">🔍 Debug Collections</h3>
            <button
                onClick={verificarTudo}
                className="bg-emerald-600 text-white px-4 py-2 rounded mb-2 w-full"
            >
                Verificar Todas Collections
            </button>
            <pre className="bg-gray-100 p-2 rounded text-xs h-64 overflow-y-auto whitespace-pre-wrap">
                {resultado || 'Clique no botão para verificar...'}
            </pre>
        </div>
    );
};


