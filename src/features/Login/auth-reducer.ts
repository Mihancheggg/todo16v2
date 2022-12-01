import { Dispatch } from 'redux'
import { setAppStatusAC } from '../../app/app-reducer'
import { authAPI } from '../../api/todolists-api';
import { handleServerAppError, handleServerNetworkError } from '../../utils/error-utils';
import { clearDataAC } from '../TodolistsList/todolists-reducer';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
    isLoggedIn: false
}

const slice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setIsLoggedInAC(state, action: PayloadAction<{ value: boolean }>) {
            state.isLoggedIn = action.payload.value
        },
    }
})

export const {setIsLoggedInAC} = slice.actions

export const authReducer = slice.reducer/*(state: InitialStateType = initialState, action: AuthActionsType): InitialStateType => {
    switch (action.type) {
        case 'login/SET-IS-LOGGED-IN':
            return {...state, isLoggedIn: action.value}
        default:
            return state
    }
}*/
// actions
/*export const setIsLoggedInAC = (value: boolean) =>
    ({type: 'login/SET-IS-LOGGED-IN', value} as const)*/

// thunks
export const loginTC = (email: string, password: string, rememberMe?: boolean, captcha?: boolean) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    authAPI.login(email, password, rememberMe, captcha)
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(setIsLoggedInAC({value: true}))
                dispatch(setAppStatusAC({status: 'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}

export const logoutTC = () => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    authAPI.logout()
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(setIsLoggedInAC({value: false}))
                dispatch(clearDataAC())
                dispatch(setAppStatusAC({status: 'succeeded'}))
                /*dispatch(setIsInitializedAC())*/
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
