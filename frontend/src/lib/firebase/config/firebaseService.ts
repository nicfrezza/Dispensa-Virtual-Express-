import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
    orderBy,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import { firebaseConfig } from '../../config';
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tasksCollection = collection(db, 'tasks');

export interface Task {
    id?: string;
    title: string;
    status: 'afazer' | 'fazendo' | 'feito';
    userId: string;
    createdAt?: any;
    dueDate: string;
    description?: string;
    link?: string;
    priority?: 'low' | 'medium' | 'high';
}

export const addTask = async (
    title: string,
    status: 'afazer' | 'fazendo' | 'feito',
    userId: string,
    description: string,
    link: string,
    priority: 'low' | 'medium' | 'high',
    dueDate: string,
    projectId: string
) => {
    try {
        const docRef = await addDoc(collection(db, 'tasks'), {
            title,
            status,
            userId,
            description: description || '',
            link: link || '',
            priority: priority || 'low',
            dueDate: dueDate || '',
            projectId,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Erro no serviço Firebase:", error);
        throw error;
    }
};

export const updateTaskStatus = async (taskId: string, newStatus: 'afazer' | 'fazendo' | 'feito') => {
    try {
        const taskDoc = doc(db, 'tasks', taskId);
        await updateDoc(taskDoc, {
            status: newStatus
        });
        console.log('Status da tarefa atualizado');
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        throw error;
    }
};

export const updateTask = async (taskId: string, updatedData: Partial<Task>) => {
    try {
        const taskDoc = doc(db, 'tasks', taskId);
        const { id, ...dataToUpdate } = updatedData as any;

        await updateDoc(taskDoc, dataToUpdate);
        console.log('Tarefa atualizada com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        throw error;
    }
};

export const deleteTask = async (taskId: string) => {
    try {
        const taskDoc = doc(db, 'tasks', taskId);
        await deleteDoc(taskDoc);
        console.log('Tarefa deletada');
    } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
        throw error;
    }
};

export const subscribeToUserTasks = (
    userId: string,
    projectId: string,
    callback: (tasks: Task[]) => void) => {
    const q = query(
        tasksCollection,
        where('userId', '==', userId),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks: Task[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        } as Task));

        callback(tasks);
    }, (error) => {
        console.error("Erro ao observar tarefas do projeto:", error);
    })

    return unsubscribe;
};

export const subscribeToTasks = (callback: (tasks: Task[]) => void) => {
    const q = query(tasksCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks: Task[] = [];
        snapshot.forEach((doc) => {
            tasks.push({
                id: doc.id,
                ...doc.data()
            } as Task);
        });
        callback(tasks);
    }, (error) => {
        console.error('Erro ao observar tarefas:', error);
    });

    return unsubscribe;
};

export const createProject = async (name: string, ownerId: string) => {
    return await addDoc(collection(db, 'projects'), {
        name,
        ownerId,
        createdAt: serverTimestamp()
    });
};


export const subscribeToProjects = (userId: string, callback: (projects: any[]) => void) => {
    const q = query(collection(db, 'projects'), where('ownerId', '==', userId));
    return onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(projects);
    });
};

export const subscribeToProjectTasks = (
    userId: string,
    projectId: string,
    callback: (tasks: Task[]) => void
) => {
    const q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('projectId', '==', projectId)
    );

    return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Task[];

        if (typeof callback === 'function') {
            callback(tasks);
        }
    }, (error) => {
        console.error("Erro no Snapshot:", error);
    });
};

export { db };