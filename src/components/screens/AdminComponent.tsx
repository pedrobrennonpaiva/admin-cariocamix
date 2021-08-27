import React, { useEffect, useMemo, useState } from "react";
import { Form, InputGroup, Modal, Spinner, Table } from "react-bootstrap";
import { faSearch, faSyncAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select, { ValueType } from "react-select";
import Alert from "../Alert";
import { Utils } from "../../configs/Utils";
import { Validations } from "../../configs/Validations";
import { Admin } from "../../models/Admin";
import { Store } from "../../models/Store";
import { SelectModel } from "../../models/utils/SelectModel";
import Api, { STORE_URL } from "../../services/api";
import styles from '../../styles/default.module.css';

const AdminComponent = () => {

    const [search, setSearch] = useState("");
    const [admins, setAdmins] = useState([] as Admin[]);
    const [productUpd, setAdminUpd] = useState({} as Admin);
    const [initAdmins, setInitAdmins] = useState([] as Admin[]);
    
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [birthday, setBirthday] = useState("");
    const [numberPhone, setNumberPhone] = useState("");
    const [email, setEmail] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [store, setStore] = useState<SelectModel | null>();
    const [optionStore, setOptionStore] = useState<SelectModel[]>();

    const [nameError, setNameError] = useState("");
    const [birthdayError, setBirthdayError] = useState("");
    const [numberPhoneError, setNumberPhoneError] = useState("");
    const [emailError, setEmailError] = useState("");

    const [idUpdate, setIdUpdate] = useState("");
    const [idRemove, setIdRemove] = useState("");
    
    const [btnDisableAdd, setBtnDisableAdd] = useState(false);
    const [btnTxtAdd, setBtnTxtAdd] = useState<string | object>("Adicionar");
    const [showModalAdd, setShowModalAdd] = useState(false);
    
    const [btnDisableRemove, setBtnDisableRemove] = useState(false);
    const [btnTxtRemove, setBtnTxtRemove] = useState<string | object>("Remover");
    const [showModalRemove, setShowModalRemove] = useState(false);

    const api = useMemo(() => new Api(), []);
    
    useEffect(() => {
        
        const getAdmins = async () => {

            await api.getAdmin().then(res => {
                setAdmins(res);
                setInitAdmins(res);
            });
        }
        getAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const results = initAdmins?.filter(cp =>
            cp.name.toLowerCase().includes(search.toLowerCase()) ||
            cp.username.toLowerCase().includes(search.toLowerCase()) ||
            cp.email.toLowerCase().includes(search.toLowerCase())
        );
        setAdmins(results);
    }, [initAdmins, search]);

    useEffect(() => {
        
        const getStores = async () => {

            await api.get(STORE_URL)
            .then(res => {

                const stores = res as Store[];

                var modelSelect = new Array<SelectModel>();
                var noneSel = new SelectModel('', 'Nenhuma loja selecionada');
                modelSelect.push(noneSel);

                stores!.forEach(g => {   
                    var cSel = new SelectModel(g.id, g.name);
                    modelSelect.push(cSel);
                });
                setOptionStore(modelSelect);
            })
            .catch(err => {
            });
        }
        getStores();
    }, [api]);

    const handleStore = (event: ValueType<SelectModel, false>) => setStore(event);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const handleAdd = async () => {

        setBtnDisableAdd(true);
        setBtnTxtAdd(<Spinner animation="grow" variant="light" size="sm" />);

        var nError = Validations.validateRequiredField(name, "nome");
        var bError = Validations.validateRequiredField(birthday, "data de nascimento");
        var nbError = Validations.validateRequiredField(numberPhone, "telefone");
        var eError = Validations.validateRequiredField(email, "email");

        if(nError || bError || nbError || eError)
        {
            setNameError(nError);
            setBirthdayError(bError);
            setNumberPhoneError(nbError);
            setEmailError(eError);
            setBtnDisableAdd(false);
            setBtnTxtAdd(idUpdate !== '' ? 'Atualizar' : 'Adicionar');
        }
        else
        {
            if(idUpdate === '')
            {
                var model = new Admin();
                model.name = name;
                model.username = username;
                model.birthday = birthday;
                model.numberPhone = Utils.removeDiacritics(numberPhone);
                model.email = email;
                model.isActive = isActive;
                model.isRoot = false;
                model.storeId = store?.value;

                const addAdmin = async () => {

                    await api.insertAdmin(model)
                    .then(resp => {
                        const cpn = resp.data.data as Admin;

                        Utils.alertLocalStorage('Admin inserido com sucesso!', true);
                        setBtnDisableAdd(false);
                        setBtnTxtAdd('Adicionar');
                        setAdmins([...admins, cpn]);
                        setInitAdmins([...initAdmins, cpn]);
                        handleModalAddUpd(false);
                    })
                    .catch(err => {
                        Utils.alertLocalStorage(`Ocorreu um erro ao adicionar!`, false);
                        console.log(err);
                        setBtnDisableAdd(false);
                        setBtnTxtAdd('Adicionar');
                    });
                }
                
                await addAdmin();
            }
            else 
            {
                productUpd.id = idUpdate;
                productUpd.name = name;
                productUpd.username = username;
                productUpd.birthday = birthday;
                productUpd.numberPhone = Utils.removeDiacritics(numberPhone);
                productUpd.email = email;
                productUpd.isActive = isActive;
                productUpd.isRoot = false;
                productUpd.storeId = store?.value;
                
                const update = async () => {
                    await api.updateAdmin(productUpd)
                    .then(res => {
                        const cpn = res.data.data as Admin;

                        Utils.alertLocalStorage('Admin atualizado com sucesso!', true);
                        setBtnDisableAdd(false);
                        setBtnTxtAdd('Atualizar');
                        const newCpn = initAdmins;
                        const index = initAdmins.findIndex(x => x.id === cpn.id);
                        newCpn[index] = cpn;
                        setAdmins([...newCpn]);
                        setInitAdmins([...newCpn]);
                        handleModalAddUpd(false);
                    })
                    .catch(err => {
                        Utils.alertLocalStorage(`${err.data.message}`, false);
                        setBtnDisableAdd(false);
                        setBtnTxtAdd('Atualizar');
                    });
                }
                
                await update();
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
            await api.deleteAdmin(idRemove)
            .then(_ => {
                Utils.alertLocalStorage('Admin removido com sucesso!', true);
                setBtnDisableRemove(false);
                setBtnTxtRemove('Remover');

                const newCpn = initAdmins.filter((x) => x.id !== idRemove);
                setAdmins(newCpn);
                setInitAdmins(newCpn);
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

        if(isOpen && id !== '')
        {
            setBtnTxtAdd('Atualizar');
            await api.getAdminById(id)
            .then(res => {
                const cpn = res as Admin;

                setAdminUpd(cpn);
                setName(cpn.name);
                setUsername(cpn.username);
                setNumberPhone(Utils.numberPhoneMask(cpn.numberPhone));
                setBirthday(Utils.formatDate(cpn.birthday.toString()));
                setEmail(cpn.email);
                setStore(optionStore?.find(x => x.value === cpn.storeId));

                setIdUpdate(id !== '' ? id : idUpdate);
                setShowModalAdd(isOpen);
            })
            .catch(err => {
                console.log(err);
                Utils.alertLocalStorage('Ocorreu um erro ao pegar os dados do admin', false);
                setShowModalAdd(false);
            });
        }
        else
        {
            setBtnTxtAdd(isOpen ? 'Adicionar' : btnTxtAdd);
            setIdUpdate('');
            setName('');
            setUsername('');
            setBirthday('');
            setNumberPhone('');
            setEmail('');
            setNameError('');
            setBirthdayError('');
            setEmailError('');
            setNumberPhoneError('');
            setStore(null);
            setIsActive(true);

            setShowModalAdd(isOpen);
        }
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
    
    return (
        <div>

            <Alert />

            <Modal 
                show={showModalAdd} 
                onHide={() => handleModalAddUpd(false)}
                centered
            >
                <Modal.Header>
                    <Modal.Title>
                        Adicionar/Atualizar admin
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

                    <Form.Group className={`mb-2`}>
                        <Form.Label>Loja administrada</Form.Label>
                        <Select 
                            value={store} 
                            onChange={(e: ValueType<SelectModel, false>) => handleStore(e)}
                            options={optionStore} 
                            placeholder='Selecione a loja (se necessário)'
                            menuPlacement='bottom'
                            menuPosition='fixed'
                        />
                    </Form.Group>

                    <Form.Group controlId="formIsActive">
                        <Form.Check 
                            type="checkbox" 
                            label="Ativo"
                            checked={isActive} 
                            onChange={() => setIsActive(!isActive)} 
                        />
                    </Form.Group>

                </Modal.Body>
                <Modal.Footer>
                    <button className={`button`} onClick={() => handleModalAddUpd(false)}>
                        Cancelar
                    </button>
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
                        Remover admin
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
                    Administradores
                </h3>
            </div>

            <div className={`${styles.div_btns}`}>
                <button
                    onClick={() => handleModalAddUpd(true)}
                    className={`button ${styles.btn_add} me-md-2 me-0`}
                >
                    Adicionar admin
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
                {admins?.length > 0 ? 
                    <Table className={`${styles.table}`} responsive>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Nascimento</th>
                                <th>Telefone</th>
                                <th>Email</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map((model, key) => (
                                <tr key={key}>
                                    <td>
                                        {model.name}
                                    </td>
                                    <td>
                                        {Utils.dateMask(model.birthday.toString())}
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
                                                name='Atualizar' 
                                            />
                                        </button>
                                        <button 
                                            className={`button ms-2`} 
                                            onClick={() => handleModalRemove(true, model.id)}
                                        >
                                            <FontAwesomeIcon 
                                                icon={faTrash} 
                                                className={`${styles.table_icon}`}
                                                name='Apagar'
                                            />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                : <div><p>Nenhum administrador adicionado.</p></div>}
            </div>
        </div>
    )
}

export default AdminComponent;