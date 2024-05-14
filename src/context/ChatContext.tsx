import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import runChat from "../config/gemini";
import React from 'react';

interface State {
  prevPrompts: string[];
  input: string;
  recentPrompt: string;
  showResult: boolean;
  loading: boolean;
  resultData: string;
}

const initialState: State = {
  prevPrompts: [],
  input: "",
  recentPrompt: "",
  showResult: false,
  loading: false,
  resultData: "",
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setPrevPrompts: (state, action: PayloadAction<string[]>) => {
      state.prevPrompts = action.payload;
    },
    setInput: (state, action: PayloadAction<string>) => {
      state.input = action.payload;
    },
    setRecentPrompt: (state, action: PayloadAction<string>) => {
      state.recentPrompt = action.payload;
    },
    setShowResult: (state, action: PayloadAction<boolean>) => {
      state.showResult = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setResultData: (state, action: PayloadAction<string>) => {
      state.resultData = action.payload;
    },
  },
});

export const { setPrevPrompts, setInput, setRecentPrompt, setShowResult, setLoading, setResultData } = chatSlice.actions;

export const store = configureStore({
  reducer: chatSlice.reducer,
});

export const Context = createContext(null);

const ContextProvider = (props) => {
  const dispatch = useDispatch();
  const state = useSelector((state: State) => state);

  useEffect(() => {
    const delayPara = (index: number, nextWord: string) => {
      setTimeout(() => {
        dispatch(setResultData(prev => prev + nextWord));
      }, 75 * index);
    };

    const onSent = async (prompt?: string) => {
      dispatch(setResultData(""));
      dispatch(setLoading(true));
      dispatch(setShowResult(true));
      let response;
      if (prompt !== undefined) {
        response = await runChat(prompt);
        dispatch(setRecentPrompt(prompt));
      } else {
        dispatch(setPrevPrompts(prev => [...prev, state.input]));
        dispatch(setRecentPrompt(state.input));
        response = await runChat(state.input);
      }
      let responseArray = response.split('**');
      let newArray = "";
      for (let i = 0; i < responseArray.length; i++) {
        if (i === 0 || i % 2 !== 1) {
          newArray += responseArray[i];
        } else {
          newArray += "<b>" + responseArray[i] + "</b>";
        }
      }
      console.log(newArray);
      responseArray = newArray.split('*').join("</br>").split(" ");
      for (let i = 0; i < responseArray.length; i++) {
        const nextWord = responseArray[i];
        delayPara(i, nextWord + " ");
      }
      dispatch(setLoading(false));
      dispatch(setInput(""));
    };

    const newChat = async () => {
      dispatch(setLoading(false));
      dispatch(setShowResult(false));
    };
  }, [dispatch, state.input]);

  return (
    <Context.Provider value={state}>
      {props.children}
    </Context.Provider>
  );
};

export default ContextProvider;