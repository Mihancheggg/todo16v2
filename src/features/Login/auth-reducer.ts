import {Dispatch} from 'redux'
import {
    AppActionsType,
    SetAppErrorActionType,
    setAppStatusAC,
    SetAppStatusActionType,
    setIsInitializedAC
} from '../../app/app-reducer'
import {authAPI, LoginParamsType} from '../../api/todolists-api';
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils';
import {addTaskAC} from '../TodolistsList/tasks-reducer';
import {clearDataAC, TodolistsActionsType} from '../TodolistsList/todolists-reducer';

const initialState = {
    isLoggedIn: false
}
type InitialStateType = typeof initialState

export const authReducer = (state: InitialStateType = initialState, action: AuthActionsType): InitialStateType => {
    switch (action.type) {
        case 'login/SET-IS-LOGGED-IN':
            return {...state, isLoggedIn: action.value}
        default:
            return state
    }
}
// actions
export const setIsLoggedInAC = (value: boolean) =>
    ({type: 'login/SET-IS-LOGGED-IN', value} as const)

// thunks
export const loginTC = (email: string, password: string, rememberMe?: boolean, captcha?: boolean) => (dispatch: Dispatch<AuthActionsType| SetAppErrorActionType | SetAppStatusActionType>) => {
    dispatch(setAppStatusAC('loading'))
    authAPI.login(email, password, rememberMe, captcha)
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(setIsLoggedInAC(true))
                dispatch(setAppStatusAC('succeeded'))
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}

export const logoutTC = () => (dispatch: Dispatch<AuthActionsType | AppActionsType>) => {
    dispatch(setAppStatusAC('loading'))
    authAPI.logout()
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(setIsLoggedInAC(false))
                dispatch(clearDataAC())
                dispatch(setAppStatusAC('succeeded'))
                /*dispatch(setIsInitializedAC())*/
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}


// types
export type AuthActionsType = ReturnType<typeof setIsLoggedInAC> | SetAppStatusActionType | SetAppErrorActionType | TodolistsActionsType
