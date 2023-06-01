import { View, Text, Button, TextInput, FlatList, TouchableOpacityBase, TouchableOpacity} from 'react-native'
import React, { useEffect, useState } from 'react'
import { addDoc, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Entypo } from '@expo/vector-icons';

export interface Todo {
    title: string;
    done: boolean;
    id: string;
}
const List = ({ navigation }: any) => {
    const [todos, setTodos] = useState<any[]>([]);
    const [todo, setTodo] = useState('');

    useEffect(() => {
        const todoRef = collection(db, 'todos');

        const subscriber = onSnapshot(todoRef, {
            
            next: (snapshot) => {
                const todos: Todo[] = [];
                snapshot.docs.forEach((doc) => {
                    todos.push({
                        id: doc.id,
                        ...doc.data()
                    } as Todo)
                });
                setTodos(todos)
            },
        })
        return () => subscriber();
    }, []);
    
    const addTodo = async() => {
        const doc = await addDoc(collection(db, 'todos'), { title: todo, done: false });
        setTodo('');
    }

    const renderTodo = ({ item }: any) => {
        const ref = doc(db, `todos/${item.id}`)
        const toggleDone = async () => {
            updateDoc(ref, {done: !item.done});
        }

        const deleteItem = async () => {}

        return (
            <View>
                <TouchableOpacity onPress={toggleDone}>
                    {item.done && <Ionicons name='md-checkmark-circle' />}
                    {!item.done && <Entypo name='circle' />}
                    <Text>{item.title}</Text>
                </TouchableOpacity>
            </View>
        )
    };

    return (
    <View style={styles.container}>
        <View style={styles.form}>
            <TextInput style={styles.input} placeholder='Add todo' onChangeText={(text: string) => setTodo(text)} value={todo}></TextInput>
            <Button onPress={addTodo} title="Add Todo" disabled={todo ===''} />
        </View>
        { todos.length > 0 && (
            <View>
          <FlatList data={todos} renderItem={(item) => renderTodo(item)} keyExtractor={(todo: Todo) => todo.id} />
          </View>
        )}
        <View>
            {todos.map((todo) => (
                <Text key={todo.id}>{todo.title}</Text>
            ))}
        </View>
    </View>
    )
}

export default List

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
    },
    form: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 40,
    },
    todoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});