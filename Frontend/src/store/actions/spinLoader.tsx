import { SPIN_LOADERS } from "store/actions";



const spinLoaderShow = (payload: any) => {
  return {
    type: SPIN_LOADERS,
    payload: payload
  };

}
export { spinLoaderShow };