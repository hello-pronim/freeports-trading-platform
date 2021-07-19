import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useGlobalSlice } from "../slice";

function useTheme(): any {
  const dispatch = useDispatch();

  const { actions } = useGlobalSlice();
  const { theme } = useSelector(
    (state: any) => ({
      theme: state.global.theme,
    }),
    shallowEqual
  );

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    dispatch(actions.setTheme(newTheme));
  };

  return {
    toggleTheme,
    theme,
  };
}

export default useTheme;
