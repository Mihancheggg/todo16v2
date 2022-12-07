import { addTaskAC, fetchTasksTC, removeTaskAC, tasksReducer, TasksStateType, updateTaskAC } from './tasks-reducer';
import { TaskPriorities, TaskStatuses } from '../../api/todolists-api';
import { addTodolistAC, removeTodolistAC, setTodolistsAC } from './todolists-reducer';

let startState: TasksStateType = {};
beforeEach(() => {
    startState = {
        'todolistId1': [
            {
                id: '1', title: 'CSS', status: TaskStatuses.New, todoListId: 'todolistId1', description: '',
                startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low
            },
            {
                id: '2', title: 'JS', status: TaskStatuses.Completed, todoListId: 'todolistId1', description: '',
                startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low
            },
            {
                id: '3', title: 'React', status: TaskStatuses.New, todoListId: 'todolistId1', description: '',
                startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low
            }
        ],
        'todolistId2': [
            {
                id: '1', title: 'bread', status: TaskStatuses.New, todoListId: 'todolistId2', description: '',
                startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low
            },
            {
                id: '2', title: 'milk', status: TaskStatuses.Completed, todoListId: 'todolistId2', description: '',
                startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low
            },
            {
                id: '3', title: 'tea', status: TaskStatuses.New, todoListId: 'todolistId2', description: '',
                startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low
            }
        ]
    }
});

test('correct task should be deleted from correct array', () => {
    const action = removeTaskAC({taskId: '2', todolistId: 'todolistId2'});

    const endState = tasksReducer(startState, action);

    expect(endState['todolistId1'].length).toBe(3);
    expect(endState['todolistId2'].length).toBe(2);
    expect(endState['todolistId2'].every(el => el.id !== '2')).toBeTruthy();
});

test('correct task should be added to correct array', () => {
    let task = {
        id: '4', title: 'juice', status: TaskStatuses.New, todoListId: 'todolistId2', description: '',
        startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low
    };

    const action = addTaskAC({task: task});

    const endState = tasksReducer(startState, action)

    expect(endState['todolistId1'].length).toBe(3);
    expect(endState['todolistId2'].length).toBe(4);
    expect(endState['todolistId2'][0].id).toBeDefined();
    expect(endState['todolistId2'][0].title).toBe('juice');
    expect(endState['todolistId2'][0].status).toBe(TaskStatuses.New);
});

test('status of specified task should be changed', () => {
    const action = updateTaskAC({taskId: '2', model: {status: TaskStatuses.New}, todolistId: 'todolistId2'});

    const endState = tasksReducer(startState, action)

    expect(endState['todolistId1'][1].status).toBe(TaskStatuses.Completed);
    expect(endState['todolistId2'][1].status).toBe(TaskStatuses.New);
});

test('title of specified task should be changed', () => {
    const action = updateTaskAC({taskId: '2', model: {title: 'fish'}, todolistId: 'todolistId2'});

    const endState = tasksReducer(startState, action)

    expect(endState['todolistId1'][1].title).toBe('JS');
    expect(endState['todolistId2'][1].title).toBe('fish');
});

test('new array should be added when new todolist is added', () => {
    const action = addTodolistAC({todolist: {id: 'todolistId3', title: 'new todolist', addedDate: '', order: 0}})

    const endState = tasksReducer(startState, action)

    const keys = Object.keys(endState);

    expect(keys.length).toBe(3)
    expect(endState['todolistId3']).toBeDefined();
    expect(endState['todolistId3']).toEqual([]);
});

test('property with todolistId should be deleted', () => {
    const action = removeTodolistAC({id: 'todolistId2'});

    const endState = tasksReducer(startState, action);

    let keys = Object.keys(endState);

    expect(keys.length).toBe(1);
    expect(endState['todolistId2']).not.toBeDefined();
});

test('empty array should be added when we set todolists', () => {
    const action = setTodolistsAC({
        todolists: [
            {id: '1', title: 'title 1', order: 0, addedDate: ''},
            {id: '2', title: 'title 2', order: 0, addedDate: ''}
        ]
    });

    const endState = tasksReducer({}, action);

    const keys = Object.keys(endState);

    expect(keys.length).toBe(2);
    expect(endState['1']).toBeDefined();
    expect(endState['2']).toBeDefined();
});

test('tasks should be added for todolist', () => {
    const action = fetchTasksTC.fulfilled({
        tasks: startState['todolistId1'],
        todolistId: 'todolistId1'
    }, '', 'todolistId1')

    const endState = tasksReducer({'todolistId1': [], 'todolistId2': []}, action)

    expect(endState['todolistId1'].length).toBe(3);
    expect(endState['todolistId2'].length).toBe(0);
})
