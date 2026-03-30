import { collection, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../../src/lib/firebase/firebaseService';


export const validarCodigoAcesso = async (codigo: string): Promise<{
    valido: boolean;
    tipo?: string;
    erro?: string
}> => {
    try {
        console.log('🔍 Validando código:', codigo); // DEBUG

        // Normalizar o código (remover espaços, uppercase)
        const codigoNormalizado = codigo.trim().toUpperCase();
        console.log('📝 Código normalizado:', codigoNormalizado); // DEBUG

        const q = query(
            collection(db, 'codigos_acesso'),
            where('codigo', '==', codigoNormalizado),
            where('ativo', '==', true)
        );

        console.log('🔥 Executando query...'); // DEBUG
        const snapshot = await getDocs(q);

        console.log('📊 Documentos encontrados:', snapshot.size); // DEBUG
        console.log('📄 Documentos:', snapshot.docs.map(d => d.data())); // DEBUG

        if (snapshot.empty) {
            console.log('❌ Nenhum documento encontrado'); // DEBUG

            // Verificar se existe código inativo (para debug)
            const qInativos = query(
                collection(db, 'codigos_acesso'),
                where('codigo', '==', codigoNormalizado)
            );
            const snapInativos = await getDocs(qInativos);
            console.log('📊 Códigos inativos encontrados:', snapInativos.size);

            return { valido: false, erro: 'Código de acesso inválido' };
        }

        const codigoDoc = snapshot.docs[0];
        const dados = codigoDoc.data();

        console.log('✅ Documento encontrado:', dados); // DEBUG

        // Verificar expiração
        if (dados.validoAte && dados.validoAte.toDate() < new Date()) {
            console.log('⏰ Código expirado'); // DEBUG
            return { valido: false, erro: 'Código de acesso expirado' };
        }

        // Verificar limite de usos
        if (dados.usosAtuais >= dados.usosMaximos) {
            console.log('🚫 Limite atingido:', dados.usosAtuais, '/', dados.usosMaximos); // DEBUG
            await updateDoc(doc(db, 'codigos_acesso', codigoDoc.id), { ativo: false });
            return { valido: false, erro: 'Código de acesso atingiu o limite de usos' };
        }

        // Incrementar contador de usos
        await updateDoc(doc(db, 'codigos_acesso', codigoDoc.id), {
            usosAtuais: increment(1)
        });

        console.log('✅ Código validado com sucesso! Tipo:', dados.tipo); // DEBUG

        return { valido: true, tipo: dados.tipo };

    } catch (error) {
        console.error('💥 Erro ao validar código:', error); // DEBUG
        return { valido: false, erro: 'Erro ao validar código' };
    }
};