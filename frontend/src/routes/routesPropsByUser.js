import HomeViewContainer from '../containers/HomeViewContainer.jsx';
import AddProjectViewContainer from '../containers/AddProjectViewContainer.jsx';

const routes = [
    {
        exact: true,
        path:"/",
        component:HomeViewContainer,
        key:"HomeViewContainer",
    },
    {
        exact: true,
        path:"/project/add",
        component:AddProjectViewContainer,
        key:"AddProjectViewContainer",
    },
]


export default routes;