/**
 * Main store function
 */
import { createStore, applyMiddleware, compose } from "redux";
import { createLogger } from "redux-logger";
import thunk from "redux-thunk";

import rootReducer from "./reducers";

export default function configStore(initialState = {}): any {
  // Middleware and store enhancers
  const enhancers = [applyMiddleware(thunk)];

  if (process.env.NODE_ENV !== "production") {
    enhancers.push(applyMiddleware(createLogger()));
    // window.__REDUX_DEVTOOLS_EXTENSION__ &&
    //   enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__())
  }

  const store = createStore(rootReducer, initialState, compose(...enhancers));

  // For hot reloading reducers
  // if (module.hot) {
  //   // Enable Webpack hot module replacement for reducers
  //   module.hot.accept('./reducers', () => {
  //     const nextReducer = rootReducer
  //     store.replaceReducer(nextReducer)
  //   })
  // }

  return store;
}
