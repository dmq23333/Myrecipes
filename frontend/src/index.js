import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import rootReducer from './components/info';
import { createStore } from 'redux';

import SignIn from './pages/login';
import SignUp from './pages/signUp';
import Dashboard from './pages/dashboard';
// import { useSelector } from 'react-redux';
import Profile from './pages/Profile';
import NewRecipe from './pages/NewRecipe';
import SearchResult from './pages/SearchResult';
import UpdateProfile from './pages/UpdateProfile';
import EditRecipe from './pages/EditRecipe';
import ViewRecipe from './pages/ViewRecipe';
import ViewCategories from './pages/ViewCategories';
import ViewFollowing from './pages/ViewFollowing';

const store = createStore(rootReducer);
const token = sessionStorage.getItem('token');
  // add restrictions on whether the page is private
const publicRoutes = [
    {
      path: '/login', exact: true, name: 'Login', component: SignIn,
    },
    {
      path: '/signUp', exact: true, name: 'Signup', component: SignUp,
    },
    {
      path: '/', exact: true, name: 'index', component: App,
    },
    {
      path: '/dashboard', exact: true, name: 'dashboard', component: Dashboard,
    },
  ];
  
const protectedRoutes = [
    {
      path: '/profile', exact: true, name: 'profile', component: Profile,
    },
    {
      path: '/profile/:username', exact: true, name: 'profileName', component: Profile,
    },
    {
      path: '/createRecipe', exact: true, name: 'createRecipe', component: NewRecipe,
    },
    {
      path: '/searchResult/:query', exact: true, name: 'SearchResult', component: SearchResult,
    },
    {
      path: '/updateProfile', exact: true, name: 'UpdateProfile', component: UpdateProfile,
    },
    {
      path: '/editRecipe/:rid', exact: true, name: 'EditRecipe', component: EditRecipe,
    },
    {
      path: '/viewRecipe/:rid', exact: true, name: 'ViewRecipe', component: ViewRecipe,
    },
    {
      path: '/viewCategories/:mealType', exact: true, name: 'viewCategories', component: ViewCategories,
    },
    {
      path: '/fans/:username', exact: true, name: 'ViewFollowing', component: ViewFollowing,
    },
  ];
ReactDOM.render(
  <Provider store={store}>
    <Router>
      {/* <Route path="/" component={App} /> */}
        <Switch>
        {publicRoutes.map((route, idx) => (route.component ? (
          <Route
          key={idx}
          path={route.path}
          exact={route.exact}
          name={route.name}
          render={props => (
          <route.component {...props} />
          )}
          />
        )
        : (null)))}

        {protectedRoutes.map((route, idx) => (route.component ? (
              <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  render={props => (
                    token
                      ? <route.component {...props} />
                      : <Redirect to="/login" />
                    )}
              />
          )
          : (null)))}
          
      </Switch>
    </Router>
  </Provider>,
  document.getElementById('root'),
);
