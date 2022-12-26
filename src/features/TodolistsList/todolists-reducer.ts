import { todolistsAPI, TodolistType } from '../../api/todolists-api'
import { RequestStatusType, setAppStatusAC } from '../../app/app-reducer'
import { fetchTasksTC } from './tasks-reducer';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { handleServerNetworkError } from '../../utils/error-utils';

const initialState: Array<TodolistDomainType> = []

export const fetchTodolistsTC = createAsyncThunk('toDoLists/fetchToDoLists', async (param, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.getTodolists()
        thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
        res.data.forEach(tl => {
            thunkAPI.dispatch(fetchTasksTC(tl.id))
        })
        return ({todolists: res.data})
    } catch (err: any) {
        const error: AxiosError = err
        handleServerNetworkError(error, thunkAPI.dispatch)
        return thunkAPI.rejectWithValue({errors: [error.message]})
    }
})

export const removeTodolistTC = createAsyncThunk('toDoLists/removeToDoList', async (param: { todolistId: string }, thunkAPI) => {
    //изменим глобальный статус приложения, чтобы вверху полоса побежала
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
    thunkAPI.dispatch(changeTodolistEntityStatusAC({id: param.todolistId, status: 'loading'}))
    try {
        await todolistsAPI.deleteTodolist(param.todolistId)
        //thunkAPI.dispatch(removeTodolistAC({id: param.todolistId}))
        //скажем глобально приложению, что асинхронная операция завершена
        thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
        return ({id: param.todolistId})
    } catch (err: any) {
        const error: AxiosError = err
        handleServerNetworkError(error, thunkAPI.dispatch)
        return thunkAPI.rejectWithValue({errors: [error.message]})
    }
})

export const addTodolistTC = createAsyncThunk('toDoLists/addToDoList', async (param: { title: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.createTodolist(param.title)
        //thunkAPI.dispatch(addTodolistAC({todolist: res.data.data.item}))
        thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
        return ({todolist: res.data.data.item})
    } catch (err: any) {
        const error: AxiosError = err
        handleServerNetworkError(error, thunkAPI.dispatch)
        return thunkAPI.rejectWithValue({errors: [error.message]})
    }
})

export const changeTodolistTitleTC = createAsyncThunk('toDoLists/changeToDoListTitle', async (param: { id: string, title: string }, thunkAPI) => {
    try {
        await todolistsAPI.updateTodolist(param.id, param.title)
        return ({id: param.id, title: param.title})
    } catch (err: any) {
        const error: AxiosError = err
        handleServerNetworkError(error, thunkAPI.dispatch)
        return thunkAPI.rejectWithValue({errors: [error.message]})
    }
})

const slice = createSlice({
    name: 'todolists',
    initialState: initialState,
    reducers: {
        /*removeTodolistAC(state, action: PayloadAction<{ id: string }>) {
            //mutable way
            const index = state.findIndex(item => item.id === action.payload.id)
            if (index > -1) {
                state.splice(index, 1)
            }
        },*/
        /*addTodolistAC(state, action: PayloadAction<{ todolist: TodolistType }>) {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        },*/
        /*changeTodolistTitleAC(state, action: PayloadAction<{ id: string, title: string }>) {
            const index = state.findIndex(item => item.id === action.payload.id)
            state[index].title = action.payload.title
        },*/
        changeTodolistFilterAC(state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) {
            const index = state.findIndex(item => item.id === action.payload.id)
            state[index].filter = action.payload.filter
        },
        changeTodolistEntityStatusAC(state, action: PayloadAction<{ id: string, status: RequestStatusType }>) {
            const index = state.findIndex(item => item.id === action.payload.id)
            state[index].entityStatus = action.payload.status
        },
        /*setTodolistsAC(state, action: PayloadAction<{ todolists: Array<TodolistType> }>) {
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        },*/
        clearDataAC(state) {
            state = []
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        });
        builder.addCase(removeTodolistTC.fulfilled, (state, action) => {
            const index = state.findIndex(item => item.id === action.payload.id)
            if (index > -1) {
                state.splice(index, 1)
            }
        });
        builder.addCase(addTodolistTC.fulfilled, (state, action) => {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        });
        builder.addCase(changeTodolistTitleTC.fulfilled, (state, action) => {
            const index = state.findIndex(item => item.id === action.payload.id)
            state[index].title = action.payload.title
        });
    }
})

export const {
    changeTodolistFilterAC,
    changeTodolistEntityStatusAC,
    clearDataAC
} = slice.actions

export const todolistsReducer = slice.reducer/*(state: Array<TodolistDomainType> = initialState, action: TodolistsActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case 'REMOVE-TODOLIST':
            return state.filter(tl => tl.id !== action.id)
        case 'ADD-TODOLIST':
            return [{...action.todolist, filter: 'all', entityStatus: 'idle'}, ...state]

        case 'CHANGE-TODOLIST-TITLE':
            return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
        case 'CHANGE-TODOLIST-FILTER':
            return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
        case 'CHANGE-TODOLIST-ENTITY-STATUS':
            return state.map(tl => tl.id === action.id ? {...tl, entityStatus: action.status} : tl)
        case 'SET-TODOLISTS':
            return action.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        case 'CLEAR-DATA':
            return []
        default:
            return state
    }
}
*/

// thunks
/*export const fetchTodolistsTC_ = () => {
    return (dispatch: any) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(setTodolistsAC({todolists: res.data}))
                dispatch(setAppStatusAC({status: 'succeeded'}))
                return (res.data)
            })
            .then(todolists => {
                todolists.forEach(tl => {
                    dispatch(fetchTasksTC(tl.id))
                })

            })
    }
}*/

/*export const removeTodolistTC_ = (todolistId: string) => {
    return (dispatch: Dispatch) => {
        //изменим глобальный статус приложения, чтобы вверху полоса побежала
        dispatch(setAppStatusAC({status: 'loading'}))
        //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
        dispatch(changeTodolistEntityStatusAC({id: todolistId, status: 'loading'}))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                dispatch(removeTodolistAC({id: todolistId}))
                //скажем глобально приложению, что асинхронная операция завершена
                dispatch(setAppStatusAC({status: 'succeeded'}))
            })
    }
}*/

/*export const addTodolistTC_ = (title: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                dispatch(addTodolistAC({todolist: res.data.data.item}))
                dispatch(setAppStatusAC({status: 'succeeded'}))
            })
    }
}*/

/*export const changeTodolistTitleTC_ = (id: string, title: string) => {
    return (dispatch: Dispatch) => {
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(changeTodolistTitleAC({id: id, title: title}))
            })
    }
}*/

// types
/*export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
export type ClearDataActionType = ReturnType<typeof clearDataAC>;
export type TodolistsActionsType =
    | RemoveTodolistActionType
    | AddTodolistActionType
    | ReturnType<typeof changeTodolistTitleAC>
    | ReturnType<typeof changeTodolistFilterAC>
    | SetTodolistsActionType
    | ReturnType<typeof changeTodolistEntityStatusAC>
    | ClearDataActionType*/
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
