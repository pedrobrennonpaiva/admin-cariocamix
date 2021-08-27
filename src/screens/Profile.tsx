import React, { useEffect, useState } from 'react';
import { Tab, Row, Col, Nav, Spinner, Modal, Form } from "react-bootstrap";
import { useHistory } from 'react-router-dom';
import Alert from '../components/Alert';
import Api from '../services/api';
import { Session } from '../services/session';
import { Utils } from '../configs/Utils';
import { Validations } from '../configs/Validations';
import { Admin, AdminAuthenticate } from '../models/Admin';
import styles from '../styles/profile.module.css';
import AdminComponent from '../components/screens/AdminComponent';

const Profile = () => {

    //#region update profile

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [birthday, setBirthday] = useState('');
    const [numberPhone, setNumberPhone] = useState('');
    const [email, setEmail] = useState('');

    const [nameError, setNameError] = useState('');
    const [birthdayError, setBirthdayError] = useState('');
    const [numberPhoneError, setNumberPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');

    const [btnDisable, setBtnDisable] = useState(false);
    const [btnTxt, setBtnTxt] = useState<string | object>();

    //#endregion

    //#region change password

    const [password, setPassword] = useState('');

    const [passwordError, setPasswordError] = useState('');
    
    const [inputPassword, setInputPassword] = useState('password');
    const [btnTxtPassword, setBtnTxtPassword] = useState<string | object>();
    const [btnDisablePassword, setBtnDisablePassword] = useState(false);
    const [showModalPassword, setShowModalPassword] = useState(false);
    const [showModalLogout, setShowModalLogout] = useState(false);

    //#endregion

    const [admin, setAdmin] = useState({} as Admin);
    const history = useHistory();
    const api = new Api();

    useEffect(() => {

        AdminLogged();

        setBtnTxt('Atualizar perfil');
        setBtnTxtPassword('Atualizar senha');
    }, []);

    const AdminLogged = () => {

        if(Session.isAuthenticated())
        {
            var sessionAdmin = Session.getAdmin() as AdminAuthenticate;
            var token = Session.getToken() as string;

            if(token === sessionAdmin.token)
            {
                if(sessionAdmin.tokenExpires < new Date())
                {
                    Utils.alertLocalStorage('Faça login novamente!', false);
                    Session.logout();
                    history.push('/login');
                }

                const getAdmin = async (id: string) => {

                    await api.getAdminById(id)
                    .then(res => {
                        var admin = res as Admin;
                        setName(admin.name);
                        setEmail(admin.email);
                        setBirthday(Utils.formatDate(admin.birthday.toString()));
                        setUsername(admin.username);
                        setNumberPhone(Utils.numberPhoneMask(admin.numberPhone));

                        setAdmin(admin);
                    })
                    .catch(err => {
                        console.log(err);
                    });
                }
                getAdmin(sessionAdmin.id);
            }
        }
        else {
            Utils.alertLocalStorage('Usuário não logado', false);
            history.push('/login');
        }
    }

    const handleLogout = () => {

        Utils.alertLocalStorage('Logout concluído com sucesso!', true);
        Session.logout();
        history.push('/login');
    }

    const handleUpdatePassword = () => {

        setBtnDisablePassword(true);
        setBtnTxtPassword(<Spinner animation="grow" variant="light" size="sm" />);

        var pError = Validations.validatePassword(password);

        if(pError)
        {
            setPasswordError(pError);
            setBtnDisablePassword(false);
            setBtnTxtPassword('Atualizar senha');
        }
        else
        {
            const changePassword = async () => {
    
                await api.resetPasswordAdmin(admin.id, password)
                    .then(_ => {
                        Utils.alertLocalStorage('Senha atualizada com sucesso!', true);
                        setBtnDisablePassword(false);
                        setBtnTxtPassword('Atualizar senha');
                        handleCloseModal();
                    })
                    .catch(err => {
                        console.log(err);
                        Utils.alertLocalStorage(`Ocorreu um erro ao atualizar a senha! Tente novamente!`, false);
                        setBtnDisablePassword(false);
                        setBtnTxtPassword('Atualizar senha');
                    });
            }
            changePassword();
        }
    }

    const handleUpdateProfile = (event: React.FormEvent<HTMLFormElement>) => {
        
        event?.preventDefault();
        setBtnDisable(true);
        setBtnTxt(<Spinner animation="grow" variant="light" size="sm" />);

        var nameError = Validations.validateRequiredField(name, 'nome');
        var birthdayError = Validations.validateRequiredField(birthday, 'data de nascimento');
        var numberPhoneError = Validations.validateRequiredField(numberPhone, 'número de telefone');
        var emailError = Validations.validateRequiredField(email, 'e-mail');

        if(nameError || birthdayError || numberPhoneError || emailError)
        {
            setNameError(nameError);
            setBirthdayError(birthdayError);
            setNumberPhoneError(numberPhoneError);
            setEmailError(emailError);

            setBtnDisable(false);
            setBtnTxt('Atualizar perfil');
        }
        else 
        {
            const api = new Api();
            
            const update = async () => {
                
                var newAdmin: Admin = {
                    id: admin.id,
                    registerDate: admin.registerDate,
                    name: name,
                    username: username,
                    email: email,
                    birthday: birthday,
                    numberPhone: numberPhone,
                    isActive: admin.isActive,
                    isRoot: admin.isRoot,
                    image: admin.image,
                    password: null, 
                };
                
                await api.updateAdmin(newAdmin)
                .then(_ => {
                    Utils.alertLocalStorage('Usuário atualizado com sucesso!', true);

                    setBtnDisable(false);
                    setBtnTxt('Atualizar perfil');
                })
                .catch(error => {
                    console.log(error);
                    Utils.alertLocalStorage(`Ocorreu um erro ao atualizar!`, false);

                    setBtnDisable(false);
                    setBtnTxt('Atualizar perfil');
                });
            }
            update();
        }
    }

    const handleChangeNumberPhone = (e: any) => setNumberPhone(Utils.numberPhoneMask(e.target.value));
    const changeInputPassword = () => setInputPassword(inputPassword === 'password' ? 'text' : 'password');
    const handleCloseModal = () => setShowModalPassword(false);
    const handleOpenModal = () => setShowModalPassword(true);
    const handleCloseModalLogout = () => setShowModalLogout(false);
    const handleOpenModalLogout = () => setShowModalLogout(true);

    return (
        <div>
            <Alert />

            <Modal 
                show={showModalLogout} 
                onHide={handleCloseModalLogout}
                centered
            >
                <Modal.Header>
                    <Modal.Title>Sair</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Deseja realmente sair?
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <button className={`${styles.btn}`} onClick={handleCloseModalLogout}>
                        Cancelar
                    </button>
                    <button 
                        className={`${styles.btn_primary}`} 
                        onClick={handleLogout}
                    >
                        Fazer logout
                    </button>
                </Modal.Footer>
            </Modal>
            
            <Modal 
                show={showModalPassword} 
                onHide={handleCloseModal}
                centered
            >
                <Modal.Header>
                    <Modal.Title>Atualizar senha</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="formPassword" className={`d-flex flex-column align-items-start`}>
                        <Form.Label>Senha</Form.Label>
                        <Form.Control 
                            type={inputPassword} 
                            placeholder="Digite sua nova senha" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Form.Text className="text-danger">
                            {passwordError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formCheckbox" className={`d-flex align-items-start`}>
                        <Form.Check type="checkbox" label="Mostrar senha" onClick={changeInputPassword} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <button className={`${styles.btn}`} onClick={handleCloseModal}>
                        Fechar
                    </button>
                    <button 
                        className={`${styles.btn_primary}`} 
                        onClick={handleUpdatePassword}
                        disabled={btnDisablePassword}
                    >
                        {btnTxtPassword}
                    </button>
                </Modal.Footer>
            </Modal>

            <div className={`p-4`}>
                <Tab.Container id="left-tabs-example" defaultActiveKey="profile">
                    <Row>
                        <Col sm={3}>
                            <Nav variant="pills" className="flex-column">
                                <Nav.Item>
                                    <Nav.Link className={`nav_link`} eventKey="profile">Meu perfil</Nav.Link>
                                </Nav.Item>
                                {admin.isRoot ? 
                                <Nav.Item>
                                    <Nav.Link className={`nav_link`} eventKey="admins">Admins</Nav.Link>
                                </Nav.Item> : ''}
                                <Nav.Item>
                                    <Nav.Link className={`nav_link`} onClick={handleOpenModalLogout}>Sair</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col sm={9}>
                            <Tab.Content>
                                <Tab.Pane eventKey="admins">
                                    <AdminComponent />
                                </Tab.Pane>
                                <Tab.Pane eventKey="profile">
                                    <h3 className={`${styles.h_title} mb-3`}>Perfil</h3>

                                    <Form onSubmit={handleUpdateProfile}>

                                        <Form.Group controlId="formName" className={`d-flex flex-column align-items-start`}>
                                            <Form.Label>Nome</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                placeholder="Digite seu nome" 
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                            <Form.Text className="text-danger">
                                                {nameError}
                                            </Form.Text>
                                        </Form.Group>

                                        <Form.Group controlId="formusername" className={`d-flex flex-column align-items-start`}>
                                            <Form.Label>username</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                placeholder="Digite seu username" 
                                                value={username}
                                                onChange={(e) => setUsername(Utils.onlyLetterMask(e.target.value))} 
                                            />
                                        </Form.Group>

                                        <Form.Group controlId="formNumberPhone" className={`d-flex flex-column align-items-start`}>
                                            <Form.Label>Telefone</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                placeholder="Digite seu número de telefone" 
                                                value={numberPhone}
                                                onChange={handleChangeNumberPhone}
                                                maxLength={15}
                                            />
                                            <Form.Text className="text-danger">
                                                {numberPhoneError}
                                            </Form.Text>
                                        </Form.Group>

                                        <Form.Group controlId="formBirthday" className={`d-flex flex-column align-items-start`}>
                                            <Form.Label>Data de nascimento</Form.Label>
                                            <Form.Control 
                                                type="date" 
                                                placeholder="Digite seu aniversário" 
                                                value={birthday}
                                                onChange={(e) => setBirthday(e.target.value)}
                                            />
                                            <Form.Text className="text-danger">
                                                {birthdayError}
                                            </Form.Text>
                                        </Form.Group>

                                        <Form.Group controlId="formEmail" className={`d-flex flex-column align-items-start`}>
                                            <Form.Label>E-mail</Form.Label>
                                            <Form.Control 
                                                type="email" 
                                                placeholder="Digite seu e-mail ou username" 
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                            <Form.Text className="text-danger">
                                                {emailError}
                                            </Form.Text>
                                        </Form.Group>
                                        
                                        <div className={`mt-3`}>
                                            <button 
                                                type='submit' 
                                                className={`${styles.btn_primary}`}
                                                disabled={btnDisable}
                                            >
                                                {btnTxt}
                                            </button>

                                            <button 
                                                type="button" 
                                                className={`${styles.btn} mt-md-0 mt-2 ms-md-2 ms-0`} 
                                                onClick={handleOpenModal}
                                            >
                                                Alterar senha
                                            </button>
                                        </div>
                                    </Form>
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>
        </div>
    )
}

export default Profile;