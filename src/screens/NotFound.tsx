import React from 'react';
import styles from '../styles/login.module.css';
import logo from '../assets/logo.png';
import { Card } from 'react-bootstrap';

const NotFound = () => {

    return (
        <div className={`${styles.div_full}`}>

            <Card body className={`${styles.card_login}`}>
                <div className={`${styles.div_img_logo} mb-3`}>
                    <img 
                        src={logo} 
                        className={`${styles.img_logo} img-fluid center`} 
                        alt='Logo CariocaMix'
                    />
                </div>

                <div className={`text-center`}>
                    <h4 className={`${styles.h_registration}`}>Página não encontrada!</h4>
                </div>
            </Card>
        </div>
    )
}

export default NotFound;