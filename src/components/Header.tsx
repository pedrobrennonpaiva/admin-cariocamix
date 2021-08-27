import { Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/header.module.css';
import logo from '../assets/logo.png';
import { Session } from '../services/session';

const Header = () => {

    return (
        <Navbar className={`${styles.header}`} expand='md' collapseOnSelect>
            <Navbar.Brand as={Link} to='/' className={`${styles.navbar_brand}`}>
                <img 
                    className={`${styles.img_logo} img-fluid`} 
                    src={logo}
                    alt='Logo'
                />
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="navbar-nav" className={`${styles.nav_toggle}`} />

            <Navbar.Collapse id="navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link as={Link} to="/" className={`${styles.nav_link}`}>Início</Nav.Link>
                    <Nav.Link as={Link} to="/pedidos" className={`${styles.nav_link}`}>Pedidos</Nav.Link>
                    <Nav.Link as={Link} to="/usuarios" className={`${styles.nav_link}`}>Usuários</Nav.Link>
                    <Nav.Link as={Link} to="/produtos" className={`${styles.nav_link}`}>Produtos</Nav.Link>
                </Nav>
                <Nav className="ml-auto ms-auto align-items-center">
                    {Session.isAuthenticated() && Session.getAdmin()?.store ? 
                    <span className={`${styles.span_admin_store}`}>
                        Loja {Session.getAdmin()?.store?.name}
                    </span> : ''}
                    <Nav.Link as={Link} to="/perfil" className={`${styles.nav_link}`}>
                        <FontAwesomeIcon icon={faUser} className={`${styles.nav_icon}`} />
                    </Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    )
}

export default Header;