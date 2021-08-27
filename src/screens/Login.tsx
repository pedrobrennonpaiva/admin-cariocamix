import React, { useState, useEffect } from 'react';
import { Card, Form, Spinner } from 'react-bootstrap';
import { Validations } from '../configs/Validations';
import { useHistory } from "react-router-dom";
import { Props } from '../configs/Props';
import Alert from '../components/Alert';
import Api from '../services/api';
import { Session } from '../services/session';

import { AuthenticateModel } from '../models/Authenticate';

import logo from '../assets/logo.png';
import styles from '../styles/login.module.css';
import { Utils } from '../configs/Utils';
import { AdminAuthenticate } from '../models/Admin';

const Login = (props: Props) => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [inputPassword, setInputPassword] = useState('password');
    const [btnTxt, setBtnTxt] = useState<string | object>();
    
    const api = new Api();
    const history = useHistory();

    useEffect(() => {
        setBtnTxt("Entrar");
    }, []);

    const changeInputPassword = () => setInputPassword(inputPassword === 'password' ? 'text' : 'password');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        
        event?.preventDefault();
        setBtnTxt(<Spinner animation="grow" variant="light" size="sm" />);

        var uError = Validations.validateUsername(username);
        var pError = Validations.validatePassword(password);

        if(uError || pError)
        {
            setUsernameError(uError);
            setPasswordError(pError);
            setBtnTxt("Entrar");
        }
        else
        {
            const login = async () => {

                var model: AuthenticateModel = {
                    username, 
                    password
                }

                await api.authenticateAdmin(model)
                    .then(res => {
                        var userLogged = res.data as AdminAuthenticate;

                        Session.login(userLogged.token, userLogged);
                        Utils.alertLocalStorage('Usuário logado com sucesso!', true);
                        history.push('/');
                    })
                    .catch(error => {
                        console.log(error);
                        setBtnTxt("Entrar");
                        Utils.alertLocalStorage("Usuário ou senha inválidos", false);
                    });
            }
            login();
        }
    }
    
    return (
        <div className={`${styles.div_full}`}>

            <Alert state={props.location.state} />

            <Card body className={`${styles.card_login}`}>
                <div className={`${styles.div_img_logo} mb-3`}>
                    <img 
                        src={logo} 
                        className={`${styles.img_logo} img-fluid center`} 
                        alt='Carioca Mix Logo'
                    />
                </div>

                <Form onSubmit={handleSubmit}>
                    <Form.Group className={`${styles.form_group_login}`}>
                        <Form.Label className={`${styles.form_label_login}`}>
                            Username ou E-mail
                        </Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Digite seu e-mail ou username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={`${styles.form_control_login}`}
                        />
                        <Form.Text className="text-danger">
                            {usernameError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className={`${styles.form_group_login}`}>
                        <Form.Label className={`${styles.form_label_login}`}>
                            Senha
                        </Form.Label>
                        <Form.Control 
                            type={inputPassword} 
                            placeholder="Digite sua senha" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`${styles.form_control_login}`}
                        />
                        <Form.Text className="text-danger">
                            {passwordError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formCheckbox" className={`d-flex align-items-start`}>
                        <Form.Check type="checkbox" label="Mostrar senha" onClick={changeInputPassword} />
                    </Form.Group>

                    <div className={`text-center mt-3`}>
                        <button type="submit" className={`${styles.btn_login}`}>
                            {btnTxt}
                        </button>
                    </div>
                </Form>
            </Card>
        </div>
    )
}

export default Login;