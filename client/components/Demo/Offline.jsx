import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { useFilamentMutation } from '../../../filament';

import {
  getTodosQuery,
  addTodoMutation,
  deleteTodoMutation,
  updateTodoMutation,
} from '../../query';

import UpdateTodo from './UpdateTodo';
import TodoList from './TodoList';
import AddTodo from './AddTodo';

const Offline = () => {
  const [updatedText, setUpdated] = useState('');
  const [todoIdToUpdate, setTodoIdToUpdate] = useState(null);
  const [wantsUpdate, setWantsUpdate] = useState(false);
  const [todos, setTodos] = useState([]);
  const [networkMode, setNetworkMode] = useState('');

  const [callAddTodoMutation, addTodoResponse] = useFilamentMutation(
    addTodoMutation,
    () => {
      console.log(addTodoResponse.addTodo);
      setTodos([...todos, addTodoResponse.addTodo]);
    }
  );
  const [callDeleteTodoMutation] = useFilamentMutation(deleteTodoMutation);
  const [callUpdateTodoMutation] = useFilamentMutation(updateTodoMutation);

  useEffect(() => {
    if (navigator.onLine) setNetworkMode('Online');
    else setNetworkMode('Offline');
  }, [navigator.onLine]);

  // ComponentDidMount | fetch all todos from database
  useEffect(() => {
    axios
      .post('/graphql', { query: getTodosQuery })
      .then((response) => setTodos(response.data.data.todos));
  }, []);

  const handleAddTodo = (value) => {
    if (!value) return;
    callAddTodoMutation(value);
  };

  const handleDelete = async (id) => {
    callDeleteTodoMutation(id);
    const filteredTodos = todos.filter((item) => item.id !== id);
    setTodos(filteredTodos);
  };

  const handleUpdate = (id, text) => {
    setWantsUpdate(true);
    setTodoIdToUpdate(id);
    setUpdated(text);
  };

  const handleUpdateChange = (e) => setUpdated(e.target.value);

  const handleUpdateTodo = async () => {
    callUpdateTodoMutation(todoIdToUpdate, updatedText);

    const updatedTodos = todos.map((todo) =>
      todo.id === todoIdToUpdate ? { ...todo, text: updatedText } : todo
    );

    setTodos(updatedTodos);
    setWantsUpdate(false);
    setTodoIdToUpdate(null);
  };

  return (
    <div className='offlineMainDiv'>
      {/* <h1>Currently in: {networkMode} mode</h1> */}
      <h1>Offline Mode Caching</h1>
      <AddTodo handleAddTodo={handleAddTodo} />

      {wantsUpdate && (
        <UpdateTodo
          handleUpdateTodo={handleUpdateTodo}
          updatedText={updatedText}
          handleUpdateChange={handleUpdateChange}
        />
      )}

      <TodoList
        todos={todos}
        handleDelete={handleDelete}
        handleUpdate={handleUpdate}
      />

      <div>
        <h3>Set Browser Tab to Offline</h3>
        <ul>
          <li>Open Dev Tools</li>
          <li>Go to Network Tab</li>
          <li>Look for Dropdown 'Online'</li>
          <li>Set to 'Offline'</li>
          <li>Make a change to the Todo List</li>
          <li>Nothing will show up, but it has been added to the cache</li>
          <li>Check this by going to the dev console and typing 'sessionStorage'</li>
          <li>Set Network back to 'Online'</li>
          <li>The new todo will show up in the list!</li>
        </ul>
      </div>

      <Example />
      <Example2 />
    </div>
  );
};

const Example = () => {
  const [call, data] = useFilamentMutation(addTodoMutation, () => { });

  return (
    <div className='makeMutation'>

      <pre>{data && JSON.stringify(data.addTodo, 2, null)}</pre>
    </div>
  );
};

const Example2 = () => {
  const [call, data] = useFilamentMutation(addTodoMutation, () => {
    console.log('2', data.addTodo);
  });

  return (
    <div className='mutate'>
      <pre>{data && JSON.stringify(data.addTodo, 2, null)}</pre>


    </div>
  );
};

export default Offline;
