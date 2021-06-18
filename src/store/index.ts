import { applyMiddleware, Store } from "redux";
import { createLogger } from "redux-logger";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

import createSagaMiddleware from "redux-saga";
import { createInjectorsEnhancer } from "redux-injectors";
import { createReducer } from "./reducers";
import { initialState as authInitialState } from "./auth/reducer";
import { initialState as globalInitialState } from "./global/reducer";

export default function configureAppStore() {
  const reduxSagaMonitorOptions = {};
  const sagaMiddleware = createSagaMiddleware(reduxSagaMonitorOptions);
  const { run: runSaga } = sagaMiddleware;

  // Create the store with saga middleware
  const middlewares = [sagaMiddleware];
  // Middleware and store enhancers

  const enhancers = [
    createInjectorsEnhancer({
      createReducer,
      runSaga,
    }),
  ];

  if (process.env.NODE_ENV !== "production") {
    enhancers.push(applyMiddleware(createLogger()));
    // window.__REDUX_DEVTOOLS_EXTENSION__ &&
    //   enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__())
  }

  const store = configureStore({
    reducer: createReducer(),
    middleware: [...getDefaultMiddleware(), ...middlewares],
    devTools:
      /* istanbul ignore next line */
      process.env.NODE_ENV !== "production",
    enhancers,
    preloadedState: {
      global: globalInitialState,
      auth: authInitialState,
    },
  });

  window.store = store;

  return store;
}
