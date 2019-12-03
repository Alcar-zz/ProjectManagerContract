import HomeViewContainer from '../containers/HomeViewContainer.jsx';
import AddProjectViewContainer from '../containers/AddProjectViewContainer.jsx';
import ProjectViewContainer from '../containers/ProjectViewContainer.jsx';

export const addRoute = {
    exact: true,
    path:"/project/add",
    component:AddProjectViewContainer,
    key:"AddProjectViewContainer",
};

const routes = [
    {
        exact: true,
        path:"/",
        component:HomeViewContainer,
        key:"HomeViewContainer",
    },
    {
        exact: true,
        path:"/project/address/:address",
        component:ProjectViewContainer,
        key:"ProjectViewContainer",
    },
]


export default routes;