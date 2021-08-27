import { faSearch, faSyncAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Form, InputGroup, Modal, Spinner, Table } from "react-bootstrap";
import Alert from "../components/Alert";
import { Props } from "../configs/Props";
import { Utils } from "../configs/Utils";
import { Validations } from "../configs/Validations";
import { User } from "../models/User";
import Api from "../services/api";

import styles from '../styles/default.module.css';

const Users = (props: Props) => {

    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([] as User[]);
    const [userUpd, setUserUpd] = useState({} as User);
    const [initUsers, setInitUsers] = useState([] as User[]);
    
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [birthday, setBirthday] = useState("");
    const [cpf, setCpf] = useState("");
    const [numberPhone, setNumberPhone] = useState("");
    const [email, setEmail] = useState("");
    
    const [nameError, setNameError] = useState("");
    const [birthdayError, setBirthdayError] = useState("");
    const [cpfError, setCpfError] = useState("");
    const [numberPhoneError, setNumberPhoneError] = useState("");
    const [emailError, setEmailError] = useState("");
    
    const [idUpdate, setIdUpdate] = useState("");
    const [idRemove, setIdRemove] = useState("");
    const [emailForgotPassword, setEmailForgotPassword] = useState("");
    
    const [btnDisableAdd, setBtnDisableAdd] = useState(false);
    const [btnTxtAdd, setBtnTxtAdd] = useState<string | object>("Adicionar");
    const [showModalAdd, setShowModalAdd] = useState(false);
    
    const [btnDisableRemove, setBtnDisableRemove] = useState(false);
    const [btnTxtRemove, setBtnTxtRemove] = useState<string | object>("Remover");
    const [showModalRemove, setShowModalRemove] = useState(false);

    const api = new Api();

    useEffect(() => {
        
        const getUsers = async () => {

            await api.getUser().then(res => {
                setUsers(res);
                setInitUsers(res);
            });
        }
        getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const results = initUsers?.filter(cp =>
            cp.name.toLowerCase().includes(search.toLowerCase())
        );
        setUsers(results);
    }, [initUsers, search]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const handleAdd = async () => {

        setBtnDisableAdd(true);
        setBtnTxtAdd(<Spinner animation="grow" variant="light" size="sm" />);

        var nError = Validations.validateRequiredField(name, "nome");
        var bError = Validations.validateRequiredField(birthday, "data de nascimento");
        var cError = Validations.validateRequiredField(cpf, "CPF");
        var nbError = Validations.validateRequiredField(numberPhone, "telefone");
        var eError = Validations.validateRequiredField(email, "email");

        if(nError || bError || cError || nbError || eError)
        {
            setNameError(nError);
            setBirthdayError(bError);
            setCpfError(cError);
            setNumberPhoneError(nbError);
            setEmailError(eError);
            setBtnDisableAdd(false);
            setBtnTxtAdd(idUpdate !== '' ? 'Atualizar' : 'Adicionar');
        }
        else
        {
            if(idUpdate === '')
            {
                var model = new User();
                model.name = name;
                model.username = username;
                model.birthday = birthday;
                model.cpf = Utils.removeDiacritics(cpf);
                model.numberPhone = Utils.removeDiacritics(numberPhone);
                model.email = email;
                
                await api.insertUser(model)
                .then(res => {
                    const cpn = res.data.data as User;
                    Utils.alertLocalStorage('Usuário inserido com sucesso!', true);
                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Adicionar');
                    setUsers([...users, cpn]);
                    setInitUsers([...initUsers, cpn]);
                    handleModalAddUpd(false);
                })
                .catch(_ => {
                    Utils.alertLocalStorage(`Ocorreu um erro ao adicionar!`, false);

                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Adicionar');
                });
            }
            else 
            {
                userUpd.name = name;
                userUpd.username = username;
                userUpd.birthday = birthday;
                userUpd.cpf = Utils.removeDiacritics(cpf);
                userUpd.numberPhone = Utils.removeDiacritics(numberPhone);
                userUpd.email = email;
                
                await api.updateUser(userUpd)
                .then(res => {
                    const cpn = res.data.data as User;
                    Utils.alertLocalStorage('Usuário atualizado com sucesso!', true);
                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Atualizar');
                    const newCpn = initUsers.filter((x) => x.id !== cpn.id);
                    setUsers([...newCpn, cpn]);
                    setInitUsers([...newCpn, cpn]);
                    handleModalAddUpd(false);
                })
                .catch(_ => {
                    Utils.alertLocalStorage(`Ocorreu um erro ao atualizar!`, false);

                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Atualizar');
                });
            }
        }
    }

    const handleRemove = async () => {

        if(idRemove === '')
        {
            Utils.alertLocalStorage(`Ocorreu um erro ao remover!`, false);
            handleModalRemove(false);
        }
        else
        {   
            await api.deleteUser(idRemove)
            .then(_ => {
                Utils.alertLocalStorage('Usuário removido com sucesso!', true);
                setBtnDisableRemove(false);
                setBtnTxtRemove('Remover');

                const newCpn = initUsers.filter((x) => x.id !== idRemove);
                setUsers(newCpn);
                setInitUsers(newCpn);
                handleModalRemove(false);
            })
            .catch(err => {
                console.log(err);
                Utils.alertLocalStorage(`Ocorreu um erro ao remover!`, false);
                
                setBtnDisableRemove(false);
                setBtnTxtRemove('Remover');
                handleModalRemove(false);
            });
        }
    }

    const handleModalAddUpd = async (isOpen: boolean, id: string = '') => {

        if(id !== '')
        {
            setBtnTxtAdd('Atualizar');
            await api.getUserById(id)
            .then(res => {
                const cpn = res as User;
                setUserUpd(cpn);
                setName(cpn.name);
                setUsername(cpn.username);
                setNumberPhone(Utils.numberPhoneMask(cpn.numberPhone));
                setCpf(Utils.cpfMask(cpn.cpf));
                setBirthday(Utils.formatDate(cpn.birthday.toString()));
                setEmail(cpn.email);
                setEmailForgotPassword(cpn.email);
                setIdUpdate(id !== '' ? id : idUpdate);
            })
            .catch(err => {
                console.log(err);
                Utils.alertLocalStorage('Ocorreu um erro ao pegar os dados do usuário', false);
                setShowModalAdd(false);
            });
        }
        else
        {
            setBtnTxtAdd('Adicionar');
            setIdUpdate('');
            setName('');
        }
        setShowModalAdd(isOpen);
    }

    const handleModalRemove = (isRemove: boolean, id: string = '') => {

        setIdRemove(id !== '' ? id : idRemove);
        setShowModalRemove(isRemove);
    }

    const handleKeypress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
          handleAdd();
        }
    }

    const handleForgotPassword = async () => {

        if(!idUpdate && !emailForgotPassword)
        {
            alert('Você só pode atualizar a senha com um usuário selecionado!');
            return;
        }
        
        await api.forgotPasswordUser(emailForgotPassword)
                .then(_ => {
                    Utils.alertLocalStorage('Senha atualizada com sucesso!', true);
                })
                .catch(err => {
                    console.log(err);
                    Utils.alertLocalStorage(`Ocorreu um erro ao atualizar a senha! Tente novamente!`, false);
                });
    }

    return (
        <div className={`px-4`}>

            <Alert state={props.location.state} />

            <Modal 
                show={showModalAdd} 
                onHide={() => handleModalAddUpd(false)}
                centered
            >
                <Modal.Header>
                    <Modal.Title>
                        Adicionar usuário
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body onKeyPress={handleKeypress}>
                    <Form.Group className={`mb-2`}>
                        <Form.Label>Nome</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Digite o nome" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Form.Text className="text-danger">
                            {nameError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className={`mb-2`}>
                        <Form.Label>Username</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Digite o username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        />
                    </Form.Group>

                    <Form.Group className={`mb-2`}>
                        <Form.Label>Data de nascimento</Form.Label>
                        <Form.Control 
                            type="date" 
                            placeholder="Digite a data de nascimento" 
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                        />
                        <Form.Text className="text-danger">
                            {birthdayError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className={`mb-2`}>
                        <Form.Label>CPF</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Digite o cpf" 
                            value={cpf}
                            onChange={(e) => setCpf(Utils.cpfMask(e.target.value))}
                            minLength={14}
                            maxLength={14}
                        />
                        <Form.Text className="text-danger">
                            {cpfError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className={`mb-2`}>
                        <Form.Label>Telefone</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Digite o telefone" 
                            value={numberPhone}
                            onChange={(e) => setNumberPhone(Utils.numberPhoneMask(e.target.value))}
                            minLength={14}
                            maxLength={14}
                        />
                        <Form.Text className="text-danger">
                            {numberPhoneError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className={`mb-2`}>
                        <Form.Label>Email</Form.Label>
                        <Form.Control 
                            type="email" 
                            placeholder="Digite o email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Form.Text className="text-danger">
                            {emailError}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <button className={`button`} onClick={() => handleModalAddUpd(false)}>
                        Cancelar
                    </button>
                    {idUpdate ? <button 
                        className={`button`} 
                        onClick={handleForgotPassword}
                    >
                        Enviar nova senha
                    </button>
                    : ''}
                    <button 
                        className={`button`} 
                        onClick={handleAdd}
                        disabled={btnDisableAdd}
                    >
                        {btnTxtAdd}
                    </button>
                </Modal.Footer>
            </Modal>

            <Modal 
                show={showModalRemove} 
                onHide={() => handleModalRemove(false)}
                centered
            >
                <Modal.Header>
                    <Modal.Title>
                        Remover usuário
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Tem certeza que deseja remover?</p>
                </Modal.Body>
                <Modal.Footer>
                    <button className={`button`} onClick={() => handleModalRemove(false)}>
                        Cancelar
                    </button>
                    <button 
                        className={`button`} 
                        onClick={handleRemove}
                        disabled={btnDisableRemove}
                    >
                        {btnTxtRemove}
                    </button>
                </Modal.Footer>
            </Modal>

            <div>
                <h3 className={`title`}>
                    Usuários
                </h3>
            </div>

            <div className={`${styles.div_btns}`}>
                <button
                    onClick={() => handleModalAddUpd(true)}
                    className={`button ${styles.btn_add} me-md-2 me-0`}
                >
                    Adicionar usuário
                </button>
                <InputGroup className={`mt-2 mt-md-0`}>
                    <Form.Control 
                        type="text"
                        placeholder="Pesquise aqui..."
                        value={search}
                        onChange={handleChange}
                    />
                    <button className={`button`}>
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </InputGroup>
            </div>

            <div className={`mt-3`}>
                {users?.length > 0 ? 
                    <Table className={`${styles.table}`} responsive>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Nascimento</th>
                                <th>CPF</th>
                                <th>Telefone</th>
                                <th>Email</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((model, key) => (
                                <tr key={key}>
                                    <td>
                                        {model.name}
                                    </td>
                                    <td>
                                        {Utils.dateMask(model.birthday.toString())}
                                    </td>
                                    <td>
                                        {Utils.cpfMask(model.cpf)}
                                    </td>
                                    <td>
                                        {Utils.numberPhoneMask(model.numberPhone)}
                                    </td>
                                    <td>
                                        {model.email}
                                    </td>
                                    <td align='right'>
                                        <button 
                                            className={`button`}
                                            onClick={() => handleModalAddUpd(true, model.id)}
                                        >
                                            <FontAwesomeIcon 
                                                icon={faSyncAlt} 
                                                className={`${styles.table_icon}`}
                                                title='Atualizar' 
                                            />
                                        </button>
                                        <button 
                                            className={`button ms-2`} 
                                            onClick={() => handleModalRemove(true, model.id)}
                                        >
                                            <FontAwesomeIcon 
                                                icon={faTrash} 
                                                className={`${styles.table_icon}`}
                                                title='Apagar'
                                            />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                : <div><p>Nenhum usuário adicionado.</p></div>}
            </div>
        </div>
    )
}

export default Users;