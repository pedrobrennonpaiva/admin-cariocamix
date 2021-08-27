import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";
import Footer from '../components/Footer';
import Header from '../components/Header';
import Coupons from '../screens/Coupons';
import Home from '../screens/Home';
import Login from '../screens/Login';
import NotFound from '../screens/NotFound';
import Orders from '../screens/Orders';
import PaymentTypes from '../screens/PaymentTypes';
import Products from '../screens/Products';
import Profile from '../screens/Profile';
import Stores from '../screens/Stores';
import Users from '../screens/Users';
import { Session } from '../services/session';

const PrivateRoute = ({ component: Component, ...rest } : any) => (
    <Route
      {...rest}
      render={props =>
        Session.isAuthenticated() ? 
        (
            <div className={`div-root`}>
                <Header />

                <Component {...props} />

                <Footer />
            </div>
        ) : 
        (
            <Redirect 
                to={{ pathname: "/login" }} 
                {...props} 
            />
        )
      }
    />
);

// const PrivateRouteComponent = ({ component: Component, ...rest } : any) => (
//     <Route
//       {...rest}
//       render={props =>
//         Session.isAuthenticated() ? 
//         (
//             <Component {...props} />
//         ) : 
//         (
//             <Redirect 
//                 to={{ pathname: "/login" }} 
//                 {...props} 
//             />
//         )
//       }
//     />
// );

export const AppNavigator = () => {
    return (
        <Router>
            <Switch>
                <Route exact path={['/login']} component={Login} />
                <PrivateRoute exact path={['/']} component={Home} />
                <PrivateRoute exact path={['/perfil']} component={Profile} />
                <PrivateRoute exact path={['/pedidos']} component={Orders} />
                <PrivateRoute exact path={['/usuarios']} component={Users} />
                <PrivateRoute exact path={['/produtos']} component={Products} />
                <PrivateRoute exact path={['/lojas']} component={Stores} />
                <PrivateRoute exact path={['/pagamento']} component={PaymentTypes} />
                <PrivateRoute exact path={['/cupons']} component={Coupons} />
                <Route path="*" component={NotFound} />
            </Switch>
        </Router>
    )
}
