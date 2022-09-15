import {AuthActionsType, setIsLoggedInAC} from '../features/Login/auth-reducer';
import {authAPI} from '../api/todolists-api';
import {Dispatch} from 'redux';

const initialState: InitialStateType = {
    status: 'idle',
    error: null,
    isInitialized: false
}

//reducer
export const appReducer = (state: InitialStateType = initialState, action: AppActionsType): InitialStateType => {
    switch (action.type) {
        case 'APP/SET-STATUS':
            return {...state, status: action.status}
        case 'APP/SET-ERROR':
            return {...state, error: action.error}
        case 'APP/SET-INITIALIZED':
            return {...state, isInitialized: true}
        default:
            return {...state}
    }
}

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export type InitialStateType = {
    // происходит ли сейчас взаимодействие с сервером
    status: RequestStatusType
    // если ошибка какая-то глобальная произойдёт - мы запишем текст ошибки сюда
    error: string | null
    //сделан ли запрос на сервер с проверкой авторизации
    isInitialized: boolean
}

//types
export type AppActionsType =
    | SetAppErrorActionType
    | SetAppStatusActionType
    | SetInitializingStatusActionType

export type SetAppErrorActionType = ReturnType<typeof setAppErrorAC>
export type SetAppStatusActionType = ReturnType<typeof setAppStatusAC>
export type SetInitializingStatusActionType = ReturnType<typeof setIsInitializedAC>

//action creators
export const setAppErrorAC = (error: string | null) => ({type: 'APP/SET-ERROR', error} as const)
export const setAppStatusAC = (status: RequestStatusType) => ({type: 'APP/SET-STATUS', status} as const)
export const setIsInitializedAC = () => ({type: 'APP/SET-INITIALIZED'} as const)

//thunk creators
export const initializeAppTC = () => (dispatch: Dispatch<AppActionsType | AuthActionsType>) => {
    authAPI.me().then(res => {
        if (res.data.resultCode === 0) {
            dispatch(setIsLoggedInAC(true));
        } else {
            dispatch(setAppErrorAC(res.data.messages[0]))
        }
        dispatch(setIsInitializedAC())
    })
}



